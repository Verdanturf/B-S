# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, WebSocket, WebSocketDisconnect, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Optional
from PIL import Image as PILImage
from jose import JWTError, jwt
import os
import uuid
import shutil
import asyncio

import models, schemas, crud, security, database
import ai

# 初始化
models.Base.metadata.create_all(bind=database.engine)
os.makedirs("static/originals", exist_ok=True)
os.makedirs("static/thumbnails", exist_ok=True)

app = FastAPI()

# --- 强制给静态资源加 CORS 头 (解决 Canvas 保存报错) ---
@app.middleware("http")
async def force_static_cors(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/static/"):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_log(self, message: str, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except Exception:
                pass 

manager = ConnectionManager()

# API 跨域配置
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",  # 正则匹配，比 ["*"] 更强，且兼容 credentials=True
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态目录
app.mount("/static", StaticFiles(directory="static"), name="static")

# 依赖
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

# 工具函数
def _convert_to_degrees(value):
    d = float(value[0]); m = float(value[1]); s = float(value[2])
    return d + (m / 60.0) + (s / 3600.0)

def get_gps_location(exif_data):
    if not exif_data: return None
    gps_info = exif_data.get(34853)
    if not gps_info: return None
    try:
        lat_ref = gps_info.get(1); lat_dms = gps_info.get(2)
        lon_ref = gps_info.get(3); lon_dms = gps_info.get(4)
        if lat_dms and lon_dms and lat_ref and lon_ref:
            lat = _convert_to_degrees(lat_dms); lon = _convert_to_degrees(lon_dms)
            if lat_ref == "S": lat = -lat
            if lon_ref == "W": lon = -lon
            return f"{lat:.4f}, {lon:.4f}"
    except Exception: pass
    return None

def process_image(file_path, thumb_path):
    info = {"resolution": "Unknown", "date": None, "location": "Unknown"}
    try:
        with PILImage.open(file_path) as img:
            width, height = img.size
            info["resolution"] = f"{width}x{height}"
            exif_raw = img._getexif()
            if exif_raw:
                date_str = exif_raw.get(36867) 
                if date_str:
                    try: info["date"] = datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
                    except ValueError: pass
                gps_loc = get_gps_location(exif_raw)
                if gps_loc: info["location"] = gps_loc
            img.thumbnail((300, 300))
            img.save(thumb_path)
    except Exception as e: print(f"Error: {e}")
    return info

# --- 接口定义 ---

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect: manager.disconnect(client_id)

@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if len(user.password) < 6: raise HTTPException(status_code=400, detail="密码太短")
    if crud.get_user_by_username(db, user.username): raise HTTPException(status_code=400, detail="用户已存在")
    if crud.get_user_by_email(db, user.email): raise HTTPException(status_code=400, detail="邮箱已注册")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Auth Failed")
    token = security.create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=30))
    return {"access_token": token, "token_type": "bearer"}

@app.post("/upload/", response_model=schemas.ImageResponse)
async def upload_image(file: UploadFile = File(...), description: str = Form(None), client_id: str = Form(...), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    await manager.send_log(f"🚀 接收: {file.filename}...", client_id)
    file_ext = file.filename.split(".")[-1]
    unique_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = f"static/originals/{unique_name}"
    thumb_path = f"static/thumbnails/{unique_name}"
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    await manager.send_log("💾 保存成功", client_id)
    
    try:
        await manager.send_log("📸 处理图片...", client_id)
        img_info = await asyncio.to_thread(process_image, file_path, thumb_path)
    except Exception: raise HTTPException(status_code=400, detail="处理失败")

    await manager.send_log("🧠 AI 识别中...", client_id)
    ai_tags = await asyncio.to_thread(ai.analyze_image, file_path)
    await manager.send_log(f"🤖 标签: {ai_tags}", client_id)

    final_loc = img_info["location"]; final_date = img_info["date"]
    if description:
        await manager.send_log("📝 分析文本...", client_id)
        text_info = await asyncio.to_thread(ai.analyze_text, description)
        if final_loc == "Unknown" and text_info.get("location"): final_loc = text_info["location"]
        if final_date is None and text_info.get("date"): final_date = text_info["date"]

    await manager.send_log("✅ 完成", client_id)
    return crud.create_user_image(db, schemas.ImageBase(description=description), current_user.id, unique_name, unique_name, img_info["resolution"], final_date, ai_tags, final_loc)

@app.get("/my-images/", response_model=list[schemas.ImageResponse])
def read_images(skip: int=0, limit: int=100, u: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_images_by_user(db, u.id, skip, limit)

@app.get("/search/", response_model=list[schemas.ImageResponse])
def search(q: str, u: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.search_images(db, u.id, q)

@app.get("/images/{image_id}", response_model=schemas.ImageResponse)
def read_one(image_id: int, u: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    img = crud.get_image_by_id(db, image_id, u.id)
    if not img: raise HTTPException(status_code=404, detail="Not Found")
    return img

@app.put("/images/{image_id}/content")
async def update_content(image_id: int, file: UploadFile = File(...), u: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    img = crud.get_image_by_id(db, image_id, u.id)
    if not img: raise HTTPException(status_code=404)
    path = f"static/originals/{img.filename}"
    thumb = f"static/thumbnails/{img.thumbnail}"
    with open(path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    try:
        with PILImage.open(path) as pi:
            img.resolution = f"{pi.width}x{pi.height}"
            pi.thumbnail((300, 300)); pi.save(thumb)
        db.commit()
    except Exception: raise HTTPException(status_code=500)
    return {"status": "ok"}

# --- 修改图片元数据接口 ---
# 这个接口负责接收前端发来的描述、地点、时间修改
@app.put("/images/{image_id}", response_model=schemas.ImageResponse)
def update_metadata(image_id: int, data: schemas.ImageUpdate, u: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    img = crud.get_image_by_id(db, image_id, u.id)
    if not img: raise HTTPException(status_code=404, detail="Not Found")
    return crud.update_image_metadata(db, img, data)
# ------------------------------

@app.delete("/images/{image_id}", status_code=204)
def delete_img(image_id: int, u: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    img = crud.get_image_by_id(db, image_id, u.id)
    if not img: raise HTTPException(status_code=404)
    crud.delete_image_by_id(db, img)
# backend/crud.py
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
import os
import models, schemas, security

# --- 用户相关 ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- 图片相关 ---
def create_user_image(db: Session, image: schemas.ImageBase, user_id: int, filename: str, thumbnail: str, resolution: str, capture_date: datetime = None, ai_tags: str = None, location: str = "Unknown"):
    db_image = models.Image(
        **image.dict(),
        user_id=user_id,
        filename=filename,
        thumbnail=thumbnail,
        resolution=resolution,
        capture_date=capture_date,
        location=location,
        ai_tags=ai_tags
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

def get_images_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Image).filter(models.Image.user_id == user_id).offset(skip).limit(limit).all()

def get_image_by_id(db: Session, image_id: int, user_id: int):
    return db.query(models.Image).filter(models.Image.id == image_id, models.Image.user_id == user_id).first()

# 更新图片元数据
def update_image_metadata(db: Session, db_image: models.Image, update_data: schemas.ImageUpdate):
    if update_data.description is not None:
        db_image.description = update_data.description
    if update_data.location is not None:
        db_image.location = update_data.location
    if update_data.capture_date is not None:
        db_image.capture_date = update_data.capture_date
    
    db.commit()
    db.refresh(db_image)
    return db_image

def delete_image_by_id(db: Session, db_image: models.Image):
    try:
        original_path = os.path.join("static", "originals", db_image.filename)
        thumbnail_path = os.path.join("static", "thumbnails", db_image.thumbnail)
        if os.path.exists(original_path):
            os.remove(original_path)
        if os.path.exists(thumbnail_path):
            os.remove(thumbnail_path)
    except Exception as e:
        print(f"删除文件失败: {e}")
    db.delete(db_image)
    db.commit()
    return True

def search_images(db: Session, user_id: int, query_str: str):
    return db.query(models.Image).filter(
        models.Image.user_id == user_id,
        or_(
            models.Image.description.contains(query_str),
            models.Image.ai_tags.contains(query_str),
            models.Image.location.contains(query_str),
            models.Image.filename.contains(query_str)
        )
    ).all()
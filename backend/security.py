# backend/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# 配置：密钥（真实项目中要保密，这里随便写）和算法
SECRET_KEY = "my_secret_key_for_photo_project_change_this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Token 有效期30分钟

# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1. 验证密码：比较用户输入的明文密码和数据库里的哈希密码是否匹配
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 2. 加密密码：把明文密码变成哈希值
def get_password_hash(password):
    return pwd_context.hash(password)

# 3. 创建 Token：把用户信息（比如 user_id）打包加密成一个字符串
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    # 将过期时间放入 payload
    to_encode.update({"exp": expire})
    
    # 生成 JWT 字符串
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
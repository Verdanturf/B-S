# backend/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- 用户模型 ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- 图片模型 ---
class ImageBase(BaseModel):
    description: Optional[str] = None

# 用于更新图片信息的模型
class ImageUpdate(BaseModel):
    description: Optional[str] = None
    location: Optional[str] = None
    capture_date: Optional[datetime] = None

class ImageResponse(ImageBase):
    id: int
    filename: str
    thumbnail: str
    capture_date: Optional[datetime]
    location: Optional[str]
    resolution: Optional[str]
    ai_tags: Optional[str]
    class Config:
        from_attributes = True

# --- Token 模型 ---
class Token(BaseModel):
    access_token: str
    token_type: str
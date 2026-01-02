# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True) # 用户名唯一
    email = Column(String, unique=True, index=True)    # 邮箱唯一
    password_hash = Column(String)                     # 存加密后的密码
    created_at = Column(DateTime, default=datetime.datetime.now)

    # 关联：一个用户有多张图片
    images = relationship("Image", back_populates="owner")

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # 外键关联用户
    
    # 文件存储信息
    filename = Column(String)      # 原图文件名 (如 uuid.jpg)
    thumbnail = Column(String)     # 缩略图文件名
    
    # EXIF 信息 
    upload_time = Column(DateTime, default=datetime.datetime.now)
    capture_date = Column(DateTime, nullable=True) # 拍摄时间
    location = Column(String, nullable=True)       # 拍摄地点
    resolution = Column(String, nullable=True)     # 分辨率 (如 1920x1080)
    
    # 增强功能字段
    ai_tags = Column(String, nullable=True)        # 存 AI 识别的标签，用逗号分隔
    description = Column(Text, nullable=True)      # 用户写的描述

    # 关联
    owner = relationship("User", back_populates="images")
    tags = relationship("Tag", back_populates="image", cascade="all, delete-orphan")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"))
    tag_name = Column(String, index=True) # 自定义标签名 
    
    image = relationship("Image", back_populates="tags")
# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 定义数据库地址：使用 SQLite，文件名为 photos.db
# check_same_thread=False 是 SQLite 在多线程环境下的特殊配置
SQLALCHEMY_DATABASE_URL = "sqlite:///./photos.db"

# 创建引擎
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 创建会话工厂，后续每个请求都会用它产生一个会话(Session)来操作数据库
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类，所有的数据库模型（表）都要继承这个类
Base = declarative_base()
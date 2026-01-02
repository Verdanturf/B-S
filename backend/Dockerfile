# 锁定使用 Debian Bookworm (稳定版)，比 Trixie (测试版) 稳定得多
FROM python:3.10-slim-bookworm

WORKDIR /app

# 更换为华为云镜像源 (通常比阿里/清华更稳)，并修改新版 deb822 源格式
RUN sed -i 's/deb.debian.org/repo.huaweicloud.com/g' /etc/apt/sources.list.d/debian.sources \
    && sed -i 's/security.debian.org/repo.huaweicloud.com/g' /etc/apt/sources.list.d/debian.sources

# 添加 -o Acquire::Retries=5 参数，网络不好自动重试 5 次
RUN apt-get update && apt-get install -y -o Acquire::Retries=5 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# 4. 安装 CPU 版 PyTorch (保持之前的优化)
RUN pip install --no-cache-dir --default-timeout=1000 torch torchvision --index-url https://download.pytorch.org/whl/cpu

# 5. 安装其他依赖
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
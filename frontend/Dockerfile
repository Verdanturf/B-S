# 第一阶段：构建 (Build Stage)
FROM node:22-alpine AS build-stage

WORKDIR /app

# 复制 package.json 并安装依赖
COPY package.json package-lock.json* ./
RUN npm install

# 复制源代码并构建
COPY . .
RUN npm run build

# 第二阶段：生产环境 (Production Stage)
FROM nginx:stable-alpine as production-stage

# 复制第一阶段构建好的 dist 文件夹到 Nginx 目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制自定义的 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
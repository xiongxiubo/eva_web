# ---------- build stage ----------
FROM node:22-alpine AS build

WORKDIR /app

# 先拷贝依赖声明文件，利用缓存
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 再拷贝源码
COPY . .

# 构建生产版本
RUN yarn build

# ---------- production stage ----------
FROM nginx:1.25-alpine

# 拷贝构建产物
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./ssl /etc/nginx/ssl
# 如果你有自定义 nginx.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]

FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production
COPY . .
EXPOSE 3030
CMD ["node", "server.js"]

FROM node:18-alpine

# 作業ディレクトリ
WORKDIR /app

# 1. 依存関係ファイルのみをコピーし、インストール
#    (キャッシュが効きやすくなり、高速化されます)
COPY package*.json ./
RUN npm install --omit=dev

# 2. サーバーコードをコピー
COPY server.js .

# 3. WSサーバーが使用するポート(3001)を公開
EXPOSE 3001

# 4. サーバーの起動
CMD ["npm", "run", "start"]
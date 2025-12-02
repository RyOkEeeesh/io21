# Raspberry Pi でも動く軽量 Node.js
FROM node:20-slim

# 作業ディレクトリ
WORKDIR /app

# 依存関係を先にコピーしてインストール
COPY package*.json ./
RUN npm install

# プロジェクト全体をコピー
COPY . .

# Next.js が /data を見れるように、docker-compose でボリュームをマウントする

# ポートを開放
EXPOSE 3000

# 開発用コマンド
CMD ["npm", "run", "dev"]

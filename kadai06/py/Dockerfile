FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .

# 1. ビルドに必要なシステムツールをインストール
#    (gccとpython3-devはRPi.GPIOなどをビルドするために必要)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        python3-dev \
        build-essential && \
    rm -rf /var/lib/apt/lists/*

# 2. 依存関係のインストールを実行
RUN pip install --no-cache-dir -r requirements.txt

# 3. ビルドツールをアンインストールしてイメージを軽量化
#    (※ 実行時には不要なため)
RUN apt-get remove -y \
        gcc \
        python3-dev \
        build-essential && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 4. スクリプト本体をコピー
COPY script.py . 
COPY dht11 ./dht11 

CMD ["python", "-u", "script.py"]
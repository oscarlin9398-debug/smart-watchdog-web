FROM python:3.12-slim

WORKDIR /app

# 安裝基本相依套件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製後端程式碼與機構資料庫
COPY . .

# 開啟 8000 連接埠
EXPOSE 8000

# 啟動 FastAPI (相容 AWS ECS Fargate 健康檢查)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Hugging Face Spaces require running on port 7860
CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "7860"]

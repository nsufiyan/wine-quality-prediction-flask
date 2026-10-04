FROM python:3.11-slim

WORKDIR  /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt 

COPY . .

EXPOSE 5000

CMD ["python", "wine_quality_backend_flask.py"]


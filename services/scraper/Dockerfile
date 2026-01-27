FROM python:3.11-slim

RUN useradd -m -u 1000 scraperuser
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

USER scraperuser

CMD ["python", "-m", "src"]

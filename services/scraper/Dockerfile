FROM python:3.11-slim

# Instalar dependencias del sistema, Google Chrome y crear usuario
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    unzip \
    ca-certificates \
    --no-install-recommends \
    && curl -fsSL --proto =https https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y \
    google-chrome-stable \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 scraperuser

WORKDIR /app

COPY requirements.txt .

# Instalar paquetes Python y preparar directorios para dependencias en runtime
RUN pip install --no-cache-dir -r requirements.txt && \
    mkdir -p /usr/local/lib/python3.11/site-packages/botasaurus_requests/bin && \
    chown -R scraperuser:scraperuser /usr/local/lib/python3.11/site-packages/botasaurus_requests/bin

COPY src/ ./src/

# Ajustar permisos finales y cambiar a usuario no-root
RUN chown -R scraperuser:scraperuser /app
USER scraperuser

CMD ["python", "-m", "src"]

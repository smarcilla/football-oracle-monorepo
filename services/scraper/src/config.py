import os

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://localhost:5672")
EXCHANGE = "football_oracle"

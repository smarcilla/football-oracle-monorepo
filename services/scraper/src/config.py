import os

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "scraper-group")
KAFKA_CLIENT_ID = os.getenv("KAFKA_CLIENT_ID", "scraper-service")

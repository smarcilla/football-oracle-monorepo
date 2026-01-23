import json
from confluent_kafka import Producer, Consumer, KafkaError
from src.config import KAFKA_BROKERS, KAFKA_GROUP_ID, KAFKA_CLIENT_ID

_producer = None


def get_producer():
    global _producer
    if _producer is None:
        _producer = Producer({
            "bootstrap.servers": KAFKA_BROKERS,
            "client.id": KAFKA_CLIENT_ID
        })
    return _producer


def publish(topic: str, message: dict):
    producer = get_producer()
    producer.produce(
        topic,
        value=json.dumps(message).encode("utf-8")
    )
    producer.flush()
    print(f"[Kafka] Published to {topic}: {message}")


def subscribe(topic: str, handler):
    consumer = Consumer({
        "bootstrap.servers": KAFKA_BROKERS,
        "group.id": KAFKA_GROUP_ID,
        "auto.offset.reset": "earliest"
    })

    consumer.subscribe([topic])
    print(f"[Kafka] Subscribed to {topic}")

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                elif msg.error().code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
                    # Topic might not be created yet, ignore and keep polling
                    continue
                else:
                    print(f"[Kafka] Error: {msg.error()}")
                    break

            message = json.loads(msg.value().decode("utf-8"))
            print(f"[Kafka] Received from {topic}: {message}")
            handler(message)
    finally:
        consumer.close()

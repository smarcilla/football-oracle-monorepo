import json
from confluent_kafka import Producer, Consumer, KafkaError
from src.config import KAFKA_BROKERS, KAFKA_GROUP_ID, KAFKA_CLIENT_ID

_producer = None


def get_producer():
    global _producer
    if _producer is None:
        _producer = Producer({
            "bootstrap.servers": KAFKA_BROKERS,
            "client.id": KAFKA_CLIENT_ID,
            "linger.ms": 0,  # Entrega inmediata
            "acks": "all"
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


def _process_message(msg, handler):
    if msg.error():
        if msg.error().code() == KafkaError._PARTITION_EOF:
            return True
        elif msg.error().code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
            # Topic might not be created yet, ignore and keep polling
            return True
        else:
            print(f"[Kafka] Error: {msg.error()}")
            return False

    topic = msg.topic()
    message = json.loads(msg.value().decode("utf-8"))
    print(f"[Kafka] Received from {topic}: {message}")
    
    if isinstance(handler, dict):
        h = handler.get(topic)
        if h:
            h(message)
        else:
            print(f"[Kafka] No handler for topic {topic}")
    elif handler:
        handler(message)
    return True


def subscribe(topics, handler=None):
    """
    Subscribe to one or more topics. 
    topics can be a string or a list of strings.
    If handler is a dict, it maps topic names to handler functions.
    """
    consumer = Consumer({
        "bootstrap.servers": KAFKA_BROKERS,
        "group.id": KAFKA_GROUP_ID,
        "auto.offset.reset": "earliest",
        "enable.auto.commit": True,
        "fetch.min.bytes": 1,
        "fetch.wait.max.ms": 500,
    })

    if isinstance(topics, str):
        topics_list = [topics]
    else:
        topics_list = topics

    consumer.subscribe(topics_list)
    print(f"[Kafka] Subscribed to {topics_list}")

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if not _process_message(msg, handler):
                break
    finally:
        consumer.close()

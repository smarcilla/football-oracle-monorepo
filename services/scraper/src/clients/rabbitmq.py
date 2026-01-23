import json
import pika
from urllib.parse import urlparse
from src.config import RABBITMQ_URL, EXCHANGE

connection = None
channel = None


def connect():
    global connection, channel

    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

    print("[RabbitMQ] Connected and exchange ready")
    return channel


def publish(routing_key: str, message: dict):
    global channel
    if not channel:
        raise Exception("RabbitMQ not connected")

    body = json.dumps(message)
    channel.basic_publish(
        exchange=EXCHANGE,
        routing_key=routing_key,
        body=body,
        properties=pika.BasicProperties(delivery_mode=2),
    )
    print(f"[RabbitMQ] Published to {routing_key}: {message}")


def subscribe(routing_key: str, handler):
    global channel
    if not channel:
        raise Exception("RabbitMQ not connected")

    result = channel.queue_declare(queue="", exclusive=True)
    queue_name = result.method.queue

    channel.queue_bind(exchange=EXCHANGE, queue=queue_name, routing_key=routing_key)

    print(f"[RabbitMQ] Subscribed to {routing_key}")

    def callback(ch, method, properties, body):
        message = json.loads(body)
        print(f"[RabbitMQ] Received from {routing_key}: {message}")
        handler(message)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(queue=queue_name, on_message_callback=callback)


def start_consuming():
    global channel
    print("[RabbitMQ] Waiting for messages...")
    channel.start_consuming()


def close():
    global connection
    if connection:
        connection.close()

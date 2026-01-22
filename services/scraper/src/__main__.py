import time
from src.clients.rabbitmq import connect, subscribe, start_consuming
from src.handlers.analysis import handle_analysis_requested


def main():
    print("[Scraper] Starting service...")

    # Retry connection with backoff
    max_retries = 10
    for i in range(max_retries):
        try:
            connect()
            break
        except Exception as e:
            print(f"[Scraper] Connection failed, retry {i + 1}/{max_retries}: {e}")
            time.sleep(2)
    else:
        raise Exception("Could not connect to RabbitMQ")

    subscribe("match.analysis_requested", handle_analysis_requested)

    start_consuming()


if __name__ == "__main__":
    main()

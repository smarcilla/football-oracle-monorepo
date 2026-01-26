from src.clients.kafka import subscribe
from src.handlers.analysis import handle_analysis_requested


def main():
    print("[Scraper] Starting service...")
    
    # Kafka handles retries internally and we poll in subscribe
    subscribe("match.analysis_requested", handle_analysis_requested)


if __name__ == "__main__":
    main()

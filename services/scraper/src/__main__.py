from src.clients.kafka import subscribe
from src.handlers.analysis import handle_analysis_requested, init_handler


def main():
    print("[Scraper] Starting service...")
    
    # Pre-iniciar el cliente para ganar tiempo
    try:
        init_handler()
    except Exception as e:
        print(f"[Scraper] Warning: Failed to pre-initialize handler: {e}")

    subscribe("match.analysis_requested", handle_analysis_requested)


if __name__ == "__main__":
    main()

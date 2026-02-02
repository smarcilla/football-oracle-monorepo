import logging
from src.clients.kafka import subscribe
from src.handlers.analysis import handle_analysis_requested, init_handler
from src.handlers.league import handle_league_sync_requested

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


def main():
    print("[Scraper] Starting service...")
    
    # Pre-iniciar el cliente para ganar tiempo
    try:
        init_handler()
    except Exception as e:
        print(f"[Scraper] Warning: Failed to pre-initialize handler: {e}")

    # Subscribirse a múltiples tópicos usando el nuevo formato de diccionario
    handlers = {
        "match.analysis_requested": handle_analysis_requested,
        "league.sync.requested": handle_league_sync_requested
    }
    
    subscribe(list(handlers.keys()), handlers)


if __name__ == "__main__":
    main()

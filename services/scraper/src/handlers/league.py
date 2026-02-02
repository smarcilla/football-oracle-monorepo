import logging

logger = logging.getLogger(__name__)

def handle_league_sync_requested(message: dict):
    league_id = message.get("leagueId")
    year = message.get("year")
    
    logger.info("==================================================")
    logger.info("[Scraper] RECEIVED LEAGUE SYNC REQUEST")
    logger.info(f"League: {league_id}")
    logger.info(f"Year: {year}")
    logger.info(f"Full message: {message}")
    logger.info("==================================================")
    
    # De momento solo logueamos
    print(f"[Scraper] League Sync Requested for {league_id} ({year})")

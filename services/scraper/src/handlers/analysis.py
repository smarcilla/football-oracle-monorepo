import logging
from src.clients.kafka import publish
from src.clients.sofascore_client import SofascoreClient
from src.handlers.match_handler import MatchHandler

logger = logging.getLogger(__name__)

# Instancias compartidas (o inyectadas)
_sofascore_client = None

def init_handler():
    """Pre-inicializa el cliente de Sofascore para evitar latencia en el primer mensaje."""
    global _sofascore_client
    if _sofascore_client is None:
        logger.info("Pre-inicializando SofascoreClient (iniciando navegador)...")
        _sofascore_client = SofascoreClient()
    return MatchHandler(_sofascore_client)

def _get_handler():
    return init_handler()

def handle_analysis_requested(message: dict):
    match_id = message.get("matchId")
    if not match_id:
        logger.error("Mensaje recibido sin matchId")
        return

    logger.info(f"Procesando solicitud de análisis para el partido: {match_id}")
    
    try:
        handler = _get_handler()
        result = handler.process_match(match_id)
        
        if result:
            publish("match.data.scraped", result)
            logger.info(f"Datos del partido {match_id} publicados exitosamente en Kafka")
        else:
            logger.error(f"No se pudieron extraer datos para el partido {match_id}")
            
    except Exception as e:
        logger.error(f"Error crítico procesando el partido {match_id}: {e}")

import pytest
import logging
from src.clients.sofascore_client import SofascoreClient
from src.handlers.match_handler import MatchHandler

# Configurar logging para ver la salida durante el test
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@pytest.fixture
def handler():
    client = SofascoreClient()
    return MatchHandler(client)

@pytest.mark.integration
def test_full_match_processing_real_data(handler):
    """
    Prueba de integración real que procesa un partido completo.
    Partido ID: 15129439
    """
    match_id = "15129439"
    
    logger.info(f"Iniciando test de integración para el partido {match_id}")
    
    # Ejecutar el caso de uso completo
    result = handler.process_match(match_id)
    
    # 1. Validaciones de estructura básica
    assert result is not None
    assert result["matchId"] == match_id
    assert "metadata" in result
    assert "shots" in result
    assert "scrapedAt" in result
    assert result["scrapedAt"].endswith("Z")

    # 2. Validaciones de Metadatos
    metadata = result["metadata"]
    assert "league" in metadata
    assert metadata["homeTeam"]["name"] != ""
    assert metadata["awayTeam"]["name"] != ""
    
    print(f"\n[INTEGRATION] Partido detectado: {metadata['homeTeam']['name']} vs {metadata['awayTeam']['name']}")
    print(f"[INTEGRATION] Real Score: {metadata['realScore']['home']} - {metadata['realScore']['away']}")

    # Verificar colores (Sofascore suele devolver hex codes)
    assert metadata["homeTeam"]["colors"]["primary"].startswith("#")
    assert metadata["awayTeam"]["colors"]["primary"].startswith("#")

    # 3. Validaciones de disparos
    shots = result["shots"]
    assert isinstance(shots, list)
    assert len(shots) > 0
    
    # Verificar el primer disparo
    first_shot = shots[0]
    required_shot_keys = ["playerName", "team", "minute", "xg", "result", "situation", "bodyPart"]
    for key in required_shot_keys:
        assert key in first_shot
        
    assert first_shot["team"] in ["home", "away"]
    assert isinstance(first_shot["xg"], float)
    assert first_shot["result"] in ["goal", "miss", "save", "block"]

    logger.info(f"Test completado exitosamente. Se procesaron {len(shots)} disparos.")
    
    # Print para inspección manual (usar -s al ejecutar pytest)
    print("\n--- RESUMEN DEL PARTIDO PROCESADO ---")
    print(f"Partido: {metadata['homeTeam']['name']} {metadata['realScore']['home']} - {metadata['realScore']['away']} {metadata['awayTeam']['name']}")
    print(f"Total disparos: {len(shots)}")
    if shots:
        print(f"Ejemplo disparo: {shots[0]['playerName']} ({shots[0]['minute']}') - xG: {shots[0]['xg']}")

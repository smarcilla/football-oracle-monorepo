import pytest
import pandas as pd
from src.clients.sofascore_client import SofascoreClient

@pytest.fixture
def client():
    return SofascoreClient()

@pytest.mark.integration
def test_integration_get_league_matches_real(client):
    """
    Test exploratorio para ver qué devuelve Sofascore al pedir una liga.
    Se puede ejecutar con: pytest -m integration -s
    """
    # Usamos una liga conocida (Premier League 23/24)
    year = "23/24"
    league = "England Premier League"
    
    matches = client.get_league_matches(year, league)
    
    assert isinstance(matches, list)
    if len(matches) > 0:
        first_match = matches[0]
        print(f"\n[INFO] Ejemplo de partido: {first_match.get('homeTeam', {}).get('name')} vs {first_match.get('awayTeam', {}).get('name')}")
        print(f"[DEBUG] Keys del primer partido: {list(first_match.keys())}")
        print(f"[DEBUG] Estructura 'homeTeam': {first_match.get('homeTeam')}")
        assert "id" in first_match
        assert "status" in first_match

@pytest.mark.integration
def test_integration_get_match_shots_real(client):
    """
    Test exploratorio para ver la estructura del DataFrame de disparos.
    """
    # ID de un partido real de la Premier League (ejemplo arbitrario que sea válido)
    # Nota: Los IDs cambian, este es solo un ejemplo de prueba manual.
    match_id = 11352376 # Ejemplo de un partido de la temporada 23/24
    
    shots_df = client.get_match_shots(match_id)
    
    assert isinstance(shots_df, pd.DataFrame)
    if not shots_df.empty:
        print("\n[INFO] Columnas detectadas en disparos:")
        print(shots_df.columns.tolist())
        print("\n[INFO] Primer disparo (head):")
        print(shots_df.head(1).to_dict())
        
        # En Sofascore las coordenadas vienen en 'playerCoordinates' como dict {'x': ..., 'y': ...}
        assert "playerCoordinates" in shots_df.columns
        assert "xg" in shots_df.columns
        
        first_shot_coords = shots_df.iloc[0]["playerCoordinates"]
        print(f"[DEBUG] Coordenadas del primer disparo: {first_shot_coords}")
        assert "x" in first_shot_coords
        assert "y" in first_shot_coords

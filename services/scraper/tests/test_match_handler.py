import pytest
import pandas as pd
from unittest.mock import MagicMock
from src.handlers.match_handler import MatchHandler

@pytest.fixture
def mock_sofascore_client():
    client = MagicMock()
    # Mock de detalles del partido
    client.get_match_details.return_value = {
        "id": 12345,
        "tournament": {"uniqueTournament": {"name": "Test League"}},
        "homeTeam": {"id": 1, "name": "Team A", "teamColors": {"primary": "#111111"}},
        "awayTeam": {"id": 2, "name": "Team B", "teamColors": {"primary": "#222222"}},
        "homeScore": {"current": 2},
        "awayScore": {"current": 1}
    }
    # Mock de disparos
    shots_data = [
        {"player": {"name": "Player 1"}, "isHome": True, "time": 10, "xg": 0.5, "shotType": "goal", "situation": "regular", "bodyPart": "right-foot"},
        {"player": {"name": "Player 2"}, "isHome": False, "time": 20, "xg": 0.1, "shotType": "miss", "situation": "corner", "bodyPart": "head"}
    ]
    client.get_match_shots.return_value = pd.DataFrame(shots_data)
    return client

def test_process_match_success(mock_sofascore_client):
    handler = MatchHandler(mock_sofascore_client)
    result = handler.process_match("12345")
    
    assert result["matchId"] == "12345"
    assert result["metadata"]["league"] == "Test League"
    assert result["metadata"]["homeTeam"]["name"] == "Team A"
    assert result["metadata"]["realScore"]["home"] == 2
    assert len(result["shots"]) == 2
    assert result["shots"][0]["playerName"] == "Player 1"
    assert result["shots"][0]["result"] == "goal"
    assert "scrapedAt" in result

def test_process_match_no_details(mock_sofascore_client):
    mock_sofascore_client.get_match_details.return_value = {}
    handler = MatchHandler(mock_sofascore_client)
    
    result = handler.process_match("12345")
    assert result == {}

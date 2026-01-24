from src.clients.kafka import publish


def handle_analysis_requested(message: dict):
    match_id = message.get("matchId", "unknown")

    print(f"[Scraper] Processing match: {match_id}")
    print("[Scraper] Extracting shot data (mock)...")

    # Mock data - in real implementation this would scrape Sofascore
    mock_shots = {
        "matchId": match_id,
        "homeTeam": "Real Madrid",
        "awayTeam": "Barcelona",
        "shots": [
            {"player": "Vinicius Jr", "xG": 0.45, "team": "home", "result": "goal"},
            {"player": "Bellingham", "xG": 0.32, "team": "home", "result": "saved"},
            {"player": "Lewandowski", "xG": 0.67, "team": "away", "result": "goal"},
            {"player": "Raphinha", "xG": 0.21, "team": "away", "result": "missed"},
        ],
    }

    print(f"[Scraper] Extracted {len(mock_shots['shots'])} shots")

    publish("match.data_extracted", mock_shots)

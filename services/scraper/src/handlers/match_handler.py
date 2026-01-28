import logging
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, Any, List
from src.clients.sofascore_client import SofascoreClient

logger = logging.getLogger(__name__)

# Constants to avoid S1192 (String literals should not be duplicated)
RESULT_MISS = "miss"
RESULT_GOAL = "goal"
RESULT_SAVE = "save"
RESULT_BLOCK = "block"

class MatchHandler:
    """
    Orquestador de la lógica de procesamiento de partidos.
    Transforma los datos crudos de Sofascore al modelo de dominio del proyecto.
    """

    def __init__(self, sofascore_client: SofascoreClient):
        self.client = sofascore_client

    def process_match(self, match_id: str) -> Dict[str, Any]:
        """
        Extrae y normaliza toda la información de un partido.
        """
        logger.info(f"Iniciando procesamiento del partido ID: {match_id}")
        
        # 1. Obtener datos crudos
        raw_match = self.client.get_match_details(match_id)
        if not raw_match:
            logger.error(f"No se pudieron obtener detalles para el partido {match_id}")
            return {}

        raw_shots = self.client.get_match_shots(match_id)
        
        # 2. Mapear metadatos
        metadata = self._map_metadata(raw_match)
        
        # 3. Mapear disparos
        shots = self._map_shots(raw_shots)
        
        # 4. Construir evento final
        payload = {
            "matchId": str(match_id),
            "metadata": metadata,
            "shots": shots,
            "scrapedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        }
        
        logger.info(f"Procesamiento completado para el partido {match_id}. {len(shots)} disparos encontrados.")
        return payload

    def _map_metadata(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normaliza los metadatos del partido.
        """
        return {
            "league": raw.get("tournament", {}).get("uniqueTournament", {}).get("name", "Unknown League"),
            "homeTeam": {
                "id": raw.get("homeTeam", {}).get("id"),
                "name": raw.get("homeTeam", {}).get("name"),
                "colors": {
                    "primary": raw.get("homeTeam", {}).get("teamColors", {}).get("primary", "#FFFFFF"),
                    "secondary": raw.get("homeTeam", {}).get("teamColors", {}).get("secondary")
                }
            },
            "awayTeam": {
                "id": raw.get("awayTeam", {}).get("id"),
                "name": raw.get("awayTeam", {}).get("name"),
                "colors": {
                    "primary": raw.get("awayTeam", {}).get("teamColors", {}).get("primary", "#000000"),
                    "secondary": raw.get("awayTeam", {}).get("teamColors", {}).get("secondary")
                }
            },
            "realScore": {
                "home": raw.get("homeScore", {}).get("current", 0),
                "away": raw.get("awayScore", {}).get("current", 0)
            }
        }

    def _map_shots(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Normaliza el listado de disparos desde el DataFrame de pandas.
        """
        if df is None or df.empty:
            return []

        shots = []
        for _, row in df.iterrows():
            try:
                # Extraer datos con validación de tipos para Pyright
                player_raw = row.get("player")
                player_data = player_raw if isinstance(player_raw, dict) else {}
                
                shot = {
                    "playerName": player_data.get("name", "Unknown Player"),
                    "team": "home" if row.get("isHome") else "away",
                    "minute": int(row.get("time") or 0),
                    "xg": float(row.get("xg") or 0.0),
                    "result": self._normalize_result(str(row.get("shotType") or RESULT_MISS)),
                    "situation": str(row.get("situation") or "regular"),
                    "bodyPart": str(row.get("bodyPart") or "other")
                }
                shots.append(shot)
            except Exception as e:
                logger.warning(f"Error al mapear fila de disparo: {e}")
                continue
                
        return shots

    def _normalize_result(self, raw_result: str) -> str:
        """
        Asegura que el resultado del disparo cumpla con nuestro enum.
        Valores Sofascore: 'goal', 'miss', 'save', 'block'
        """
        mapping = {
            "goal": RESULT_GOAL,
            "miss": RESULT_MISS,
            "save": RESULT_SAVE,
            "block": RESULT_BLOCK
        }
        return mapping.get(raw_result, RESULT_MISS)

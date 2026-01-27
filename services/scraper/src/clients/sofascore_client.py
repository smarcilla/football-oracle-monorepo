import logging
import pandas as pd
from typing import List, Dict, Union, Any
from ScraperFC.sofascore import Sofascore

logger = logging.getLogger(__name__)

class SofascoreClient:
    """
    Wrapper para la librería ScraperFC centrado en la extracción de datos de Sofascore.
    
    Actúa como un cliente técnico que encapsula la lógica de comunicación con la API
    de Sofascore a través de ScraperFC, proporcionando una interfaz limpia para los handlers.
    """

    def __init__(self):
        try:
            # Inicializamos el cliente de ScraperFC
            # Sofascore en ScraperFC no requiere obligatoriamente Selenium para la mayoría de llamadas API,
            # pero la clase interna lo gestiona si es necesario.
            self.client = Sofascore()
            logger.info("SofascoreClient inicializado correctamente.")
        except Exception as e:
            logger.error(f"Error al inicializar SofascoreClient: {e}")
            raise

    def get_league_matches(self, year: str, league: str) -> List[Dict[str, Any]]:
        """
        Obtiene todos los partidos de una liga y temporada específica.
        """
        try:
            logger.info(f"Obteniendo partidos para la liga {league}, temporada {year}")
            matches = self.client.get_match_dicts(year=year, league=league)
            logger.info(f"Se han obtenido {len(matches)} partidos.")
            return matches
        except Exception as e:
            logger.error(f"Error al obtener partidos de la liga {league} ({year}): {e}")
            return []

    def get_match_details(self, match_id: Union[str, int]) -> Dict[str, Any]:
        """
        Obtiene los detalles técnicos y estadísticas generales de un partido.
        """
        try:
            logger.info(f"Obteniendo detalles del partido ID: {match_id}")
            match_data = self.client.get_match_dict(match_id=match_id)
            return match_data
        except Exception as e:
            logger.error(f"Error al obtener detalles del partido {match_id}: {e}")
            return {}

    def get_match_shots(self, match_id: Union[str, int]) -> pd.DataFrame:
        """
        Extrae los datos de disparos (shots) de un partido.
        Retorna un DataFrame de Pandas con columnas como x, y, xG, bodyPart, etc.
        """
        try:
            logger.info(f"Extrayendo disparos del partido ID: {match_id}")
            shots_df = self.client.scrape_match_shots(match_id=match_id)
            return shots_df
        except Exception as e:
            logger.error(f"Error al extraer disparos del partido {match_id}: {e}")
            return pd.DataFrame()

    def close(self):
        """
        Libera recursos si fuera necesario (por ejemplo, si se usara Selenium internamente).
        """
        try:
            # ScraperFC.Sofascore suele cerrar el driver en su destructor, 
            # pero podemos forzar limpieza si la librería lo permite.
            pass
        except Exception as e:
            logger.warning(f"Error al cerrar SofascoreClient: {e}")

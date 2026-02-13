from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from matches.models import OpenMatch, MatchCategory

class IMatchRepository(ABC):
    @abstractmethod
    async def create_open_match(self, match_data: Dict[str, Any]) -> OpenMatch:
        """
        Crea un nuevo partido abierto en la base de datos.
        """
        pass

    @abstractmethod
    async def get_all_open_matches(self) -> List[OpenMatch]:
        """
        Obtiene todos los partidos abiertos.
        """
        pass

    @abstractmethod
    async def get_open_match_by_id(self, match_id: int) -> Optional[OpenMatch]:
        """
        Obtiene un partido abierto por su ID.
        """
        pass

    @abstractmethod
    async def add_participant_to_match(self, match_id: int, user_id: int) -> Optional[OpenMatch]:
        """
        Añade un participante a un partido.
        """
        pass

    @abstractmethod
    async def remove_participant_from_match(self, match_id: int, user_id: int) -> Optional[OpenMatch]:
        """
        Elimina un participante de un partido.
        """
        pass

    @abstractmethod
    async def get_all_categories(self) -> List[MatchCategory]:
        """
        Obtiene todas las categorías de partidos.
        """
        pass

    @abstractmethod
    def get_upcoming_matches_for_user(self, user_id: int) -> List[OpenMatch]:
        """
        Obtiene los próximos partidos a los que un usuario está inscrito.
        """
        pass

    @abstractmethod
    async def update_open_match(self, match_id: int, match_data: Dict[str, Any]) -> Optional[OpenMatch]:
        """
        Actualiza un partido abierto existente.
        """
        pass

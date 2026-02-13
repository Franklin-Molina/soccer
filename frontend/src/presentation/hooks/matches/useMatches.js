import { useState, useEffect, useCallback } from "react";
import { useMatchesRealtime } from "./useMatchesRealtime";
import { useBookingsRealtime } from "../bookings/useBookingsRealtime";
import { toast } from 'react-toastify';
import {
  getOpenMatches,
  getMyUpcomingMatches,
  joinMatch,
  leaveMatch,
  cancelMatch,
  removeParticipant,
} from "../../../infrastructure/api/matchesService";

const groupMatchesByCategory = (matches) => {
  const grouped = { Mixto: [], Hombres: [], Mujeres: [] };
  matches.forEach((match) => {
    if (grouped.hasOwnProperty(match.category)) {
      grouped[match.category].push(match);
    }
  });
  return grouped;
};

export const useMatches = () => {
  const [matches, setMatches] = useState({ Mixto: [], Hombres: [], Mujeres: [] });
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessages, setNewMessages] = useState({});

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [openMatchesData, upcomingMatchesData] = await Promise.all([
        getOpenMatches(),
        getMyUpcomingMatches(),
      ]);
      setMatches(groupMatchesByCategory(openMatchesData));
      setUpcomingMatches(upcomingMatchesData);
    } catch (error) {
    //  console.error("Error fetching match data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleJoinMatch = async (matchId) => {
    await joinMatch(matchId);
    fetchAllData();
  };

  const handleLeaveMatch = async (matchId) => {
    await leaveMatch(matchId);
    fetchAllData();
  };

  const handleCancelMatch = async (matchId) => {
    await cancelMatch(matchId);
    fetchAllData();
  };

  const handleRemoveParticipant = async (matchId, userIdToRemove) => {
    await removeParticipant(matchId, userIdToRemove);
    fetchAllData();
  };

  // ✅ WS ACTUALIZA CUANDO HAY EVENTO EN PARTIDOS
  useMatchesRealtime(
    useCallback((event) => {
      if (event.type === 'chat_notification') {
        // Marcar como nuevo mensaje en el estado local
        setNewMessages(prev => ({
          ...prev,
          [event.match_id]: true
        }));

        // Mostrar notificación toast (solo si el mensaje no es del usuario actual)
        // El backend ya hace este filtrado, por lo que podemos confiar en el evento
        toast.info(`Nuevo mensaje de ${event.username}: ${event.message.substring(0, 30)}${event.message.length > 30 ? '...' : ''}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: `chat-${event.match_id}-${event.username}-${event.message.substring(0, 10)}` // ID determinista basado en el contenido para evitar duplicados
        });
      } else {
        fetchAllData();
      }
    }, [fetchAllData])
  );

  // ✅ WS ACTUALIZA CUANDO HAY CAMBIOS EN RESERVAS
  useBookingsRealtime(
    useCallback((event) => {
      fetchAllData();
    }, [fetchAllData])
  );

  const clearNewMessage = useCallback((matchId) => {
    setNewMessages(prev => {
      if (!prev[matchId]) return prev;
      const updated = { ...prev };
      delete updated[matchId];
      return updated;
    });
  }, []);

  return {
    matches,
    upcomingMatches,
    loading,
    newMessages,
    fetchAllData,
    handleJoinMatch,
    handleLeaveMatch,
    handleCancelMatch,
    handleRemoveParticipant,
    clearNewMessage,
  };
};

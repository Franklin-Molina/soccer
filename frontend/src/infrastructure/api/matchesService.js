import api from "./api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Obtener todos los partidos abiertos
export const getOpenMatches = async () => {
  try {
    const response = await api.get("/api/matches/open-matches/");
    return response.data;
  } catch (error) {
    toast.error("No se pudieron cargar los partidos abiertos.");
    throw error;
  }
};

// Obtener los próximos partidos del usuario actual
export const getMyUpcomingMatches = async () => {
  try {
    const response = await api.get("/api/matches/open-matches/my-upcoming-matches/");
    return response.data;
  } catch (error) {
    toast.error("No se pudieron cargar tus próximos partidos.");
    throw error;
  }
};

// Unirse a un partido
export const joinMatch = async (matchId) => {
  try {
    await api.post(`/api/matches/open-matches/${matchId}/join/`);
    toast.success("¡Te has unido al partido!");
  } catch (error) {
    toast.error(error.response?.data?.detail || "No se pudo unir al partido.");
    throw error;
  }
};

// Salir de un partido
export const leaveMatch = async (matchId) => {
  const result = await Swal.fire({
    title: "¿Salir del partido?",
    text: "¿Estás seguro de que quieres abandonar este partido?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#ea580c",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, salir",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      await api.post(`/api/matches/open-matches/${matchId}/leave/`);
      toast.success("Has salido del partido exitosamente.");
      Swal.fire("¡Listo!", "Has abandonado el partido.", "success");
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "No se pudo salir del partido.";
      Swal.fire("Error", errorMsg, "error");
      throw error;
    }
  }
};

// Cancelar un partido (creador)
export const cancelMatch = async (matchId) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, cancelar partido",
  });

  if (result.isConfirmed) {
    try {
      await api.post(`/api/matches/open-matches/${matchId}/cancel/`);
      toast.success("Partido cancelado.");
      Swal.fire("¡Cancelado!", "El partido ha sido cancelado.", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo cancelar el partido.", "error");
      throw error;
    }
  }
};

// Expulsar a un participante (creador)
export const removeParticipant = async (matchId, userIdToRemove) => {
  const result = await Swal.fire({
    title: "¿Expulsar jugador?",
    text: "¡Este jugador será expulsado del partido!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, expulsar",
  });

  if (result.isConfirmed) {
    try {
      await api.post(`/api/matches/open-matches/${matchId}/remove_participant/`, {
        user_id: userIdToRemove,
      });
      toast.success("Jugador expulsado.");
      Swal.fire("¡Expulsado!", "El jugador ha sido expulsado.", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo expulsar al jugador.", "error");
      throw error;
    }
  }
};

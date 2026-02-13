import api from "./api";

export const getChatMessages = async (matchId) => {
  const response = await api.get(`/api/chat/messages/?match_id=${matchId}`);  
  return response.data;
};
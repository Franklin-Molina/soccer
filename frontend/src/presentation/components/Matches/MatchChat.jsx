import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChatWebSocket } from '../../hooks/matches/useChatWebSocket';
import { getChatMessages } from '../../../infrastructure/api/chatService';
import { Send, X, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const MatchChat = ({ matchId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Helper para formatear la hora
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Cargar mensajes históricos
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatMessages(matchId);
        setMessages(history);
      } catch (err) {
        console.error('Error cargando historial de chat:', err);
        setError('No se pudo cargar el historial.');
      }
    };
    if (matchId) loadHistory();
  }, [matchId]);

  // Manejar mensajes entrantes por WebSocket
  const handleIncomingMessage = useCallback((data) => {
    if (data.type === 'chat_message') {
      const isOwn = data.username === user?.username;
      
      setMessages(prev => [...prev, {
        id: data.id,
        message: data.message,
        username: data.username,
        user_id: data.user_id,
        created_at: data.created_at
      }]);

      // Si recibimos un mensaje, dejamos de mostrar que está escribiendo
      setTypingUsers(prev => {
        const newTyping = { ...prev };
        delete newTyping[data.username];
        return newTyping;
      });
    } else if (data.type === 'typing') {
      setTypingUsers(prev => ({
        ...prev,
        [data.username]: data.is_typing
      }));
    } else if (data.type === 'error') {
      setError(data.message);
    }
  }, [user]); // Agregado user como dependencia para que isOwn sea correcto

  const { sendMessage, sendTyping } = useChatWebSocket(matchId, handleIncomingMessage);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar propagación
    
    if (!newMessage.trim() || error) return;

    sendMessage(newMessage);
    setNewMessage('');
    sendTyping(false);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Notificar que está escribiendo
    sendTyping(true);

    // Timeout para limpiar el estado de escritura si deja de escribir
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  // Obtener lista de usuarios escribiendo (excluyendo valores falsos)
  const usersTyping = Object.entries(typingUsers)
    .filter(([_, isTyping]) => isTyping)
    .map(([username]) => username);

  return (
    <div className="fixed bottom-4 right-4 w-80 h-[450px] bg-white dark:bg-[#1a2332] rounded-2xl shadow-2xl border border-slate-200 dark:border-emerald-500/30 flex flex-col z-[100] overflow-hidden backdrop-blur-sm transition-colors duration-300">
      {/* Header */}
      <div className="p-4 bg-emerald-600 dark:bg-gradient-to-r dark:from-emerald-900/80 dark:to-emerald-600/80 text-white flex justify-between items-center border-b border-emerald-500/10 dark:border-emerald-500/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-100 dark:text-emerald-400" />
          <h3 className="font-bold text-sm tracking-wide">Chat del Partido</h3>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="hover:bg-white/10 rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#1a2332] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700/50 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600/50">
        {error ? (
          <div className="text-center p-4">
            <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.username === user?.username;
            return (
              <div key={msg.id || index} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {!isOwn && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium ml-1">
                      {msg.username}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-400 dark:text-slate-500">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <div className={`max-w-[85%] px-4 py-2 text-sm shadow-sm dark:shadow-lg transition-all ${
                  isOwn 
                    ? 'bg-emerald-600 dark:bg-gradient-to-br dark:from-emerald-700 dark:to-emerald-900 text-white rounded-[20px] rounded-tr-none border border-emerald-500/20' 
                    : 'bg-white dark:bg-[#2a374a] text-slate-900 dark:text-slate-200 rounded-[20px] rounded-tl-none border border-slate-200 dark:border-slate-700/50'
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        
        {/* Indicador de escritura */}
        {usersTyping.length > 0 && (
          <div className="flex flex-col items-start animate-pulse">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1 mb-1 font-medium">
              {usersTyping.join(', ')}
            </span>
            <div className="bg-slate-200 dark:bg-[#2a374a] px-4 py-2 rounded-[20px] rounded-tl-none border border-slate-300 dark:border-slate-700/50 flex gap-1">
              <span className="w-1 h-1 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1 h-1 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1 h-1 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-[#1a2332] border-t border-slate-100 dark:border-slate-800/50">
        <form 
          onSubmit={handleSend} 
          className="flex gap-2 items-center bg-slate-50 dark:bg-[#252f3f] p-1.5 px-3 rounded-2xl border border-slate-200 dark:border-emerald-500/20 focus-within:border-emerald-500/50 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            disabled={!!error}
            placeholder={error ? "Chat cerrado" : "Escribe..."}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none py-1 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!!error}
            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:text-slate-300 dark:disabled:text-slate-600 transition-colors"
          >
            <Send className="w-5 h-5 rotate-45" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MatchChat;

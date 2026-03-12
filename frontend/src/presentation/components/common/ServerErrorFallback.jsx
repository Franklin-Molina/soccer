import React from 'react';
import { ServerCrash, RefreshCcw } from 'lucide-react';

const ServerErrorFallback = ({ 
  onRetry, 
  title = "No pudimos conectar con el servidor", 
  message = "El backend parece estar apagado o reiniciándose." 
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-6">
        <ServerCrash className="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
        {title}
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        {message}
      </p>
      
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
      >
        <RefreshCcw className="w-5 h-5" />
        Reintentar conexión
      </button>
    </div>
  );
};

export default ServerErrorFallback;
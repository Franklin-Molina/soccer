import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

/**
 * Componente para mostrar una página 404 (Página no encontrada).
 */
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 text-center">
      <div className="max-w-md w-full">
        <h1 className="text-9xl font-extrabold text-black-600 tracking-widest dark:text-white">404</h1>
        <div className="bg-black text-white px-2 text-sm rounded rotate-12 absolute transform -translate-y-12 translate-x-1/2 inline-block">
          Página No Encontrada
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-8 mb-4">
          ¡Ups! Parece que te has perdido.
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-black-700 transition-colors duration-200 shadow-lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

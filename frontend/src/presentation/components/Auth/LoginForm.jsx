import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton.jsx';
import useButtonDisable from '../../hooks/general/useButtonDisable.js';

function LoginForm({ username, password, error, setUsername, setPassword, setError, onSubmit, onGoogleSuccess, onGoogleError }) {
  const [isSubmitting, handleFormSubmit] = useButtonDisable(onSubmit);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md p-8">
        {/* Título */}
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Iniciar Sesión</h2>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg mb-4">
            ⚠️ <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tu usuario"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400
                           focus:outline-none focus:border-indigo-400 focus:shadow-[0_0_4px_rgba(102,126,234,0.5)]
                           transition-[border-color,box-shadow] duration-300"
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400
                           focus:outline-none focus:border-indigo-400 focus:shadow-[0_0_4px_rgba(102,126,234,0.5)]
                           transition-[border-color,box-shadow] duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Botón Entrar */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
              isSubmitting
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          {/* Olvidé mi contraseña */}
          <div className="text-right">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 text-gray-400 my-4">
            <span className="border-t border-gray-300 dark:border-gray-600 w-16"></span>
            <span className="text-sm">O</span>
            <span className="border-t border-gray-300 dark:border-gray-600 w-16"></span>
          </div>

          {/* Google Login */}
          <GoogleLoginButton  onSuccess={onGoogleSuccess} onError={onGoogleError} />
        </form>

        {/* Registro */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes una cuenta?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium  ">
            Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;

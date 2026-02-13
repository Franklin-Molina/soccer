import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../infrastructure/api/api';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

function ActivateAccount() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const activate = async () => {
      try {
        await api.post('/api/auth/users/activation/', { uid, token });
        setStatus('success');
        toast.success('¡Cuenta activada exitosamente!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
        console.error('Error activating account:', error);
        toast.error('Error al activar la cuenta.');
      }
    };
    if (uid && token) {
      activate();
    }
  }, [uid, token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md p-8 shadow-xl text-center">
        {status === 'loading' && (
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Activando cuenta...</h2>
            <p className="text-gray-600 dark:text-gray-400">Por favor, espera un momento.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Cuenta Activada!</h2>
            <p className="text-gray-600 dark:text-gray-400">Tu cuenta ha sido activada correctamente. Serás redirigido al inicio de sesión en unos segundos.</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error de Activación</h2>
            <p className="text-gray-600 dark:text-gray-400">El enlace de activación es inválido o ha expirado.</p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Ir al Inicio de Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivateAccount;

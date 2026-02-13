import React from 'react';
import RegisterForm from './RegisterForm';

/**
 * Página para registrar un nuevo administrador.
 * Reutiliza el componente RegisterForm con el rol de 'admin'.
 */
function AdminRegisterPage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <RegisterForm userRole="admin" />
    </div>
  );
}

export default AdminRegisterPage;

import React, { useState, useEffect } from 'react'; // Importar useState, useEffect
import Header from './Header.jsx'; // Importar el componente Header
import AuthPage from '../Auth/AuthPage.jsx'; // Importar AuthPage
import { useAuth } from '../../context/AuthContext.jsx'; // Importar useAuth
import Modal from './Modal.jsx'; // Importar el componente Modal

/**
 * Componente de layout básico.
 * Proporciona una estructura común para las páginas y maneja el modal de autenticación.
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - El contenido a renderizar dentro del layout.
 * @returns {JSX.Element} El elemento JSX del layout.
 */
function Layout({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false); // Estado para controlar la visibilidad del modal
  const { isAuthenticated } = useAuth(); // Obtener estado de autenticación

  // Cerrar el modal automáticamente al autenticarse
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, showAuthModal]);

  // Función para abrir el modal de autenticación
  const openAuthModal = () => {
    //console.log('Abriendo modal de autenticación');
    setShowAuthModal(true);
  };

  // Función para cerrar el modal de autenticación
  const closeAuthModal = () => {   
    setShowAuthModal(false);
  };

  // Clonar el elemento hijo para pasarle las props necesarias (openAuthModal)
  const childrenWithProps = React.cloneElement(children, { openAuthModal });

  return (
    <Header openAuthModal={openAuthModal}>
      {childrenWithProps}
      {/* Aquí se podría añadir un componente Footer si es necesario */}

      {/* Modal de Autenticación */}
      <Modal show={showAuthModal} onClose={closeAuthModal}>
        <AuthPage />
      </Modal>
    </Header>
  );
}

export default Layout;

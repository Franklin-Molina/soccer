import React, { useState } from 'react'; // Importar useState
import Header from './Header.jsx'; // Importar el componente Header
import AuthPage from '../Auth/AuthPage.jsx'; // Importar AuthPage
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
    <div>
      {/* Pasar la función openAuthModal al Header */}
      <Header openAuthModal={openAuthModal} />
      <div className="">
        {childrenWithProps}
      </div>
      {/* Aquí se podría añadir un componente Footer si es necesario */}

      {/* Modal de Autenticación */}
      <Modal show={showAuthModal} onClose={closeAuthModal}>
        <AuthPage />
      </Modal>
    </div>
  );
}

export default Layout;

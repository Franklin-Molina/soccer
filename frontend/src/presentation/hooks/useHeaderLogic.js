import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getMenuItemsForRole, getActiveSubmenuIndexes } from '../../infrastructure/services/menuService';

/**
 * Hook personalizado para manejar la lógica del Header
 * @param {Object} params - Parámetros
 * @param {string} params.userRole - Rol del usuario
 * @param {Function} params.onToggleSidebar - Función para alternar sidebar
 * @returns {Object} Objeto con estado y funciones para el Header
 */
export const useHeaderLogic = ({ userRole, onToggleSidebar }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const location = useLocation();

  // Obtener elementos de menú para el rol actual
  const currentMenuItems = getMenuItemsForRole(userRole);

  // Manejar submenús abiertos basado en la ruta actual
  useEffect(() => {
    const activeSubmenus = getActiveSubmenuIndexes(currentMenuItems, location.pathname);
    setOpenSubmenus(activeSubmenus);
  }, [location.pathname, currentMenuItems]);

  /**
   * Alternar estado de submenú
   * @param {number} index - Índice del submenú
   */
  const toggleSubmenu = (index) => {
    setOpenSubmenus(prev => ({ ...prev, [index]: !prev[index] }));
  };

  /**
   * Alternar estado del sidebar
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  /**
   * Cerrar sidebar
   */
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return {
    isSidebarOpen,
    openSubmenus,
    currentMenuItems,
    toggleSubmenu,
    toggleSidebar,
    closeSidebar,
  };
};
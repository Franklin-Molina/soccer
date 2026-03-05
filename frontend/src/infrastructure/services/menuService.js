/**
 * Servicio de menú - Capa de Infraestructura
 * Proporciona acceso centralizado a la configuración de menús
 * y lógica relacionada con la navegación
 */

import { menuItems } from '../../presentation/components/Dashboard/menuConfig.jsx';

/**
 * Obtiene los elementos de menú para un rol específico
 * @param {string} role - Rol del usuario (cliente, admin, adminglobal)
 * @returns {Array} Array de elementos de menú
 */
export const getMenuItemsForRole = (role) => {
  const validRoles = ['cliente', 'admin', 'adminglobal'];
  const userRole = validRoles.includes(role) ? role : 'cliente';
  return menuItems[userRole] || [];
};

/**
 * Determina si un elemento de menú está activo basado en la ruta actual
 * @param {Object} menuItem - Elemento de menú
 * @param {string} currentPath - Ruta actual
 * @returns {boolean} True si el elemento está activo
 */
export const isMenuItemActive = (menuItem, currentPath) => {
  if (menuItem.submenu) {
    return menuItem.submenu.some(subItem => currentPath.startsWith(subItem.to));
  }
  return currentPath === menuItem.to;
};

/**
 * Encuentra el índice del submenú activo basado en la ruta actual
 * @param {Array} menuItems - Array de elementos de menú
 * @param {string} currentPath - Ruta actual
 * @returns {Object} Objeto con índices de submenús activos
 */
export const getActiveSubmenuIndexes = (menuItems, currentPath) => {
  const activeSubmenus = {};

  menuItems.forEach((item, index) => {
    if (item.submenu && item.submenu.some(subItem => currentPath.startsWith(subItem.to))) {
      activeSubmenus[index] = true;
    }
  });

  return activeSubmenus;
};
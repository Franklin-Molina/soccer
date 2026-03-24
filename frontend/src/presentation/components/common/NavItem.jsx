import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { isMenuItemActive } from '../../../infrastructure/services/menuService';

/**
 * Componente reutilizable para elementos de navegación
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.item - Elemento de menú
 * @param {number} props.index - Índice del elemento
 * @param {boolean} props.isOpen - Estado del submenú
 * @param {Function} props.onToggle - Función para alternar submenú
 * @param {string} props.currentPath - Ruta actual
 * @param {Function} props.onClick - Función para manejar clic
 */
const NavItem = ({ item, index, isOpen, onToggle, currentPath, onClick }) => {
  // Determinar si el elemento está activo
  const isActive = isMenuItemActive(item, currentPath);

  // Manejar elementos de encabezado
  if (item.type === 'header') {
    return (
      <li className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {item.label}
      </li>
    );
  }

  // Manejar elementos con submenú
  if (item.submenu) {
    return (
      <li>
        <button
          onClick={() => onToggle(index)}
          className={`flex items-center justify-between w-full gap-3 px-4 py-2 rounded-xl font-normal transition-all ${
            isActive
              ? 'bg-emerald-700 text-white shadow-md' //admin
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <ul className="pl-6 pt-1 space-y-1">
            {item.submenu.map((subItem) => {
              const isSubActive = currentPath === subItem.to;
              return (
                <li key={subItem.to}>
                  <NavLink
                    to={subItem.to}
                    onClick={onClick}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all ${
                      isSubActive
                        ? 'bg-emerald-500/20 text-gray-700 dark:text-gray-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {subItem.icon}
                    <span>{subItem.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  // Manejar elementos simples
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/' || item.to === '/dashboard' || item.to === '/client' || item.to === '/adminglobal'}
        onClick={onClick}
        className={({ isActive: isNavLinkActive }) =>
          `flex items-center gap-3 px-4 py-2 rounded-xl font-normal transition-all ${
            isNavLinkActive
              ? 'bg-emerald-700/90 text-white shadow-md dark:bg-emerald-800' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`
        }
      >
        {item.icon}
        <span>{item.label}</span>
      </NavLink>
    </li>
  );
};

export default NavItem;

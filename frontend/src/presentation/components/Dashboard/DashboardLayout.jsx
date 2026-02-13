import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { menuItems } from './menuConfig.jsx';
import DashboardNavbar from './DashboardNavbar'; // Cambiado de Header a DashboardNavbar
import { ChevronDown, X, LogOut } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const location = useLocation();

  const userRole = user?.role || 'cliente';
  const currentMenuItems = menuItems[userRole] || [];

  useEffect(() => {
    const activeSubmenus = {};
    currentMenuItems.forEach((item, index) => {
      if (item.submenu && item.submenu.some(subItem => location.pathname.startsWith(subItem.to))) {
        activeSubmenus[index] = true;
      }
    });
    setOpenSubmenus(activeSubmenus);
  }, [location.pathname, currentMenuItems]);

  const toggleSubmenu = (index) => {
    setOpenSubmenus(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
  };

  const NavItem = ({ item, index }) => {
    if (item.type === 'header') {
      return (
        <li className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {item.label}
        </li>
      );
    }

    const isActive = item.submenu
      ? item.submenu.some(subItem => location.pathname.startsWith(subItem.to))
      : location.pathname === item.to;

    if (item.submenu) {
      return (
        <li>
          <button
            onClick={() => toggleSubmenu(index)}
            className={`flex items-center justify-between w-full gap-3 px-4 py-2 rounded-xl font-normal transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openSubmenus[index] ? 'rotate-180' : ''}`} />
          </button>
          {openSubmenus[index] && (
            <ul className="pl-6 pt-1 space-y-1">
              {item.submenu.map((subItem) => {
                const isSubActive = location.pathname === subItem.to;
                return (
                  <li key={subItem.to}>
                    <NavLink
                      to={subItem.to}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all ${isSubActive
                          ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
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

    return (
      <li>
        <NavLink
          to={item.to}
          end={item.to === '/' || item.to === '/dashboard' || item.to === '/client' || item.to === '/adminglobal'}
          onClick={() => setIsSidebarOpen(false)}
          className={({ isActive: isNavLinkActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl font-normal transition-all ${isNavLinkActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      </li>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 
    border-r border-gray-200 dark:border-gray-700 flex-shrink-0 z-50 
    transform transition-transform duration-300 
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
    flex flex-col`} 
      >
        <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700 h-16">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Panel {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col justify-between flex-grow p-4 overflow-y-auto">
          <ul className="space-y-1">
            {currentMenuItems.map((item, index) => (
              <NavItem key={item.label || item.to} item={item} index={index} />
            ))}
          </ul>

          <div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-700/20 rounded-xl font-medium transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>

            <div className="p-4 text-sm text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-4">
              © {new Date().getFullYear()} HCKD
            </div>
          </div>
        </nav>
      </aside>

      <div className="flex flex-col flex-1">
        <DashboardNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>

  );
};

export default DashboardLayout;

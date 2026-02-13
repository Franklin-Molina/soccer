import React from 'react';
import { formatPrice } from '../../utils/formatters';
import Pagination from '../common/Pagination.jsx';
import { Edit2, Trash2, ToggleLeft, ToggleRight, ShieldOff, ShieldCheck, MoreVertical, SearchX } from 'lucide-react';

const CourtStatus = ({ isActive }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      isActive
        ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200/80 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700/80'
        : 'bg-red-100/80 text-red-800 border-red-200/80 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/80'
    }`}
  >
    {isActive ? 'Activa' : 'Suspendida'}
  </span>
);

const ActionButton = ({ onClick, icon: Icon, title, className }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 ${className}`}
    title={title}
  >
    <Icon size={16} />
  </button>
);

// Nuevo componente para renderizar una fila de la tabla
const CourtTableRow = ({ court, index, onModify, onDelete, onToggleActive }) => (
  <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
    <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">{index}</td>
    <td className="px-4 py-3 text-sm text-slate-800 dark:text-white font-semibold">{court.name}</td>
    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">${formatPrice(court.price)}</td>
    <td className="px-4 py-3">
      <CourtStatus isActive={court.is_active} />
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex items-center justify-end gap-1">
        <ActionButton onClick={() => onModify(court)} icon={Edit2} title="Modificar" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-yellow-500 dark:text-yellow-400 transition-all" />
        <ActionButton onClick={() => onDelete(court)} icon={Trash2} title="Eliminar" className="hover:text-red-500 dark:hover:text-red-400" />
        <ActionButton
          onClick={() => onToggleActive(court.id, !court.is_active)}
          icon={court.is_active ? ShieldOff : ShieldCheck}
          title={court.is_active ? 'Suspender' : 'Reactivar'}
          className={court.is_active ? 'hover:text-red-500 dark:hover:text-red-400' : 'hover:text-emerald-500 dark:hover:text-emerald-400'}
        />
      </div>
    </td>
  </tr>
);


const CourtCard = ({ court, index, onModify, onDelete, onToggleActive }) => (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
      {/* Encabezado de la tarjeta */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-slate-400">#{index}</p>
          <p className="font-bold text-slate-800 dark:text-white">{court.name}</p>
        </div>
        <CourtStatus isActive={court.is_active} />
      </div>
  
      {/* Precio */}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Precio por hora</p>
        <p className="font-semibold text-slate-700 dark:text-slate-200">${formatPrice(court.price)}</p>
      </div>
  
      {/* Acciones */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-end gap-2">
        <ActionButton onClick={() => onModify(court)} icon={Edit2} title="Modificar" className="hover:text-amber-500 dark:hover:text-amber-400" />
        <ActionButton onClick={() => onDelete(court)} icon={Trash2} title="Eliminar" className="hover:text-red-500 dark:hover:text-red-400" />
        <ActionButton
            onClick={() => onToggleActive(court.id, !court.is_active)}
            icon={court.is_active ? ShieldOff : ShieldCheck}
            title={court.is_active ? 'Suspender' : 'Reactivar'}
            className={court.is_active ? 'hover:text-red-500 dark:hover:text-red-400' : 'hover:text-emerald-500 dark:hover:text-emerald-400'}
        />
      </div>
    </div>
  );
  

const NoResults = () => (
    <div className="text-center py-12">
      <SearchX className="mx-auto h-12 w-12 text-slate-400" />
      <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-white">No se encontraron canchas</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Intenta ajustar los filtros o agrega una nueva cancha.
      </p>
    </div>
);
  
function CourtTable({ courts, onModify, onDelete, onToggleActive, currentPage, totalPages, setCurrentPage, itemsPerPage, setItemsPerPage, totalCourts, getRowNumber }) {
    if (courts.length === 0) {
      return <NoResults />;
    }
  
    return (
      <div className="space-y-4">
        {/* Vista de tarjetas para móviles */}
        <div className="md:hidden space-y-4">
          {courts.map((court, index) => (
            <CourtCard key={court.id} court={court} index={getRowNumber(index)} {...{ onModify, onDelete, onToggleActive }} />
          ))}
        </div>
  
        {/* Vista de tabla para escritorio */}
        <div className="hidden md:block shadow-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse">
            <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-semibold tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
              {courts.map((court, index) => (
                <CourtTableRow key={court.id} court={court} index={getRowNumber(index)} {...{ onModify, onDelete, onToggleActive }} />
              ))}
            </tbody>
          </table>
        </div>
  
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalItems={totalCourts}
        />
      </div>
    );
}
  
export default CourtTable;

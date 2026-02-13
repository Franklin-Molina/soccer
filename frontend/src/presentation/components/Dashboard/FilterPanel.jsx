import React from 'react';
import CustomSelect from '../common/CustomSelect.jsx';
import { X } from 'lucide-react';

const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="transition-all duration-300 ease-in-out max-h-96 opacity-100">
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 ml-1">
                {filter.label}
              </label>
              {filter.type === 'text' && (
                <input
                  type="text"
                  placeholder={filter.placeholder}
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all"
                />
              )}
              {filter.type === 'select' && (
                <CustomSelect
                  options={filter.options}
                  value={filter.value}
                  onChange={(value) => onFilterChange(filter.id, value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
          <button
            onClick={onClearFilters}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Limpiar filtros
          </button>
          <div className="flex-grow"></div>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {activeFilterCount === 0
              ? "Sin filtros"
              : `${activeFilterCount} filtro${
                  activeFilterCount > 1 ? "s" : ""
                } activo${activeFilterCount > 1 ? "s" : ""}`}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

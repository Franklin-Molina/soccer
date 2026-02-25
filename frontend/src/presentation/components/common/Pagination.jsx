import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelect from './CustomSelect.jsx'; // Importar CustomSelect

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
}) => {
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-4 sm:px-6 py-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <p className="text-sm text-slate-600 dark:text-gray-300 text-center sm:text-left">
            Mostrando <span className="font-semibold text-slate-900 dark:text-white">{startItem}</span> a{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{endItem}</span> de{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span> Canchas
          </p>

        {/*   <div className="flex items-center gap-2 justify-center sm:justify-start">
            <label className="text-sm text-slate-600 dark:text-gray-300">Mostrar:</label>
            <CustomSelect
              options={[
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
              ]}
              value={itemsPerPage}
              onChange={(value) => {
                setItemsPerPage(Number(value));
                onPageChange(1);
              }}
              direction="up"
            />
          </div> */}
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="shrink-0 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1 sm:px-2 text-slate-500 dark:text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-[#16A34A] via-[#0F172A] to-[#16A34A] dark:from-[#16A34A]'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="shrink-0 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

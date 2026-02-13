import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  direction = "down",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev <= 0 ? options.length - 1 : prev - 1
        );
      } else if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        handleOptionClick(options[focusedIndex].value);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex, options]);

  // Desplazar la lista al navegar
  useEffect(() => {
    if (listRef.current && focusedIndex >= 0) {
      const optionEl = listRef.current.children[focusedIndex];
      if (optionEl) {
        optionEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [focusedIndex]);

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button" // Añadir type="button" para evitar el envío del formulario padre
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-10 ${
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          } w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden animate-fade-in-down`}
        >
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => handleOptionClick(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  value === option.value
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : focusedIndex === index
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CustomSelect;

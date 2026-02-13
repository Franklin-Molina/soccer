/**
 * @fileoverview Utilidades para formatear datos en la capa de presentación.
 */

/**
 * Formatea un número como una cadena de precio con separadores de miles.
 * Por ejemplo, 43333.00 se convierte en "43.333".
 *
 * @param {number} price El valor numérico del precio.
 * @returns {string} El precio formateado como una cadena.
 */
export const formatPrice = (price) => {
  let numericPrice = parseFloat(price); // Intenta convertir a número
  if (isNaN(numericPrice)) {
    return String(price); // Retorna el valor original si no es un número válido
  }
  // Formatea el número sin decimales y con separador de miles (punto)
  // y sin separador decimal.
  return numericPrice.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  });
};

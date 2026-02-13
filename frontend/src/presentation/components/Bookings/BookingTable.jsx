import React from 'react';
import Swal from 'sweetalert2';
import Pagination from '../common/Pagination.jsx';
import { Trash2, SearchX, Calendar, Clock, User, Hash, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ActionButton = ({ onClick, icon: Icon, title, className }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 ${className}`}
      title={title}
    >
      <Icon size={16} />
    </button>
);

const BookingStatus = ({ status }) => {
    const statusStyles = {
      'Confirmada': 'bg-blue-100/80 text-blue-800 border-blue-200/80 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/80',
      'Pendiente': 'bg-amber-100/80 text-amber-800 border-amber-200/80 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700/80',
      'Cancelada': 'bg-red-100/80 text-red-800 border-red-200/80 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/80',
      'Completada': 'bg-emerald-100/80 text-emerald-800 border-emerald-200/80 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700/80',
    };
  
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>
        {status}
      </span>
    );
};

const PaymentStatus = ({ status }) => {
    const statusStyles = {
        'pagado': 'bg-emerald-100/80 text-emerald-800 border-emerald-200/80 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700/80',
        'pendiente': 'bg-amber-100/80 text-amber-800 border-amber-200/80 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700/80',
        'reembolsado': 'bg-slate-100/80 text-slate-800 border-slate-200/80 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/80',
    };

    if (typeof status !== 'string' || !status) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100/80 text-slate-800 border-slate-200/80 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/80">
                N/A
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status.toLowerCase()] || 'bg-slate-100 text-slate-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "d MMM, yyyy 'a las' HH:mm", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
};

const NoResults = () => (
    <div className="text-center py-12">
      <SearchX className="mx-auto h-12 w-12 text-slate-400" />
      <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-white">No se encontraron reservas</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Intenta ajustar los filtros de búsqueda.
      </p>
    </div>
);


// Componentes para la tabla y las tarjetas
const BookingTableRow = ({ booking, index, handleCancelBooking }) => (
    <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">{index}</td>
        <td className="px-4 py-3 text-sm text-slate-800 dark:text-white font-semibold">{booking.court_details.name}</td>
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{`${booking.user_details.first_name} ${booking.user_details.last_name}`}</td>
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{formatDate(booking.start_time)}</td>
        <td className="px-4 py-3"><BookingStatus status={booking.status} /></td>
        <td className="px-4 py-3"><PaymentStatus status={booking.payment_status} /></td>
        <td className="px-4 py-3 text-right">
            <ActionButton onClick={() => handleCancelBooking(booking.id)} icon={Trash2} title="Cancelar Reserva" className="hover:text-red-500" />
        </td>
    </tr>
);

const BookingCard = ({ booking, index, handleCancelBooking }) => (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-slate-800 dark:text-white">{booking.court_details.name}</p>
                <p className="text-xs text-slate-400">ID Reserva: #{booking.id}</p>
            </div>
            <BookingStatus status={booking.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">{`${booking.user_details.first_name} ${booking.user_details.last_name}`}</span>
            </div>
            <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-slate-400" />
                <PaymentStatus status={booking.payment_status} />
            </div>
            <div className="flex items-center gap-2 col-span-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">{formatDate(booking.start_time)}</span>
            </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-end">
            <ActionButton onClick={() => handleCancelBooking(booking.id)} icon={Trash2} title="Cancelar Reserva" className="hover:text-red-500" />
        </div>
    </div>
);


const BookingTable = ({ bookings, currentPage, totalPages, setCurrentPage, itemsPerPage, setItemsPerPage, totalBookings, deleteBooking, getRowNumber }) => {
    const handleCancelBooking = (bookingId) => {
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, cancelar',
          cancelButtonText: 'No, mantener',
          customClass: {
            popup: 'dark:bg-slate-800 dark:text-white',
          }
        }).then((result) => {
          if (result.isConfirmed) {
            deleteBooking(bookingId);
            Swal.fire({
                title: '¡Cancelada!', 
                text: 'La reserva ha sido cancelada.', 
                icon: 'success',
                customClass: {
                    popup: 'dark:bg-slate-800 dark:text-white',
                }
            });
          }
        });
    };

    if (!bookings || bookings.length === 0) return <NoResults />;

    return (
        <div className="space-y-4">
             {/* Vista de tarjetas para móviles */}
            <div className="md:hidden space-y-4">
                {bookings.map((booking, index) => (
                    <BookingCard key={booking.id} booking={booking} index={getRowNumber(index)} handleCancelBooking={handleCancelBooking} />
                ))}
            </div>

             {/* Vista de tabla para escritorio */}
            <div className="hidden md:block">
                <table className="w-full">
                    <thead className="bg-slate-100/50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cancha</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuario</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha y Hora</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pago</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {bookings.map((booking, index) => (
                            <BookingTableRow key={booking.id} booking={booking} index={getRowNumber(index)} handleCancelBooking={handleCancelBooking} />
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
                totalItems={totalBookings}
            />
        </div>
    );
};

export default BookingTable;

import React from "react";
import { useFetchBookings } from "../../hooks/bookings/useFetchBookings";
import Spinner from "../../components/common/Spinner";
import { Calendar, Clock, MapPin } from "lucide-react";

const MyBookingsPage = () => {
  const { bookings, loading, error } = useFetchBookings();

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center mt-10">Error al cargar las reservas: {error.message}</p>;

  const upcomingBookings = bookings.filter(
    (booking) => new Date(booking.start_time) >= new Date()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Mis Reservas
        </h2>

        {upcomingBookings.length > 0 ? (
          <ul className="space-y-4">
            {upcomingBookings.map((booking) => (
              <li
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {booking.court_details.name}
                    </h3>

                    <div className="mt-2 text-gray-600 dark:text-gray-300 flex flex-col sm:flex-row gap-2 sm:gap-6">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {new Date(booking.start_time).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        {new Date(booking.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        {booking.court_details.location || "Ubicación no disponible"}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-12 text-lg">
            No tienes próximas reservas.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;

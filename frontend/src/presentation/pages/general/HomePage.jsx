import React from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/common/Pagination.jsx';
import { useHomePageLogic } from '../../hooks/general/useHomePageLogic.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';

function HomePage({ openAuthModal }) {
  const { isAuthenticated } = useAuth();
  const {
    courts,
    loading,
    error,
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    showPagination,
  } = useHomePageLogic();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
       <Spinner/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg font-semibold bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
        Error al cargar canchas: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700">
        <div className="absolute inset-0 bg-black/20"></div>
       

        <div className="relative max-w-8xl mx-auto px-6 py-24 sm:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 text-white text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Reserva disponible 24/7
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            Reserva tu cancha ya!
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              ya
            </span>
          </h1>

          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Las mejores canchas deportivas a tu alcance. Reserva en segundos y disfruta del juego.
          </p>

          {/* Search */}
          <div className="max-w-2xl w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, ubicación o deporte..."
                className="w-full px-6 py-4 pr-32 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-purple-700 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-8xl mx-auto px-6 -mt-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Canchas', value: 'Disponibles', color: 'from-blue-500 to-blue-600', icon: courts.length },
            { label: 'Reserva', value: 'Instantánea', color: 'from-green-500 to-green-600', icon: '⚡' },
            { label: 'Calificación', value: '4.9/5.0', color: 'from-purple-500 to-purple-600', icon: '★' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>

                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COURTS */}
      <section className="max-w-8xl mx-auto px-6 py-20">
        <div className="flex flex-wrap items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Canchas Destacadas</h2>
            <p className="text-gray-600 dark:text-gray-400">Explora nuestras mejores opciones disponibles</p>
          </div>

          <div className="flex gap-2">
            {['Todas', 'Fútbol', 'Baloncesto'].map((label, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-lg font-medium transition ${i === 0
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {courts.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No hay canchas disponibles en este momento.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <div
                key={court.id}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
              >
                {court.images?.length > 0 && (
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={court.images[0].image}
                      alt={court.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{court.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-white text-xl font-semibold">${(court.price / 1000).toFixed(0)}K</p>
                        <span className="bg-white/20 text-yellow-400 px-3 py-1.5 rounded-full text-sm font-semibold">
                          ★ 4.9
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 line-clamp-2">
                    añadir descripcion corta de la extensa xd
                  </p>

                  <Link
                    to={`/courts/${court.id}`}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl block text-center transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Reservar Ahora
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Paginación */}
        {showPagination && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalItems={totalItems}
            />
          </div>
        )}
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="max-w-8xl mx-auto px-6 pb-20">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-4">¿No tienes cuenta?</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Únete a nuestra plataforma y comienza a reservar un espacio deportivo.
              </p>
              <button className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl animate-float animate-pulse-glow">
                <Link to="/register">
                  Registrarse
                </Link>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;

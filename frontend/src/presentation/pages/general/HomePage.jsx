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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
       <Spinner/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg font-semibold bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        Error al cargar canchas: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 pt-0 sm:pt-0">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#16A34A] via-[#0F172A] to-[#16A34A] dark:from-[#16A34A] dark:via-[#0F172A] dark:to-[#16A34A]">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-center bg-cover opacity-30" style={{backgroundImage: 'url(/logo2.jpg)'}}></div>

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 py-20 sm:py-32  flex flex-col items-center text-center ">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-6 text-white text-xs sm:text-sm font-medium">
            <span className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse"></span>
            Reserva disponible 24/7
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Reserva tu cancha
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-[#FACC15]">
              ahora mismo
            </span>
          </h1>

       {/*    <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Las mejores canchas deportivas a tu alcance. Reserva en segundos y disfruta del juego.
          </p> */}

          {/* Search */}
          <div className="max-w-2xl w-full px-2 sm:px-0">
            <div className="relative flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Buscar cancha o deporte..."
                className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-zinc-800 
                border border-zinc-200 dark:border-zinc-700
                focus:ring-2 focus:ring-emerald-500 
                focus:outline-none"
              />
              <button className="sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 bg-emerald-600 hover:from-[#16A34A] hover:to-[#0F172A] text-white px-8 py-4 sm:py-2.5 rounded-2xl sm:rounded-xl font-bold sm:font-semibold shadow-lg transition-all w-full sm:w-auto">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-14 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { label: 'Canchas', value: 'Disponibles', color: 'from-[#16A34A] to-[#0F172A]', icon: courts.length },
           /*  { label: 'Reserva', value: 'Instantánea', color: 'from-[#FACC15] to-[#16A34A]', icon: '⚡' },
            { label: 'Calificación', value: '4.9/5.0', color: 'from-[#0F172A] to-[#16A34A]', icon: '★' }, */
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shrink-0`}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">{item.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COURTS */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Canchas Destacadas</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Explora nuestras mejores opciones disponibles</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
            {['Todas', 'Fútbol', 'Baloncesto'].map((label, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm sm:text-base ${i === 0
                    ? 'bg-[#16A34A] text-white hover:bg-[#0F172A]'
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
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <div
                key={court.id}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
              >
                {court.images?.length > 0 && (
                  <div className="relative h-60 sm:h-72 overflow-hidden">
                    <img
                      src={court.images[0].image_url || court.images[0].image}
                      alt={court.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{court.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-white text-lg sm:text-xl font-semibold">${(court.price / 1000).toFixed(0)}K</p>
                        <span className="bg-white/20 backdrop-blur-md text-[#FACC15] px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border border-white/10">
                          ★ 4.9
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-4 sm:mb-5 line-clamp-2">
                    Disfruta de una experiencia única en nuestra cancha de alta calidad. Perfecta para tus partidos con amigos.
                  </p>

                  <Link
                    to={`/courts/${court.id}`}
                    className="w-full bg-gradient-to-r from-[#16A34A] to-[#0F172A] hover:from-[#16A34A] hover:to-[#0F172A] text-white font-bold py-3.5 sm:py-3 rounded-xl block text-center transition-all duration-300 shadow-md hover:shadow-xl transform active:scale-95 sm:hover:-translate-y-1"
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
        <section className="max-w-8xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
          <div className="bg-gradient-to-r from-[#16A34A] via-[#0F172A] to-[#16A34A] dark:from-[#16A34A] dark:via-[#0F172A] dark:to-[#16A34A] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">¿No tienes cuenta?</h2>
              <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Únete a nuestra plataforma y comienza a reservar un espacio deportivo en segundos.
              </p>
              <button className="bg-white text-[#16A34A] font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl animate-float animate-pulse-glow">
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
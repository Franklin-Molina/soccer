import React, { useState, useEffect } from "react";
import { Eye, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Rows4  } from "lucide-react";

function CourtImageGallery({ 
  court, 
  openModal, 
  closeModal, 
  selectedImage, 
  currentImageIndex, 
  handlePreviousImage, 
  handleNextImage,
  zoom, 
  handleZoomIn, 
  handleZoomOut
}) {
  const hasMultipleImages = court && court.images && court.images.length > 1;

  // Efecto para controlar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Función de limpieza para restaurar el scroll si el componente se desmonta
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  // Efecto para la navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      if (e.key === 'ArrowLeft') {
        handlePreviousImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Limpieza del event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, handlePreviousImage, handleNextImage, closeModal]);

  return (
    <>
      {court.images && court.images.length > 0 && (
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Eye className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              Galería de Fotos
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {court.images.map((image, index) => {
              const imgSource = image.image_url || image.image;
              return (
                <SmoothImageCard
                  key={image.id}
                  image={imgSource}
                  courtName={court.name}
                  openModal={() => openModal(imgSource)}
                  index={index}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de imagen expandida (estilo ImageFlow) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black z-50 flex flex-col"
          onClick={closeModal}
        >
          {/* Top Toolbar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <div className="flex items-center gap-4 text-white">
                 <Rows4 className="w-5 h-5 text-black-500 dark:text-white-400" />
                <h2 className="text-xl font-semibold">{court.name}</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-white text-sm bg-white/10 px-3 py-1 rounded-full">
                  {currentImageIndex + 1} / {court.images.length}
                </span>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-lg text-white transition-all"
                  title="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div 
            className="flex-1 flex items-center justify-center relative overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Imagen expandida"
              className="max-w-full max-h-full object-contain select-none transition-transform duration-300 ease-in-out"
              style={{ transform: `scale(${zoom})` }}
              draggable="false"
            />
          </div>

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePreviousImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all backdrop-blur-sm"
                title="Anterior"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all backdrop-blur-sm"
                title="Siguiente"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Bottom Toolbar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-4xl mx-auto">
              {/* Zoom Controls */}
              <div className="flex justify-center items-center gap-2 mb-4">
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                  title="Alejar"
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                  title="Acercar"
                >
                  <ZoomIn size={20} />
                </button>
              </div>

              {/* Thumbnails */}
              {hasMultipleImages && (
                <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                  {court.images.map((image, index) => {
                    const imgSource = image.image_url || image.image;
                    return (
                      <img
                        key={image.id}
                        src={imgSource}
                        alt={`Miniatura ${index + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(imgSource);
                        }}
                      className={`h-16 w-24 object-cover rounded-lg cursor-pointer transition-all ${
                        index === currentImageIndex
                          ? ''
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    />
                  );
                })}
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SmoothImageCard({ image, courtName, openModal, index }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative cursor-pointer group rounded-2xl overflow-hidden shadow-sm"
      onClick={openModal} // openModal ahora solo abre el modal para la imagen actual de la tarjeta
    >
      {/* Skeleton loader mientras carga */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-300 dark:bg-slate-700" />
      )}

     <img
        src={image}
        alt={`Imagen de ${courtName}`}
        onLoad={() => setLoaded(true)}
        className={`w-full h-48 object-cover transition-all duration-500 
        ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Eye className="w-10 h-10 text-white drop-shadow-lg" />
      </div>
    </div>
  );
}

export default CourtImageGallery;

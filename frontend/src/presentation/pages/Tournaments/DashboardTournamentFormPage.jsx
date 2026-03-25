import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, ArrowLeft, Save, Image as ImageIcon, Calendar, MapPin, DollarSign, Users, Award, X, Camera } from 'lucide-react';
// Asegúrate de que la ruta a tu hook sea la correcta:
import { useTournamentForm } from '../../../presentation/hooks/tournaments/useTournamentForm'; 
import Spinner from '../../components/common/Spinner';

function DashboardTournamentFormPage() {
  const { id } = useParams(); // Si hay ID en la URL, estamos en modo "Edición"
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  // Consumimos el hook mágico que maneja toda la lógica pesada
  const { formData, handleChange, handleRemoveImage, handleSubmit, loading, initialLoading } = useTournamentForm(id);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto animate-in fade-in duration-500">
      
      {/* Cabecera */}
      <div className="flex items-center mb-8 gap-4">
        <Link 
          to="/dashboard/tournaments" 
          className="p-2 md:p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center">
            {isEditing ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">
            {isEditing ? 'Modifica los detalles de este torneo.' : 'Configura las reglas, fechas y premios de tu nueva copa.'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* SECCIÓN 1: Info Principal */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-emerald-500" /> Información Principal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Nombre del Torneo *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ej: Copa de Verano 2026" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Descripción / Reglas</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none" placeholder="Escribe aquí las reglas básicas, requisitos, etc..."></textarea>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* SECCIÓN 2: Detalles Logísticos */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" /> Fechas y Logística
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Fecha de Inicio *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Fecha de Fin *</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center"><MapPin className="w-4 h-4 mr-1"/> Ubicación</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ej: Sede Principal - Cancha 1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center"><Users className="w-4 h-4 mr-1"/> Cupo Máximo *</label>
                <input type="number" name="maxTeams" value={formData.maxTeams} onChange={handleChange} required min="2" className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ej: 16" />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* SECCIÓN 3: Competencia y Premios */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-amber-500" /> Competencia y Premios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center"><DollarSign className="w-4 h-4 mr-1"/> Costo Inscripción</label>
                <input type="text" name="registrationFee" value={formData.registrationFee} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ej: $50 USD" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center"><Trophy className="w-4 h-4 mr-1"/> Premio Mayor</label>
                <input type="text" name="prize" value={formData.prize} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ej: $500 USD + Trofeo" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Nivel / Categoría</label>
                <input type="text" name="level" value={formData.level} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ej: Amateur, Libre, Veteranos..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Estado del Torneo</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer">
                  <option value="open">Abierto (Recibiendo Inscripciones)</option>
                  <option value="in_progress">En Juego</option>
                  <option value="finished">Finalizado</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* SECCIÓN 4: Imagen de Portada */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-purple-500" /> Imagen de Portada
            </h3>
            
            <div className="flex flex-wrap gap-6">
              {formData.coverImage ? (
                <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden group shadow-lg border border-slate-200 dark:border-slate-700">
                  <img
                    src={
                      formData.coverImage instanceof File
                        ? URL.createObjectURL(formData.coverImage)
                        : formData.coverImage
                    }
                    alt="Preview Portada"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition-all backdrop-blur-sm"
                    title="Eliminar imagen"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div 
                  className="w-full max-w-sm aspect-video border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">Haz clic para subir portada</p>
                  <p className="text-xs text-slate-500 mt-1">Recomendado: 1920x1080px (JPG, PNG)</p>
                </div>
              )}
              
              <input 
                type="file" 
                name="coverImage" 
                ref={fileInputRef} 
                onChange={handleChange} 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
              />
            </div>
          </div>

        </div>

        {/* FOOTER: Botón de Guardar */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
          >
            {loading ? (
              <span className="flex items-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Guardando...</span>
            ) : (
              <span className="flex items-center"><Save className="w-5 h-5 mr-2" /> {isEditing ? 'Guardar Cambios' : 'Crear Torneo'}</span>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}

export default DashboardTournamentFormPage;
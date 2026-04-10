import { Trophy, ArrowRight, MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TournamentsCard() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/tournaments")}
      className="group relative cursor-pointer rounded-2xl overflow-hidden h-55 w-full max-w-2xl 
      border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)] 
      hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all duration-500"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2093&auto=format&fit=crop"
          alt="Stadium"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-yellow-900/10 mix-blend-overlay" />
      </div>

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col justify-between z-10">
        
        {/* Badge */}
        <div className="absolute top-5 right-5 bg-[#FDE047] text-black text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg">
          Nuevo
        </div>

        <div className="flex items-start gap-5">
          {/* Icon Container */}
          <div className="mt-1 p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" strokeWidth={1.5} />
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-white-400 text-sm font-medium tracking-wide">
              Torneos
            </span>
            <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-">
              Compite y gana
            </h3>
            <p className="text-white-400/90 text-base font-medium">
              Participa en ligas activas
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg group-hover:gap-3 transition-all duration-300">
            <span>Ver torneos</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={3} />
          </div>

          <div className="relative mr-2">
            <MoveRight 
              className="w-9 h-9 text-yellow-400 opacity-90 group-hover:opacity-100 transition-all duration-300 drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]" 
              strokeWidth={2.5} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

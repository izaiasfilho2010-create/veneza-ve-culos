import React from 'react';
import { Gauge, Cog, Fuel, ArrowRight } from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect }) => {
  const isSold = vehicle.status === 'sold';
  const mainImage = vehicle.images[vehicle.mainImageIndex] || vehicle.images[0] || '';

  // Format price in BRL
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  // Format mileage
  const formattedKm = new Intl.NumberFormat('pt-BR').format(vehicle.mileage) + ' km';

  return (
    <div
      onClick={() => onSelect(vehicle)}
      className="card-luxury rounded-2xl flex flex-col overflow-hidden cursor-pointer group"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={`${vehicle.make} ${vehicle.model}`}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-4 text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Veneza Veículos
            </span>
            <span className="text-[11px] text-zinc-400 mt-1">Fotografia em processamento</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isSold ? (
            <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-bold tracking-widest uppercase shadow-xs">
              Vendido
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-amber-900 border border-amber-200 text-[10px] font-semibold tracking-wider uppercase shadow-xs">
              Disponível
            </span>
          )}
        </div>

        {/* Year Pill Top Right */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
            {vehicle.manufactureYear === vehicle.modelYear
              ? vehicle.modelYear
              : `${vehicle.manufactureYear}/${vehicle.modelYear}`}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Brand & Model */}
          <div className="mb-2">
            <span className="text-[11px] uppercase tracking-widest text-[#b8860b] font-bold">
              {vehicle.make}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-[#b8860b] transition-colors leading-snug truncate">
              {vehicle.model}
            </h3>
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              {vehicle.version}
            </p>
          </div>

          {/* Clean Key Specs */}
          <div className="flex items-center gap-3 py-2 text-[11px] text-zinc-600 border-t border-gray-100">
            <span className="flex items-center gap-1 truncate">
              <Gauge className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {formattedKm}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1 truncate">
              <Cog className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {vehicle.transmission}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="truncate">{vehicle.fuel}</span>
          </div>
        </div>

        {/* Bottom Price & Button */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase text-zinc-400 block font-medium">
              Valor
            </span>
            <span className="text-lg sm:text-xl font-bold font-luxury text-zinc-900 group-hover:text-[#b8860b] transition-colors">
              {formattedPrice}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(vehicle);
            }}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-[#b8860b] text-zinc-700 hover:text-white border border-gray-200 hover:border-[#b8860b] flex items-center justify-center transition-all shadow-xs"
            title="Ver Detalhes do Veículo"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

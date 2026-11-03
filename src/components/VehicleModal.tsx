import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Gauge,
  Calendar,
  Fuel,
  Cog,
  Palette,
  DoorClosed,
  CheckCircle,
  Share2,
  Check,
} from 'lucide-react';
import { Vehicle, SiteSettings } from '../types';

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  settings: SiteSettings;
  availableVehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  onClose,
  settings,
  availableVehicles,
  onSelectVehicle,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setActiveImageIndex(vehicle.mainImageIndex || 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [vehicle]);

  // Handle ESC key and arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (vehicle && vehicle.images.length > 1) {
        if (e.key === 'ArrowRight') {
          setActiveImageIndex((prev) => (prev + 1) % vehicle.images.length);
        } else if (e.key === 'ArrowLeft') {
          setActiveImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vehicle, onClose]);

  if (!vehicle) return null;

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [];
  const currentImage = images[activeImageIndex] || '';
  const isSold = vehicle.status === 'sold';

  // Format price
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  const formattedKm = new Intl.NumberFormat('pt-BR').format(vehicle.mileage) + ' km';

  // Official pre-filled WhatsApp message
  const cleanPhone = settings.whatsapp.replace(/\D/g, '');
  const rawMessage = `Olá! Tenho interesse no ${vehicle.make} ${vehicle.model} da Veneza Veículos. Gostaria de mais informações.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;

  // Related / Suggested vehicles
  const suggestedVehicles = availableVehicles
    .filter((v) => v.id !== vehicle.id && v.status === 'available')
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${vehicle.make} ${vehicle.model} - Veneza Veículos`,
          text: `Confira este ${vehicle.make} ${vehicle.model} na Veneza Veículos:`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-gray-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#b8860b] font-bold">
              {vehicle.make}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-sm font-bold text-zinc-900 truncate max-w-xs sm:max-w-md">
              {vehicle.model} {vehicle.version}
            </span>
            {isSold && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold tracking-wider uppercase">
                Vendido
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-zinc-600 transition-colors"
              title="Compartilhar veículo"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-zinc-600 hover:text-zinc-900 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 group">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                    Sem fotografia disponível
                  </div>
                )}

                {isSold && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-widest uppercase shadow-md">
                    Vendido
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-zinc-800 border border-gray-200 flex items-center justify-center transition-all shadow-md"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-zinc-800 border border-gray-200 flex items-center justify-center transition-all shadow-md"
                      aria-label="Próxima foto"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                      {activeImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#b8860b] shadow-xs'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specs & CTA Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#b8860b] font-bold">
                  {vehicle.make}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 font-luxury mt-0.5">
                  {vehicle.model}
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  {vehicle.version}
                </p>

                {/* Price Display */}
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <span className="text-[10px] uppercase tracking-wider text-amber-900/70 font-semibold block">
                    Valor à vista
                  </span>
                  <div className="text-3xl font-bold font-luxury text-[#b8860b] mt-0.5">
                    {formattedPrice}
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#b8860b] shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase block font-semibold">Ano Fab./Mod.</span>
                      <span className="text-xs font-bold text-zinc-800">
                        {vehicle.manufactureYear} / {vehicle.modelYear}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                    <Gauge className="w-4 h-4 text-[#b8860b] shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase block font-semibold">Quilometragem</span>
                      <span className="text-xs font-bold text-zinc-800">{formattedKm}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                    <Cog className="w-4 h-4 text-[#b8860b] shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase block font-semibold">Câmbio</span>
                      <span className="text-xs font-bold text-zinc-800">{vehicle.transmission}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                    <Fuel className="w-4 h-4 text-[#b8860b] shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase block font-semibold">Combustível</span>
                      <span className="text-xs font-bold text-zinc-800">{vehicle.fuel}</span>
                    </div>
                  </div>

                  {vehicle.color && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                      <Palette className="w-4 h-4 text-[#b8860b] shrink-0" />
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase block font-semibold">Cor</span>
                        <span className="text-xs font-bold text-zinc-800">{vehicle.color}</span>
                      </div>
                    </div>
                  )}

                  {vehicle.doors && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                      <DoorClosed className="w-4 h-4 text-[#b8860b] shrink-0" />
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase block font-semibold">Portas</span>
                        <span className="text-xs font-bold text-zinc-800">{vehicle.doors} portas</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main WhatsApp CTA */}
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gold-button w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Tenho interesse neste veículo</span>
                </a>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {vehicle.description && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-base font-bold text-zinc-900 font-luxury mb-2">
                Descrição
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-base font-bold text-zinc-900 font-luxury mb-3">
                Opcionais
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {vehicle.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs text-zinc-700 font-medium"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#b8860b] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestedVehicles.length > 0 && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-base font-bold text-zinc-900 font-luxury mb-3">
                Outros Veículos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suggestedVehicles.map((sug) => {
                  const sugImg = sug.images[sug.mainImageIndex] || sug.images[0] || '';
                  const sugPrice = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  }).format(sug.price);

                  return (
                    <div
                      key={sug.id}
                      onClick={() => onSelectVehicle(sug)}
                      className="group bg-gray-50 hover:bg-white rounded-xl border border-gray-200 p-2.5 transition-all cursor-pointer flex gap-2.5 items-center shadow-2xs hover:shadow-xs"
                    >
                      <div className="w-14 h-11 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                        {sugImg ? (
                          <img
                            src={sugImg}
                            alt={`${sug.make} ${sug.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#b8860b] uppercase font-bold block truncate">
                          {sug.make}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 truncate">
                          {sug.model}
                        </h4>
                        <span className="text-xs font-bold text-zinc-800 font-luxury block">
                          {sugPrice}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

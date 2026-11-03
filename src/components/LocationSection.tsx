import React, { useMemo } from 'react';
import {
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  Navigation,
} from 'lucide-react';
import { SiteSettings } from '../types';

interface LocationSectionProps {
  settings: SiteSettings;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ settings }) => {
  // Check if store is open right now based on business hours
  const isOpenNow = useMemo(() => {
    try {
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes;

      if (day === 0) return false;
      if (day === 6) return currentTime >= 8 * 60 && currentTime < 13 * 60;
      return currentTime >= 8 * 60 && currentTime < 18 * 60;
    } catch {
      return true;
    }
  }, []);

  const hoursList = [
    { days: 'Segunda a Sexta-feira', time: '08:00 às 18:00' },
    { days: 'Sábado', time: '08:00 às 13:00' },
    { days: 'Domingo', time: 'Fechado' },
  ];

  const mapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Veneza Veículos R. Paulo VI, 1406 - Heliópolis, Garanhuns - PE, 55297-350'
  )}`;

  return (
    <section id="contato" className="py-20 bg-white border-t border-gray-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#b8860b] font-bold mb-2">
            <MapPin className="w-4 h-4" />
            <span>Showroom Físico</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-luxury text-zinc-900">
            Localização & Atendimento
          </h2>
          <p className="text-sm text-zinc-500 mt-2">
            Visite nossa loja em Heliópolis, Garanhuns - PE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Address & Contacts */}
          <div className="card-luxury rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b8860b] mb-4">
                <MapPin className="w-5 h-5" />
              </div>

              <span className="text-[11px] font-bold text-[#b8860b] uppercase tracking-wider block">
                Endereço
              </span>
              <h3 className="text-lg font-bold text-zinc-900 font-luxury mt-1">
                {settings.address}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Garanhuns - PE • CEP: 55297-350
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2.5">
              <a
                href={mapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Traçar Rota no Maps</span>
              </a>

              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-zinc-800 border border-gray-200"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp: (87) 99988-1995</span>
              </a>

              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-zinc-800 border border-gray-200"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
                  <span>@veiculosveneza</span>
                </a>
              )}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="card-luxury rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b8860b]">
                  <Clock className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-zinc-700">
                    {isOpenNow ? 'Aberto Agora' : 'Fechado no Momento'}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold text-[#b8860b] uppercase tracking-wider block mb-1">
                Horários
              </span>
              <h3 className="text-lg font-bold text-zinc-900 font-luxury mb-4">
                Funcionamento da Loja
              </h3>

              <div className="space-y-2">
                {hoursList.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 text-xs"
                  >
                    <span className="font-medium text-zinc-700">{h.days}</span>
                    <span
                      className={`font-semibold ${
                        h.time === 'Fechado' ? 'text-zinc-400' : 'text-[#b8860b]'
                      }`}
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 pt-3 border-t border-gray-100">
              Atendimento presencial e online via WhatsApp durante todo o expediente.
            </p>
          </div>
        </div>
      </div>

      {/* Smooth blending gradient into dark footer */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-[#090a0d] pointer-events-none" />
    </section>
  );
};

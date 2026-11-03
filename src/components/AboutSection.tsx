import React from 'react';
import { MapPin, MessageCircle, Award, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../types';

interface AboutSectionProps {
  settings: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  return (
    <section id="sobre" className="py-24 bg-[#0a1528] text-white border-y border-[#182844] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Facade Image */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-[#1e3458] shadow-2xl group">
              <img
                src={settings.facadeUrl || 'https://i.postimg.cc/5tDV9mb2/veneza-veiculos.jpg'}
                alt="Fachada Oficial Veneza Veículos"
                className="w-full h-[340px] sm:h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1528]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[#0e1c36]/90 border border-[#213b63] backdrop-blur-md flex items-center gap-3 shadow-lg">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                <p className="text-xs text-zinc-200 font-medium truncate">
                  {settings.address}
                </p>
              </div>
            </div>
          </div>

          {/* Institutional Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122340] border border-[#d4af37]/40 text-[#d4af37] text-xs uppercase tracking-widest font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Concessionária em Garanhuns</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-luxury text-white">
              Sobre a <span className="gold-gradient-text">Veneza Veículos</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              {settings.aboutText}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0f1f3a] border border-[#1b3154]">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="text-xs font-semibold text-white">Procedência e Vistoria</span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0f1f3a] border border-[#1b3154]">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="text-xs font-semibold text-white">Atendimento Personalizado</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de conversar com a equipe da Veneza Veículos.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar Conosco</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

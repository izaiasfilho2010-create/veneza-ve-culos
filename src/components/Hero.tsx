import React from 'react';
import { ArrowDown, MessageCircle, MapPin } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExploreClick }) => {
  return (
    <section id="hero" className="relative min-h-[85vh] lg:min-h-screen flex items-center justify-center pt-24 pb-16 bg-[#08090b] text-white overflow-hidden">
      {/* Background with Official Facade Photograph & Deep Dark Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.facadeUrl || 'https://i.postimg.cc/5tDV9mb2/veneza-veiculos.jpg'}
          alt="Fachada Oficial Veneza Veículos"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-[#08090b]/80 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090b]/90 via-[#08090b]/65 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl py-6">
          {/* Top Location Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181a22]/80 border border-[#d4af37]/35 text-[#d4af37] text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-6 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></span>
            <span>Heliópolis • Garanhuns - PE</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-luxury mb-4 leading-tight">
            VENEZA <span className="gold-gradient-text">VEÍCULOS</span>
          </h1>

          {/* Tagline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-[#e4e4e7] mb-5 font-luxury tracking-wide">
            "Seu próximo carro está aqui."
          </h2>

          {/* Refined Description */}
          <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed mb-8 max-w-xl font-normal">
            Excelência automotiva, procedência comprovada e transparência absoluta. 
            Seminovos selecionados para quem busca segurança e a certeza do melhor negócio.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onExploreClick}
              className="gold-button px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl group"
            >
              <span>Explorar veículos</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de falar com um consultor da Veneza Veículos.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider text-white bg-[#181b22]/90 hover:bg-[#222632] border border-[#2e3444] hover:border-[#d4af37]/50 flex items-center justify-center gap-2 transition-all shadow-md backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Fale conosco</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

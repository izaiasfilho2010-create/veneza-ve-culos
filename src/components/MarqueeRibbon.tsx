import React from 'react';
import { Sparkles, ShieldCheck, Award, MapPin } from 'lucide-react';

export const MarqueeRibbon: React.FC = () => {
  const items = [
    { text: 'VENEZA VEÍCULOS', icon: '✦' },
    { text: 'SEMINOVOS SELECIONADOS', icon: '★' },
    { text: 'GARANHUNS - PE', icon: '✦' },
    { text: 'PROCEDÊNCIA RIGOROSAMENTE INSPECIONADA', icon: '★' },
    { text: 'ATENDIMENTO EXCLUSIVO', icon: '✦' },
    { text: 'AVALIAÇÃO JUSTA DO SEU USADO', icon: '★' },
    { text: 'TRANSPARÊNCIA E CONFIANÇA', icon: '✦' },
    { text: 'SEU PRÓXIMO CARRO ESTÁ AQUI', icon: '★' },
  ];

  return (
    <div className="relative w-full bg-[#0a0f1d] border-y border-[#d4af37]/35 py-3 overflow-hidden shadow-md select-none z-20">
      <div className="marquee-container">
        {/* First track */}
        <div className="marquee-content flex items-center gap-8 text-xs font-bold tracking-widest uppercase">
          {items.map((item, idx) => (
            <div key={`track1-${idx}`} className="flex items-center gap-8 whitespace-nowrap">
              <span className="text-white hover:text-[#d4af37] transition-colors font-luxury">
                {item.text}
              </span>
              <span className="text-[#d4af37] text-xs font-normal">
                {item.icon}
              </span>
            </div>
          ))}
        </div>

        {/* Duplicate track for seamless infinite loop */}
        <div className="marquee-content flex items-center gap-8 text-xs font-bold tracking-widest uppercase" aria-hidden="true">
          {items.map((item, idx) => (
            <div key={`track2-${idx}`} className="flex items-center gap-8 whitespace-nowrap">
              <span className="text-white hover:text-[#d4af37] transition-colors font-luxury">
                {item.text}
              </span>
              <span className="text-[#d4af37] text-xs font-normal">
                {item.icon}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

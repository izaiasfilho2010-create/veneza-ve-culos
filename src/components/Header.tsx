import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, ShieldCheck, Lock } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 40;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Início', id: 'hero' },
    { label: 'Estoque', id: 'catalogo' },
    { label: 'Sobre a Veneza', id: 'sobre' },
    { label: 'Avaliações', id: 'avaliacoes' },
    { label: 'Contato', id: 'contato' },
  ];

  const handleItemClick = (id: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/90 py-3 shadow-sm'
          : 'bg-gradient-to-b from-black/85 via-black/40 to-transparent py-4 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Name */}
          <button
            onClick={() => handleItemClick('hero')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-1 flex items-center justify-center transition-all ${
                isScrolled
                  ? 'bg-white border border-gray-200 shadow-xs'
                  : 'bg-black/60 border border-[#d4af37]/40 shadow-md'
              }`}
            >
              <img
                src={settings.logoUrl || 'https://i.postimg.cc/d3tnzzpJ/logo-veneza-veiculos.png'}
                alt="Logo Veneza Veículos"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <span
                className={`font-luxury text-base sm:text-lg font-bold tracking-wider transition-colors ${
                  isScrolled
                    ? 'text-zinc-900 group-hover:text-[#b8860b]'
                    : 'text-white group-hover:text-[#d4af37]'
                }`}
              >
                {settings.name.toUpperCase()}
              </span>
              <p
                className={`text-[10px] tracking-wider uppercase font-medium ${
                  isScrolled ? 'text-zinc-500' : 'text-zinc-300'
                }`}
              >
                Garanhuns • PE
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`text-sm font-medium transition-colors tracking-wide relative py-1 ${
                  isScrolled
                    ? 'text-zinc-600 hover:text-[#b8860b]'
                    : 'text-zinc-200 hover:text-[#d4af37]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Botão discreto para o dono da concessionária acessar o painel */}
            <button
              onClick={onOpenAdmin}
              title={isAdminLoggedIn ? "Painel do Dono (Conectado)" : "Painel do Dono (Acesso Restrito)"}
              aria-label="Acessar painel do dono"
              className={`p-2.5 rounded-xl transition-all duration-200 border flex items-center justify-center cursor-pointer group ${
                isAdminLoggedIn
                  ? isScrolled
                    ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-[#b8860b]/30 border-[#d4af37] text-[#d4af37]'
                  : isScrolled
                    ? 'bg-gray-100 hover:bg-amber-50 border-gray-200 hover:border-amber-300 text-zinc-500 hover:text-amber-800'
                    : 'bg-black/40 hover:bg-black/60 border-white/15 hover:border-[#d4af37]/60 text-zinc-300 hover:text-[#d4af37]'
              }`}
            >
              <Lock className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>

            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              <MessageCircle className="w-4 h-4" />
              <span>(87) 99988-1995</span>
            </a>
          </div>

          {/* Mobile Right Actions */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Botão discreto para o dono no mobile */}
            <button
              onClick={onOpenAdmin}
              title="Painel do Dono"
              aria-label="Acessar painel do dono"
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isAdminLoggedIn
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : isScrolled
                    ? 'bg-gray-100 border-gray-200 text-zinc-600'
                    : 'bg-black/50 border-white/20 text-zinc-300'
              }`}
            >
              <Lock className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#25D366] text-white shadow-xs"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isScrolled
                  ? 'bg-gray-100 text-zinc-800'
                  : 'bg-black/60 text-white border border-white/20'
              }`}
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white text-zinc-900 border-b border-gray-200 px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-amber-50 hover:text-[#b8860b] transition-colors"
              >
                {item.label}
              </button>
            ))}

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp: (87) 99988-1995
              </a>

              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 text-zinc-800 text-xs font-medium"
                >
                  <ShieldCheck className="w-4 h-4 text-[#b8860b]" />
                  Acessar Painel do Proprietário
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

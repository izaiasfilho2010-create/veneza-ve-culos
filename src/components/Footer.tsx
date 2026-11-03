import React from 'react';
import {
  MessageCircle,
  Instagram,
  Lock,
  ArrowUp,
  ShieldCheck,
} from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#090a0d] border-t border-[#1e2330] pt-14 pb-10 text-zinc-400 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#181c26]">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p-1 bg-black/60 border border-[#d4af37]/40 flex items-center justify-center shadow-md">
              <img
                src={settings.logoUrl || 'https://i.postimg.cc/d3tnzzpJ/logo-veneza-veiculos.png'}
                alt="Logo Veneza"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-luxury text-base font-bold text-white tracking-wider">
                {settings.name.toUpperCase()}
              </span>
              <p className="text-[11px] text-zinc-500">
                Garanhuns - PE • Seminovos Selecionados
              </p>
            </div>
          </div>

          {/* Socials & Top Button */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-[#141720] hover:bg-[#25D366] text-zinc-400 hover:text-black border border-[#242836] flex items-center justify-center transition-colors shadow-sm"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#141720] hover:bg-[#E4405F] text-zinc-400 hover:text-white border border-[#242836] flex items-center justify-center transition-colors shadow-sm"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-xl bg-[#141720] hover:bg-[#d4af37] text-zinc-400 hover:text-black border border-[#242836] flex items-center justify-center transition-colors shadow-sm ml-2"
              title="Voltar ao Topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom row: copyright & discreet admin button */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>
            © {new Date().getFullYear()} {settings.name}. Todos os direitos reservados.
          </p>

          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded text-xs text-zinc-500 hover:text-[#d4af37] hover:bg-[#141720] transition-colors"
            title="Acesso Administrativo"
          >
            {isAdminLoggedIn ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[#d4af37] font-medium">Painel do Proprietário</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>Acesso Restrito</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};

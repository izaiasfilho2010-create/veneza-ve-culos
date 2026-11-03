import React, { useState } from 'react';
import { Save, Check, AlertCircle, Building2, Loader2 } from 'lucide-react';
import { SiteSettings } from '../../types';

interface SettingsFormProps {
  settings: SiteSettings;
  onSave: (updated: Partial<SiteSettings>) => Promise<void>;
  adminToken: string;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Configurações salvas e sincronizadas em tempo real!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b8860b]">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 font-luxury">
              Informações da Concessionária
            </h3>
            <p className="text-[11px] text-zinc-400">Contatos e textos institucionais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Nome da Concessionária
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              WhatsApp Oficial (com DDD)
            </label>
            <input
              type="text"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Endereço Completo
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Horários de Funcionamento
            </label>
            <input
              type="text"
              required
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Instagram Oficial
            </label>
            <input
              type="url"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Texto Institucional (Sobre a Veneza)
            </label>
            <textarea
              rows={3}
              value={formData.aboutText}
              onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

import React, { useState } from 'react';
import { KeyRound, Check, AlertCircle, Loader2, Lock } from 'lucide-react';

interface ChangePinModalProps {
  adminToken: string;
  onPinChanged: (newToken: string) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  adminToken,
  onPinChanged,
}) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^\d{6}$/.test(currentPin)) {
      setError('A senha atual deve ter exatamente 6 dígitos numéricos.');
      return;
    }
    if (!/^\d{6}$/.test(newPin)) {
      setError('A nova senha deve ter exatamente 6 dígitos numéricos.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (newPin === currentPin) {
      setError('A nova senha deve ser diferente da senha atual.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ currentPin, newPin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao alterar a senha.');
      }

      setSuccess('Senha administrativa de 6 dígitos alterada com sucesso!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');

      if (data.token) {
        onPinChanged(data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fadeIn space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b8860b]">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 font-luxury">
              Alterar Senha do Painel (6 Dígitos)
            </h3>
            <p className="text-[11px] text-zinc-400">
              Protegida com hash scrypt criptográfico no servidor
            </p>
          </div>
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Senha Atual (6 dígitos)
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Digite a senha atual"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 tracking-widest focus:outline-none focus:border-[#b8860b]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Nova Senha (6 dígitos)
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Digite a nova senha de 6 dígitos"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 tracking-widest focus:outline-none focus:border-[#b8860b]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Confirmar Nova Senha (6 dígitos)
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Repita a nova senha"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 tracking-widest focus:outline-none focus:border-[#b8860b]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Atualizando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Atualizar Senha</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, AlertCircle, Loader2 } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const handleDigitPress = (digit: string) => {
    if (lockoutSeconds > 0 || loading) return;
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 6) {
        submitPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (lockoutSeconds > 0 || loading) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    if (lockoutSeconds > 0 || loading) return;
    setPin('');
    setError(null);
  };

  const submitPin = async (fullPin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Acesso negado.');
        setPin('');
        if (res.status === 429 && data.error.includes('bloqueado')) {
          const match = data.error.match(/(\d+)\s*segundos/);
          if (match && match[1]) {
            setLockoutSeconds(parseInt(match[1], 10));
          } else {
            setLockoutSeconds(30);
          }
        }
        return;
      }

      if (data.token) {
        onSuccess(data.token);
      }
    } catch (err: any) {
      setError('Falha de conexão com o servidor de autenticação.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(val);
    setError(null);
    if (val.length === 6) {
      submitPin(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-[#b8860b] shadow-xs">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold font-luxury text-zinc-900 mb-1">
          Acesso Administrativo
        </h3>
        <p className="text-xs text-zinc-500 mb-6">
          Veneza Veículos • Autenticação do Proprietário
        </p>

        {/* Hidden input for physical keyboard entry */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={handleInputChange}
          className="opacity-0 absolute -z-10"
          autoFocus
          disabled={lockoutSeconds > 0 || loading}
        />

        {/* 6-Digit PIN Indicators */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex justify-center items-center gap-2.5 mb-6 cursor-pointer"
        >
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const hasDigit = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-10 h-12 rounded-xl flex items-center justify-center text-lg font-bold border transition-all ${
                  hasDigit
                    ? 'bg-amber-50 border-[#b8860b] text-[#b8860b] shadow-xs scale-105'
                    : 'bg-gray-50 border-gray-200 text-zinc-400'
                }`}
              >
                {hasDigit ? '•' : ''}
              </div>
            );
          })}
        </div>

        {/* Lockout Notice or Error Display */}
        {lockoutSeconds > 0 ? (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Sistema bloqueado por segurança: aguarde {lockoutSeconds}s</span>
          </div>
        ) : error ? (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <p className="text-[11px] text-zinc-400 mb-5">
            Digite a senha numérica de 6 dígitos configurada.
          </p>
        )}

        {/* Touch-Friendly Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={lockoutSeconds > 0 || loading}
              onClick={() => handleDigitPress(digit)}
              className="h-11 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-amber-100 border border-gray-200 text-base font-bold text-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            disabled={lockoutSeconds > 0 || loading || pin.length === 0}
            onClick={handleClear}
            className="h-11 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-all disabled:opacity-30"
          >
            Limpar
          </button>

          <button
            type="button"
            disabled={lockoutSeconds > 0 || loading}
            onClick={() => handleDigitPress('0')}
            className="h-11 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-amber-100 border border-gray-200 text-base font-bold text-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
          >
            0
          </button>

          <button
            type="button"
            disabled={lockoutSeconds > 0 || loading || pin.length === 0}
            onClick={handleBackspace}
            className="h-11 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-all disabled:opacity-30"
          >
            ⌫
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-xs text-[#b8860b] py-1.5">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Validando credenciais...</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 text-[10px] text-zinc-400">
          Proteção ativa no servidor • Limitação progressiva de tentativas
        </div>
      </div>
    </div>
  );
};

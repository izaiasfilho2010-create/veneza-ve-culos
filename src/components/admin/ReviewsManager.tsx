import React, { useState } from 'react';
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CustomerReview } from '../../types';

interface ReviewsManagerProps {
  reviews: CustomerReview[];
  onSaveReview: (review: Partial<CustomerReview>) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
}

export const ReviewsManager: React.FC<ReviewsManagerProps> = ({
  reviews,
  onSaveReview,
  onDeleteReview,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [isApproved, setIsApproved] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startEdit = (rev: CustomerReview) => {
    setEditingId(rev.id);
    setAuthorName(rev.authorName);
    setRating(rev.rating);
    setComment(rev.comment);
    setOriginalUrl(rev.originalUrl);
    setIsApproved(rev.isApproved);
    setShowAddForm(true);
    setError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setAuthorName('');
    setRating(5);
    setComment('');
    setOriginalUrl('');
    setIsApproved(true);
    setShowAddForm(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setError('Preencha o nome do autor e o comentário.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSaveReview({
        id: editingId || undefined,
        authorName: authorName.trim(),
        rating,
        comment: comment.trim(),
        originalUrl: originalUrl.trim(),
        isApproved,
      });
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproved = async (rev: CustomerReview) => {
    try {
      await onSaveReview({
        ...rev,
        isApproved: !rev.isApproved,
      });
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await onDeleteReview(id);
      } catch (err: any) {
        alert('Erro ao excluir avaliação: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto animate-fadeIn">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 font-luxury">
            Avaliações de Clientes ({reviews.length})
          </h3>
          <p className="text-[11px] text-zinc-400">
            Depoimentos reais publicados na página inicial
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="gold-button px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Avaliação</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {showAddForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="text-xs font-bold text-zinc-900 font-luxury">
              {editingId ? 'Editar Avaliação' : 'Nova Avaliação'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-zinc-600 uppercase block mb-1">
                Nome do Autor *
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex: Matheus Henrique"
                className="w-full px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-600 uppercase block mb-1">
                Classificação (Estrelas)
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#b8860b] font-bold focus:outline-none focus:border-[#b8860b]"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 Estrelas</option>
                <option value={4}>⭐⭐⭐⭐ 4 Estrelas</option>
                <option value={3}>⭐⭐⭐ 3 Estrelas</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-zinc-600 uppercase block mb-1">
                Comentário *
              </label>
              <textarea
                rows={2}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comentário do cliente..."
                className="w-full px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-zinc-600 uppercase block mb-1">
                Link da Avaliação Google Maps
              </label>
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isApproved"
                checked={isApproved}
                onChange={(e) => setIsApproved(e.target.checked)}
                className="w-4 h-4 accent-[#b8860b] rounded"
              />
              <label htmlFor="isApproved" className="text-xs text-zinc-700 cursor-pointer">
                Exibir publicamente no site
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 rounded-xl bg-gray-100 text-xs text-zinc-600 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="gold-button px-5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 font-luxury">
                  {rev.authorName}
                </span>
                <div className="flex items-center text-[#b8860b]">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#b8860b]" />
                  ))}
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    rev.isApproved
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-gray-100 text-zinc-600 border border-gray-200'
                  }`}
                >
                  {rev.isApproved ? 'Publicado' : 'Oculto'}
                </span>
              </div>

              <p className="text-xs text-zinc-600 italic">"{rev.comment}"</p>

              {rev.originalUrl && (
                <a
                  href={rev.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-[#b8860b] hover:underline font-semibold"
                >
                  <span>Link no Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleToggleApproved(rev)}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-zinc-600 border border-gray-200"
                title={rev.isApproved ? 'Ocultar' : 'Publicar'}
              >
                {rev.isApproved ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => startEdit(rev)}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-zinc-600 hover:text-[#b8860b] border border-gray-200"
                title="Editar"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDelete(rev.id)}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-red-50 text-zinc-400 hover:text-red-600 border border-gray-200"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

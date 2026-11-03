import React, { useState, useMemo } from 'react';
import {
  Car,
  Plus,
  Settings,
  Star,
  KeyRound,
  LogOut,
  Search,
  Eye,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { Vehicle, SiteSettings, CustomerReview, VehicleStatus } from '../../types';
import { VehicleForm } from './VehicleForm';
import { SettingsForm } from './SettingsForm';
import { ReviewsManager } from './ReviewsManager';
import { ChangePinModal } from './ChangePinModal';

interface AdminDashboardProps {
  vehicles: Vehicle[];
  siteSettings: SiteSettings;
  reviews: CustomerReview[];
  adminToken: string;
  onLogout: () => void;
  onClose: () => void;
  onSaveVehicle: (vehicleData: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
  onUpdateVehicleStatus: (id: string, status: VehicleStatus) => Promise<void>;
  onSaveSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  onSaveReview: (review: Partial<CustomerReview>) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
  onPreviewVehicle: (vehicle: Vehicle) => void;
}

type AdminTab = 'inventory' | 'create' | 'settings' | 'reviews' | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  vehicles,
  siteSettings,
  reviews,
  adminToken,
  onLogout,
  onClose,
  onSaveVehicle,
  onDeleteVehicle,
  onUpdateVehicleStatus,
  onSaveSiteSettings,
  onSaveReview,
  onDeleteReview,
  onPreviewVehicle,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('inventory');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Real-time calculated indicators
  const totalCount = vehicles.length;
  const availableCount = useMemo(
    () => vehicles.filter((v) => v.status === 'available').length,
    [vehicles]
  );
  const soldCount = useMemo(
    () => vehicles.filter((v) => v.status === 'sold').length,
    [vehicles]
  );
  const hiddenCount = useMemo(
    () => vehicles.filter((v) => v.status === 'hidden').length,
    [vehicles]
  );

  // Filtered inventory table
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const m = v.make.toLowerCase().includes(q);
        const mod = v.model.toLowerCase().includes(q);
        const ver = v.version.toLowerCase().includes(q);
        if (!m && !mod && !ver) return false;
      }
      return true;
    });
  }, [vehicles, statusFilter, searchQuery]);

  // Actions
  const handleStartCreate = () => {
    setEditingVehicle(null);
    setCurrentTab('create');
  };

  const handleStartEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setCurrentTab('create');
  };

  const handleDuplicate = (v: Vehicle) => {
    const duplicated: Partial<Vehicle> = {
      ...v,
      id: undefined,
      model: `${v.model} (Cópia)`,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingVehicle(duplicated as Vehicle);
    setCurrentTab('create');
    showToast('Dados duplicados no formulário. Revise e salve.');
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await onDeleteVehicle(id);
      setDeletingId(null);
      showToast('Veículo excluído com sucesso do estoque.');
    } catch (err: any) {
      alert('Erro ao excluir veículo: ' + err.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: VehicleStatus) => {
    try {
      await onUpdateVehicleStatus(id, newStatus);
      showToast(`Status atualizado para: ${newStatus === 'available' ? 'Disponível' : newStatus === 'sold' ? 'Vendido' : 'Oculto'}`);
    } catch (err: any) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  const handleVehicleSaved = async (vehicleData: Partial<Vehicle>) => {
    await onSaveVehicle(vehicleData);
    setCurrentTab('inventory');
    setEditingVehicle(null);
    showToast('Veículo salvo com sucesso e atualizado em tempo real!');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#18181b] flex flex-col">
      {/* Admin Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl p-1 bg-white border border-gray-200 flex items-center justify-center shadow-xs">
              <img
                src={siteSettings.logoUrl || 'https://i.postimg.cc/d3tnzzpJ/logo-veneza-veiculos.png'}
                alt="Logo Veneza"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-luxury text-sm sm:text-base font-bold text-zinc-900 tracking-wider flex items-center gap-2">
                PAINEL ADMINISTRATIVO
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-50 text-[#b8860b] border border-amber-200 font-sans font-semibold">
                  Proprietário
                </span>
              </span>
              <p className="text-[10px] text-zinc-400">Veneza Veículos • Sincronização em Tempo Real</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-zinc-700 transition-colors"
            >
              <span>Ver Site Público</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#b8860b]" />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Success Toast */}
        {successToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900">
              ✕
            </button>
          </div>
        )}

        {/* 1. Clean KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-luxury rounded-2xl p-4 sm:p-5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
              Total de Veículos
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-luxury text-zinc-900 mt-1">
              {totalCount}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Cadastrados no estoque</p>
          </div>

          <div className="card-luxury rounded-2xl p-4 sm:p-5">
            <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold block">
              Disponíveis
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-luxury text-emerald-600 mt-1">
              {availableCount}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Visíveis no catálogo</p>
          </div>

          <div className="card-luxury rounded-2xl p-4 sm:p-5">
            <span className="text-[11px] uppercase tracking-wider text-red-700 font-semibold block">
              Vendidos
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-luxury text-red-600 mt-1">
              {soldCount}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Com selo de vendido</p>
          </div>

          <div className="card-luxury rounded-2xl p-4 sm:p-5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
              Ocultos
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-luxury text-zinc-700 mt-1">
              {hiddenCount}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Não exibidos aos clientes</p>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => {
              setCurrentTab('inventory');
              setEditingVehicle(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'inventory'
                ? 'gold-button'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-gray-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Estoque ({totalCount})</span>
          </button>

          <button
            onClick={handleStartCreate}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'create'
                ? 'gold-button'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-gray-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('settings');
              setEditingVehicle(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'settings'
                ? 'gold-button'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-gray-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configurações</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('reviews');
              setEditingVehicle(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'reviews'
                ? 'gold-button'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-gray-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Avaliações ({reviews.length})</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('security');
              setEditingVehicle(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
              currentTab === 'security'
                ? 'gold-button'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-gray-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Alterar Senha</span>
          </button>
        </div>

        {/* 3. Tab Contents */}
        {currentTab === 'inventory' && (
          <div className="space-y-4">
            {/* Table Filters Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar veículo..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-700 focus:outline-none focus:border-[#b8860b]"
                >
                  <option value="all">Todos os Status ({totalCount})</option>
                  <option value="available">Disponíveis ({availableCount})</option>
                  <option value="sold">Vendidos ({soldCount})</option>
                  <option value="hidden">Ocultos ({hiddenCount})</option>
                </select>

                <button
                  onClick={handleStartCreate}
                  className="gold-button px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ml-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar</span>
                </button>
              </div>
            </div>

            {/* Inventory List / Table */}
            {filteredVehicles.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-zinc-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Veículo</th>
                        <th className="py-3 px-4">Ano / KM</th>
                        <th className="py-3 px-4">Preço</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredVehicles.map((veh) => {
                        const img = veh.images[veh.mainImageIndex] || veh.images[0] || '';
                        const formattedPrice = new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        }).format(veh.price);
                        const formattedKm = new Intl.NumberFormat('pt-BR').format(veh.mileage) + ' km';

                        return (
                          <tr key={veh.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                  {img ? (
                                    <img src={img} alt={veh.model} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-400">
                                      Foto
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] text-[#b8860b] font-bold uppercase block truncate">
                                    {veh.make}
                                  </span>
                                  <span className="font-bold text-zinc-900 block truncate">
                                    {veh.model}
                                  </span>
                                  <span className="text-[11px] text-zinc-400 block truncate">
                                    {veh.version}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-zinc-700">
                              <div>{veh.manufactureYear}/{veh.modelYear}</div>
                              <div className="text-[11px] text-zinc-400">{formattedKm}</div>
                            </td>

                            <td className="py-3 px-4 font-bold text-zinc-900 font-luxury text-sm">
                              {formattedPrice}
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={veh.status}
                                onChange={(e) => handleStatusChange(veh.id, e.target.value as VehicleStatus)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                  veh.status === 'available'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : veh.status === 'sold'
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : 'bg-gray-100 text-zinc-700 border-gray-200'
                                }`}
                              >
                                <option value="available">✓ Disponível</option>
                                <option value="sold">● Vendido</option>
                                <option value="hidden">👁 Oculto</option>
                              </select>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => onPreviewVehicle(veh)}
                                  className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-zinc-600 hover:text-zinc-900 border border-gray-200"
                                  title="Visualizar anúncio"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleStartEdit(veh)}
                                  className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-zinc-600 hover:text-[#b8860b] border border-gray-200"
                                  title="Editar veículo"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDuplicate(veh)}
                                  className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-zinc-600 hover:text-zinc-900 border border-gray-200"
                                  title="Duplicar"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setDeletingId(veh.id)}
                                  className="p-1.5 rounded-lg bg-gray-50 hover:bg-red-50 text-zinc-400 hover:text-red-600 border border-gray-200"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-xs">
                <Car className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-zinc-900 font-luxury">
                  Nenhum veículo encontrado
                </h4>
                <p className="text-xs text-zinc-400 mt-1 mb-4">
                  {totalCount === 0
                    ? 'Seu estoque está pronto para receber os primeiros veículos.'
                    : 'Nenhum veículo corresponde à busca atual.'}
                </p>
                <button
                  onClick={handleStartCreate}
                  className="gold-button px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Veículo</span>
                </button>
              </div>
            )}
          </div>
        )}

        {currentTab === 'create' && (
          <VehicleForm
            initialVehicle={editingVehicle}
            onSave={handleVehicleSaved}
            onCancel={() => {
              setCurrentTab('inventory');
              setEditingVehicle(null);
            }}
            adminToken={adminToken}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsForm
            settings={siteSettings}
            onSave={onSaveSiteSettings}
            adminToken={adminToken}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsManager
            reviews={reviews}
            onSaveReview={onSaveReview}
            onDeleteReview={onDeleteReview}
          />
        )}

        {currentTab === 'security' && (
          <ChangePinModal
            adminToken={adminToken}
            onPinChanged={() => {
              showToast('Senha alterada com sucesso!');
            }}
          />
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 font-luxury">
              Excluir este veículo?
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Esta ação removerá o veículo permanentemente do estoque da loja.
            </p>
            <div className="flex gap-2.5 justify-center pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs text-zinc-700 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmDelete(deletingId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

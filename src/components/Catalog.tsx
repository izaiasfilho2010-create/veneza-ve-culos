import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Car,
  MessageCircle,
} from 'lucide-react';
import { Vehicle, FilterState, SiteSettings } from '../types';
import { VehicleCard } from './VehicleCard';

interface CatalogProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  settings: SiteSettings;
  onOpenAdmin: () => void;
}

const initialFilterState: FilterState = {
  search: '',
  make: '',
  model: '',
  minYear: '',
  maxYear: '',
  minPrice: '',
  maxPrice: '',
  maxMileage: '',
  transmission: '',
  fuel: '',
  sortBy: 'price_asc',
};

export const Catalog: React.FC<CatalogProps> = ({
  vehicles,
  onSelectVehicle,
  settings,
  onOpenAdmin,
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Available brands in the registered inventory
  const availableMakes = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.make) set.add(v.make.trim());
    });
    return Array.from(set).sort();
  }, [vehicles]);

  // Available models based on selected brand
  const availableModels = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (!filters.make || v.make.toLowerCase() === filters.make.toLowerCase()) {
        if (v.model) set.add(v.model.trim());
      }
    });
    return Array.from(set).sort();
  }, [vehicles, filters.make]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.minYear) count++;
    if (filters.maxYear) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.maxMileage) count++;
    if (filters.transmission) count++;
    if (filters.fuel) count++;
    return count;
  }, [filters]);

  // Filter and Sort Logic
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        if (v.status === 'hidden') return false;

        // Search text
        if (filters.search) {
          const q = filters.search.toLowerCase().trim();
          const matchMake = v.make.toLowerCase().includes(q);
          const matchModel = v.model.toLowerCase().includes(q);
          const matchVersion = v.version.toLowerCase().includes(q);
          const matchFeatures = v.features.some((f) => f.toLowerCase().includes(q));
          if (!matchMake && !matchModel && !matchVersion && !matchFeatures) return false;
        }

        // Make
        if (filters.make && v.make.toLowerCase() !== filters.make.toLowerCase()) return false;

        // Model
        if (filters.model && v.model.toLowerCase() !== filters.model.toLowerCase()) return false;

        // Min Year
        if (filters.minYear && v.modelYear < Number(filters.minYear)) return false;

        // Max Year
        if (filters.maxYear && v.modelYear > Number(filters.maxYear)) return false;

        // Min Price
        if (filters.minPrice && v.price < Number(filters.minPrice)) return false;

        // Max Price
        if (filters.maxPrice && v.price > Number(filters.maxPrice)) return false;

        // Max Mileage
        if (filters.maxMileage && v.mileage > Number(filters.maxMileage)) return false;

        // Transmission
        if (filters.transmission && v.transmission.toLowerCase() !== filters.transmission.toLowerCase()) return false;

        // Fuel
        if (filters.fuel && v.fuel.toLowerCase() !== filters.fuel.toLowerCase()) return false;

        return true;
      })
      .sort((a, b) => {
        if (a.status === 'available' && b.status === 'sold') return -1;
        if (a.status === 'sold' && b.status === 'available') return 1;

        switch (filters.sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'year_desc':
            return b.modelYear - a.modelYear;
          case 'mileage_asc':
            return a.mileage - b.mileage;
          default:
            return 0;
        }
      });
  }, [vehicles, filters]);

  const handleResetFilters = () => {
    setFilters(initialFilterState);
  };

  return (
    <section id="catalogo" className="pt-12 pb-20 bg-[#F3F4F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Clean & decluttered */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#b8860b] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nosso Estoque</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-luxury text-zinc-900">
            Veículos Selecionados
          </h2>
          <p className="text-sm text-zinc-500 mt-2">
            Encontre o modelo ideal com garantia de procedência e laudo inspecionado.
          </p>
        </div>

        {/* Clean, Streamlined Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 mb-10 shadow-xs max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar por marca ou modelo..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#b8860b] focus:bg-white transition-all"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Brand Filter */}
            {availableMakes.length > 0 && (
              <select
                value={filters.make}
                onChange={(e) => setFilters({ ...filters, make: e.target.value, model: '' })}
                className="w-full sm:w-44 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-700 font-medium focus:outline-none focus:border-[#b8860b] cursor-pointer"
              >
                <option value="">Todas as Marcas</option>
                {availableMakes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Order */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="w-full sm:w-44 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-700 font-medium focus:outline-none focus:border-[#b8860b] cursor-pointer"
            >
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="year_desc">Mais Novos</option>
              <option value="mileage_asc">Menor KM</option>
            </select>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 w-full sm:w-auto ${
                activeFiltersCount > 0 || showAdvancedFilters
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-gray-50 text-zinc-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#b8860b]" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#b8860b] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Collapsible Advanced Filters */}
          {showAdvancedFilters && (
            <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeIn">
              {/* Transmission */}
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase block mb-1">
                  Câmbio
                </label>
                <select
                  value={filters.transmission}
                  onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-zinc-700 focus:outline-none focus:border-[#b8860b]"
                >
                  <option value="">Qualquer Câmbio</option>
                  <option value="Automático">Automático</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              {/* Fuel */}
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase block mb-1">
                  Combustível
                </label>
                <select
                  value={filters.fuel}
                  onChange={(e) => setFilters({ ...filters, fuel: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-zinc-700 focus:outline-none focus:border-[#b8860b]"
                >
                  <option value="">Qualquer Combustível</option>
                  <option value="Flex">Flex</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>

              {/* Min Year */}
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase block mb-1">
                  Ano Mínimo
                </label>
                <input
                  type="number"
                  placeholder="Ex: 2020"
                  value={filters.minYear}
                  onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-zinc-700 focus:outline-none focus:border-[#b8860b]"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase block mb-1">
                  Preço Máximo (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 180000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-zinc-700 focus:outline-none focus:border-[#b8860b]"
                />
              </div>

              {activeFiltersCount > 0 && (
                <div className="col-span-2 sm:col-span-4 flex justify-end pt-1">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#b8860b] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpar filtros</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Catalog Grid or Clean Empty State */}
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSelect={onSelectVehicle}
              />
            ))}
          </div>
        ) : vehicles.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md mx-auto shadow-xs">
            <Filter className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 font-luxury mb-1">
              Nenhum veículo encontrado
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Tente ajustar os filtros de busca para visualizar outras opções.
            </p>
            <button
              onClick={handleResetFilters}
              className="gold-button px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ver todos</span>
            </button>
          </div>
        ) : (
          /* Clean, light empty state */
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-[#b8860b]">
              <Car className="w-7 h-7" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 font-luxury mb-2">
              Estoque em Atualização
            </h3>

            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-6 max-w-md mx-auto">
              Nossa equipe está cadastrando os novos seminovos selecionados. 
              Fale conosco pelo WhatsApp para consultar os modelos disponíveis de imediato.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de consultar os veículos disponíveis na Veneza Veículos.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar no WhatsApp</span>
              </a>

              <button
                onClick={onOpenAdmin}
                className="px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-zinc-700 border border-gray-200 text-xs font-semibold tracking-wider transition-colors"
              >
                Painel do Proprietário
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

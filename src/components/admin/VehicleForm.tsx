import React, { useState, useRef } from 'react';
import {
  Upload,
  Star,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Car,
  Image as ImageIcon,
} from 'lucide-react';
import { Vehicle, VehicleStatus } from '../../types';

interface VehicleFormProps {
  initialVehicle?: Vehicle | null;
  onSave: (vehicleData: Partial<Vehicle>) => Promise<void>;
  onCancel: () => void;
  adminToken: string;
}

const COMMON_FEATURES = [
  'Ar-Condicionado Digital',
  'Direção Elétrica',
  'Bancos em Couro',
  'Teto Solar Panorâmico',
  'Central Multimídia Apple/Android',
  'Câmera de Ré',
  'Sensor de Estacionamento',
  'Faróis em LED',
  'Piloto Automático',
  'Chave Presencial / Partida por Botão',
  'Rodas de Liga Leve',
  'Controle de Estabilidade',
  'Freios ABS',
  'Airbags Frontais e Laterais',
  'Vidros e Travas Elétricas',
];

export const VehicleForm: React.FC<VehicleFormProps> = ({
  initialVehicle,
  onSave,
  onCancel,
  adminToken,
}) => {
  const [make, setMake] = useState(initialVehicle?.make || '');
  const [model, setModel] = useState(initialVehicle?.model || '');
  const [version, setVersion] = useState(initialVehicle?.version || '');
  const [manufactureYear, setManufactureYear] = useState<number | ''>(
    initialVehicle?.manufactureYear || new Date().getFullYear()
  );
  const [modelYear, setModelYear] = useState<number | ''>(
    initialVehicle?.modelYear || new Date().getFullYear()
  );
  const [price, setPrice] = useState<number | ''>(initialVehicle?.price || '');
  const [mileage, setMileage] = useState<number | ''>(
    initialVehicle?.mileage !== undefined ? initialVehicle.mileage : ''
  );
  const [transmission, setTransmission] = useState(
    initialVehicle?.transmission || 'Automático'
  );
  const [fuel, setFuel] = useState(initialVehicle?.fuel || 'Flex');
  const [color, setColor] = useState(initialVehicle?.color || '');
  const [doors, setDoors] = useState<number>(initialVehicle?.doors || 4);
  const [description, setDescription] = useState(initialVehicle?.description || '');
  const [features, setFeatures] = useState<string[]>(initialVehicle?.features || []);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [status, setStatus] = useState<VehicleStatus>(initialVehicle?.status || 'available');

  // Images state
  const [images, setImages] = useState<string[]>(initialVehicle?.images || []);
  const [mainImageIndex, setMainImageIndex] = useState<number>(
    initialVehicle?.mainImageIndex || 0
  );

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle multiple image files upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);

    const uploadedUrls: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setUploadProgress(`Enviando foto ${i + 1} de ${totalFiles}...`);

        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`A foto "${file.name}" excede 15MB.`);
        }

        const base64 = await readFileAsBase64(file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            imageBase64: base64,
            filename: file.name,
            mimeType: file.type,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erro no envio da imagem.');
        }

        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao processar imagens.');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const nextImages = images.filter((_, i) => i !== indexToRemove);
    setImages(nextImages);
    if (mainImageIndex === indexToRemove) {
      setMainImageIndex(0);
    } else if (mainImageIndex > indexToRemove) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleMoveImage = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;

    const copy = [...images];
    const temp = copy[fromIndex];
    copy[fromIndex] = copy[toIndex];
    copy[toIndex] = temp;

    if (mainImageIndex === fromIndex) {
      setMainImageIndex(toIndex);
    } else if (mainImageIndex === toIndex) {
      setMainImageIndex(fromIndex);
    }

    setImages(copy);
  };

  const toggleFeature = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures(features.filter((f) => f !== feat));
    } else {
      setFeatures([...features, feat]);
    }
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureText.trim()) return;
    if (!features.includes(newFeatureText.trim())) {
      setFeatures([...features, newFeatureText.trim()]);
    }
    setNewFeatureText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!make.trim()) {
      setErrorMessage('Por favor, informe a Marca do veículo.');
      return;
    }
    if (!model.trim()) {
      setErrorMessage('Por favor, informe o Modelo do veículo.');
      return;
    }
    if (!version.trim()) {
      setErrorMessage('Por favor, informe a Versão do veículo.');
      return;
    }
    if (!manufactureYear || !modelYear) {
      setErrorMessage('Informe o Ano de fabricação e Ano do modelo.');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setErrorMessage('Informe um Preço válido maior que zero.');
      return;
    }
    if (mileage === '' || Number(mileage) < 0) {
      setErrorMessage('Informe a Quilometragem (KM) do veículo.');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Adicione ao menos uma fotografia real do veículo.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: initialVehicle?.id,
        make: make.trim(),
        model: model.trim(),
        version: version.trim(),
        manufactureYear: Number(manufactureYear),
        modelYear: Number(modelYear),
        price: Number(price),
        mileage: Number(mileage),
        transmission,
        fuel,
        color: color.trim() || 'Não especificada',
        doors: Number(doors) || 4,
        description: description.trim(),
        features,
        status,
        images,
        mainImageIndex: Math.min(mainImageIndex, images.length - 1),
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar veículo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Identification Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b8860b]">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 font-luxury">
              Identificação do Veículo
            </h3>
            <p className="text-[11px] text-zinc-400">Marca, modelo e versão comercial</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Marca *
            </label>
            <input
              type="text"
              required
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Ex: Toyota, Honda, Jeep"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Modelo *
            </label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ex: Corolla, Civic, Compass"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Versão *
            </label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Ex: 2.0 XEi 16V Flex"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Technical Specs Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 font-luxury pb-2 border-b border-gray-100">
          Especificações e Valores
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Ano Fabricação *
            </label>
            <input
              type="number"
              required
              min={1950}
              max={2035}
              value={manufactureYear}
              onChange={(e) => setManufactureYear(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Ano Modelo *
            </label>
            <input
              type="number"
              required
              min={1950}
              max={2035}
              value={modelYear}
              onChange={(e) => setModelYear(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Preço (R$) *
            </label>
            <input
              type="number"
              required
              min={0}
              step={100}
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
              placeholder="Ex: 149900"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#b8860b] font-bold focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Quilometragem (KM) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={mileage}
              onChange={(e) => setMileage(e.target.value !== '' ? Number(e.target.value) : '')}
              placeholder="Ex: 35000"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Câmbio
            </label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b]"
            >
              <option value="Automático">Automático</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Combustível
            </label>
            <select
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b]"
            >
              <option value="Flex">Flex</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Diesel">Diesel</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Elétrico">Elétrico</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Cor
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Ex: Branco Pérola"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
              Portas
            </label>
            <select
              value={doors}
              onChange={(e) => setDoors(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b]"
            >
              <option value={4}>4 Portas</option>
              <option value={2}>2 Portas</option>
              <option value={5}>5 Portas</option>
            </select>
          </div>
        </div>

        {/* Status Selector */}
        <div className="pt-2">
          <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1.5">
            Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus('available')}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                status === 'available'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              ✓ Disponível
            </button>

            <button
              type="button"
              onClick={() => setStatus('sold')}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                status === 'sold'
                  ? 'bg-red-50 border-red-300 text-red-800 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              ● Vendido
            </button>

            <button
              type="button"
              onClick={() => setStatus('hidden')}
              className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                status === 'hidden'
                  ? 'bg-zinc-200 border-zinc-400 text-zinc-900 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              👁 Oculto
            </button>
          </div>
        </div>
      </div>

      {/* 3. Photos Upload */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b8860b]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 font-luxury">
                Fotos do Veículo ({images.length})
              </h3>
              <p className="text-[11px] text-zinc-400">Fotos reais de alta qualidade</p>
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gold-button px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{uploadProgress || 'Enviando...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Adicionar Fotos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((imgUrl, index) => {
              const isMain = mainImageIndex === index;
              return (
                <div
                  key={index}
                  className={`group relative aspect-[16/11] rounded-xl overflow-hidden bg-gray-100 border-2 transition-all ${
                    isMain ? 'border-[#b8860b] shadow-xs' : 'border-gray-200'
                  }`}
                >
                  <img src={imgUrl} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />

                  {/* Top badges */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMainImageIndex(index)}
                      className={`p-1 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 transition-all ${
                        isMain
                          ? 'bg-[#b8860b] text-white shadow-xs'
                          : 'bg-black/60 text-white hover:bg-[#b8860b]'
                      }`}
                      title={isMain ? 'Foto Principal' : 'Definir como Principal'}
                    >
                      <Star className={`w-3 h-3 ${isMain ? 'fill-white' : ''}`} />
                      {isMain && <span>Capa</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1 rounded bg-black/60 hover:bg-red-600 text-white transition-colors"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Bottom reorder arrows */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded p-0.5 backdrop-blur-xs">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveImage(index, 'left')}
                      className="text-white hover:text-[#b8860b] disabled:opacity-20 p-0.5"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-zinc-200 font-semibold">{index + 1}</span>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => handleMoveImage(index, 'right')}
                      className="text-white hover:text-[#b8860b] disabled:opacity-20 p-0.5"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-[#b8860b] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50"
          >
            <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-zinc-700">
              Nenhuma fotografia anexada
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Clique para selecionar as fotos reais do veículo
            </p>
          </div>
        )}
      </div>

      {/* 4. Description & Features */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 font-luxury pb-2 border-b border-gray-100">
          Descrição e Opcionais
        </h3>

        <div>
          <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-1">
            Descrição do Veículo
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes sobre revisões, laudo cautelar aprovado, manual e chave reserva..."
            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b] focus:bg-white leading-relaxed"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-600 uppercase block mb-2">
            Opcionais
          </label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {COMMON_FEATURES.map((feat) => {
              const isSelected = features.includes(feat);
              return (
                <button
                  key={feat}
                  type="button"
                  onClick={() => toggleFeature(feat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                      : 'bg-gray-50 border-gray-200 text-zinc-600 hover:border-gray-300'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {feat}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              placeholder="Outro opcional..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-zinc-800 focus:outline-none focus:border-[#b8860b]"
            />
            <button
              type="button"
              onClick={handleAddCustomFeature}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-zinc-700 text-xs font-semibold"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-zinc-700 text-xs font-semibold"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={saving || uploading}
          className="gold-button px-7 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{initialVehicle ? 'Salvar Alterações' : 'Cadastrar Veículo'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

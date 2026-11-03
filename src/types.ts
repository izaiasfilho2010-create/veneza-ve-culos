export type VehicleStatus = 'available' | 'sold' | 'hidden';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  version: string;
  manufactureYear: number;
  modelYear: number;
  price: number;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string;
  doors: number;
  description: string;
  features: string[];
  status: VehicleStatus;
  images: string[];
  mainImageIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  instagram: string;
  logoUrl: string;
  facadeUrl: string;
  aboutText: string;
  mapsUrl?: string;
  updatedAt?: string;
}

export interface CustomerReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  originalUrl: string;
  isApproved: boolean;
  createdAt: string;
}

export interface FilterState {
  search: string;
  make: string;
  model: string;
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
  maxMileage: string;
  transmission: string;
  fuel: string;
  sortBy: 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';
}

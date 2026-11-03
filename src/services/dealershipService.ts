import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Vehicle, SiteSettings, CustomerReview } from '../types';

export const OFFICIAL_DEFAULT_SETTINGS: SiteSettings = {
  name: 'Veneza Veículos',
  phone: '(87) 99988-1995',
  whatsapp: '5587999881995',
  address: 'R. Paulo VI, 1406 - Heliópolis, Garanhuns - PE, 55297-350',
  hours: 'Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 13:00 | Domingo: Fechado',
  instagram: 'https://www.instagram.com/veiculosveneza?psln=MTgyZ2txbWkzYm9hNA==',
  logoUrl: 'https://i.postimg.cc/d3tnzzpJ/logo-veneza-veiculos.png',
  facadeUrl: 'https://i.postimg.cc/5tDV9mb2/veneza-veiculos.jpg',
  aboutText: 'Com tradição e compromisso com a máxima qualidade, a Veneza Veículos é a sua concessionária de confiança em Garanhuns e no Agreste Pernambucano. Oferecemos um acervo criteriosamente selecionado de seminovos inspecionados, com garantia de procedência, transparência nas negociações e atendimento exclusivo para você encontrar o veículo ideal.',
  mapsUrl: 'https://maps.app.goo.gl/1s5mX34cU3tSov1CA',
};

export const OFFICIAL_INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-kevin-duarte',
    authorName: 'Kevin Duarte',
    rating: 5,
    comment: 'O atendimento está muito bom!!! Foram super atenciosos comigo.',
    originalUrl: 'https://maps.app.goo.gl/1s5mX34cU3tSov1CA',
    isApproved: true,
    createdAt: '2025-01-15T12:00:00.000Z',
  },
  {
    id: 'rev-manu-henrique',
    authorName: 'Manuhenriquedemeloh',
    rating: 5,
    comment: 'Atendimento 10 parabéns toda equipe',
    originalUrl: 'https://maps.app.goo.gl/LnP8hdqjNLP14unq5',
    isApproved: true,
    createdAt: '2025-02-01T15:00:00.000Z',
  },
  {
    id: 'rev-matheus-henrique',
    authorName: 'Matheus Henrique',
    rating: 5,
    comment: 'Bom atendimento',
    originalUrl: 'https://maps.app.goo.gl/Av7EAynsWXUSjxKM7',
    isApproved: true,
    createdAt: '2025-02-10T11:00:00.000Z',
  },
];

// 1. Subscribe to Vehicles with Real-time onSnapshot
export function subscribeVehicles(
  onUpdate: (vehicles: Vehicle[]) => void,
  includeHidden: boolean = false
): () => void {
  const colRef = collection(db, 'vehicles');
  const q = includeHidden
    ? query(colRef)
    : query(colRef, where('status', 'in', ['available', 'sold']));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: Vehicle[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          make: data.make || '',
          model: data.model || '',
          version: data.version || '',
          manufactureYear: Number(data.manufactureYear) || 2020,
          modelYear: Number(data.modelYear) || 2020,
          price: Number(data.price) || 0,
          mileage: Number(data.mileage) || 0,
          transmission: data.transmission || 'Automático',
          fuel: data.fuel || 'Flex',
          color: data.color || 'Preto',
          doors: Number(data.doors) || 4,
          description: data.description || '',
          features: Array.isArray(data.features) ? data.features : [],
          status: data.status || 'available',
          images: Array.isArray(data.images) ? data.images : [],
          mainImageIndex: Number(data.mainImageIndex) || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Real-time vehicles listener note:', err.message);
      // Fallback: If permissions prevent direct query or offline, provide empty list
      onUpdate([]);
    }
  );

  return unsubscribe;
}

// 2. Subscribe to Site Settings
export function subscribeSiteSettings(
  onUpdate: (settings: SiteSettings) => void
): () => void {
  const docRef = doc(db, 'siteSettings', 'current');
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          name: data.name || OFFICIAL_DEFAULT_SETTINGS.name,
          phone: data.phone || OFFICIAL_DEFAULT_SETTINGS.phone,
          whatsapp: data.whatsapp || OFFICIAL_DEFAULT_SETTINGS.whatsapp,
          address: data.address || OFFICIAL_DEFAULT_SETTINGS.address,
          hours: data.hours || OFFICIAL_DEFAULT_SETTINGS.hours,
          instagram: data.instagram || OFFICIAL_DEFAULT_SETTINGS.instagram,
          logoUrl: data.logoUrl || OFFICIAL_DEFAULT_SETTINGS.logoUrl,
          facadeUrl: data.facadeUrl || OFFICIAL_DEFAULT_SETTINGS.facadeUrl,
          aboutText: data.aboutText || OFFICIAL_DEFAULT_SETTINGS.aboutText,
          mapsUrl: data.mapsUrl || OFFICIAL_DEFAULT_SETTINGS.mapsUrl,
          updatedAt: data.updatedAt,
        });
      } else {
        // Fallback to official default
        onUpdate(OFFICIAL_DEFAULT_SETTINGS);
      }
    },
    (err) => {
      console.warn('Settings listener note:', err.message);
      onUpdate(OFFICIAL_DEFAULT_SETTINGS);
    }
  );

  return unsubscribe;
}

// 3. Subscribe to Real Reviews
export function subscribeReviews(
  onUpdate: (reviews: CustomerReview[]) => void,
  includeUnapproved: boolean = false
): () => void {
  const colRef = collection(db, 'reviews');
  const q = includeUnapproved
    ? query(colRef)
    : query(colRef, where('isApproved', '==', true));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: CustomerReview[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          authorName: data.authorName || '',
          rating: Number(data.rating) || 5,
          comment: data.comment || '',
          originalUrl: data.originalUrl || '',
          isApproved: data.isApproved ?? true,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      if (list.length === 0) {
        onUpdate(OFFICIAL_INITIAL_REVIEWS);
      } else {
        onUpdate(list);
      }
    },
    (err) => {
      console.warn('Reviews listener note:', err.message);
      onUpdate(OFFICIAL_INITIAL_REVIEWS);
    }
  );

  return unsubscribe;
}

// 4. Vehicle Operations (Admin)
export async function saveVehicle(vehicle: Partial<Vehicle>): Promise<string> {
  const id = vehicle.id || `veh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, 'vehicles', id);

  const payload = {
    make: vehicle.make || '',
    model: vehicle.model || '',
    version: vehicle.version || '',
    manufactureYear: Number(vehicle.manufactureYear) || 2022,
    modelYear: Number(vehicle.modelYear) || 2022,
    price: Number(vehicle.price) || 0,
    mileage: Number(vehicle.mileage) || 0,
    transmission: vehicle.transmission || 'Automático',
    fuel: vehicle.fuel || 'Flex',
    color: vehicle.color || 'Preto',
    doors: Number(vehicle.doors) || 4,
    description: vehicle.description || '',
    features: Array.isArray(vehicle.features) ? vehicle.features : [],
    status: vehicle.status || 'available',
    images: Array.isArray(vehicle.images) ? vehicle.images : [],
    mainImageIndex: Number(vehicle.mainImageIndex) || 0,
    createdAt: vehicle.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, payload, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `vehicles/${id}`);
    throw error;
  }
}

export async function deleteVehicleDoc(vehicleId: string): Promise<void> {
  const docRef = doc(db, 'vehicles', vehicleId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `vehicles/${vehicleId}`);
    throw error;
  }
}

export async function updateVehicleStatus(vehicleId: string, status: 'available' | 'sold' | 'hidden'): Promise<void> {
  const docRef = doc(db, 'vehicles', vehicleId);
  try {
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `vehicles/${vehicleId}`);
    throw error;
  }
}

// 5. Site Settings Operations (Admin)
export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, 'siteSettings', 'current');
  try {
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteSettings/current');
    throw error;
  }
}

// 6. Review Operations (Admin)
export async function saveReviewDoc(review: Partial<CustomerReview>): Promise<string> {
  const id = review.id || `rev_${Date.now()}`;
  const docRef = doc(db, 'reviews', id);
  try {
    await setDoc(
      docRef,
      {
        authorName: review.authorName || '',
        rating: Number(review.rating) || 5,
        comment: review.comment || '',
        originalUrl: review.originalUrl || '',
        isApproved: review.isApproved ?? true,
        createdAt: review.createdAt || new Date().toISOString(),
      },
      { merge: true }
    );
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `reviews/${id}`);
    throw error;
  }
}

export async function deleteReviewDoc(reviewId: string): Promise<void> {
  const docRef = doc(db, 'reviews', reviewId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `reviews/${reviewId}`);
    throw error;
  }
}

// Initialize seed data if Firestore collections are empty
export async function initializeFirestoreDefaultsIfEmpty() {
  try {
    const settingsDoc = await getDoc(doc(db, 'siteSettings', 'current'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, 'siteSettings', 'current'), {
        ...OFFICIAL_DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString(),
      });
    }

    const reviewsSnap = await getDocs(collection(db, 'reviews'));
    if (reviewsSnap.empty) {
      for (const rev of OFFICIAL_INITIAL_REVIEWS) {
        await setDoc(doc(db, 'reviews', rev.id), rev);
      }
    }
  } catch (e) {
    console.warn('Initial seed check note (expected if rules are active):', e);
  }
}

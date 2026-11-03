/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MarqueeRibbon } from './components/MarqueeRibbon';
import { Catalog } from './components/Catalog';
import { VehicleModal } from './components/VehicleModal';
import { AboutSection } from './components/AboutSection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Vehicle, SiteSettings, CustomerReview, VehicleStatus } from './types';
import {
  subscribeVehicles,
  subscribeSiteSettings,
  subscribeReviews,
  saveVehicle,
  deleteVehicleDoc,
  updateVehicleStatus,
  saveSiteSettings,
  saveReviewDoc,
  deleteReviewDoc,
  initializeFirestoreDefaultsIfEmpty,
  OFFICIAL_DEFAULT_SETTINGS,
  OFFICIAL_INITIAL_REVIEWS,
} from './services/dealershipService';
import { testConnection } from './firebase/config';

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(OFFICIAL_DEFAULT_SETTINGS);
  const [reviews, setReviews] = useState<CustomerReview[]>(OFFICIAL_INITIAL_REVIEWS);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Admin authentication state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('veneza_admin_token');
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);

  // Initialize and verify session
  useEffect(() => {
    // 1. Test connection to Firestore as mandated by skill
    testConnection();

    // 2. Initialize default site info and reviews if empty in Firestore
    initializeFirestoreDefaultsIfEmpty();

    // 3. Verify existing token if present
    const existingToken = sessionStorage.getItem('veneza_admin_token');
    if (existingToken) {
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${existingToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.authenticated) {
            sessionStorage.removeItem('veneza_admin_token');
            setAdminToken(null);
          }
        })
        .catch(() => {
          sessionStorage.removeItem('veneza_admin_token');
          setAdminToken(null);
        });
    }
  }, []);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    // When admin is logged in, subscribe to all vehicles including hidden
    const unsubVehicles = subscribeVehicles(
      (loadedVehicles) => {
        setVehicles(loadedVehicles);
      },
      Boolean(adminToken)
    );

    const unsubSettings = subscribeSiteSettings((loadedSettings) => {
      setSiteSettings(loadedSettings);
    });

    const unsubReviews = subscribeReviews((loadedReviews) => {
      setReviews(loadedReviews);
    }, Boolean(adminToken));

    return () => {
      unsubVehicles();
      unsubSettings();
      unsubReviews();
    };
  }, [adminToken]);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminAuthSuccess = (token: string) => {
    sessionStorage.setItem('veneza_admin_token', token);
    setAdminToken(token);
    setIsAdminModalOpen(false);
    setIsAdminViewOpen(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('veneza_admin_token');
    setAdminToken(null);
    setIsAdminViewOpen(false);
  };

  const handleOpenAdmin = () => {
    if (adminToken) {
      setIsAdminViewOpen(true);
    } else {
      setIsAdminModalOpen(true);
    }
  };

  // If in Admin Dashboard view
  if (isAdminViewOpen && adminToken) {
    return (
      <AdminDashboard
        vehicles={vehicles}
        siteSettings={siteSettings}
        reviews={reviews}
        adminToken={adminToken}
        onLogout={handleAdminLogout}
        onClose={() => setIsAdminViewOpen(false)}
        onSaveVehicle={async (v) => {
          await saveVehicle(v);
        }}
        onDeleteVehicle={async (id) => {
          await deleteVehicleDoc(id);
        }}
        onUpdateVehicleStatus={async (id, status) => {
          await updateVehicleStatus(id, status);
        }}
        onSaveSiteSettings={async (s) => {
          await saveSiteSettings(s);
        }}
        onSaveReview={async (r) => {
          await saveReviewDoc(r);
        }}
        onDeleteReview={async (id) => {
          await deleteReviewDoc(id);
        }}
        onPreviewVehicle={(v) => setSelectedVehicle(v)}
      />
    );
  }

  const cleanWhatsappNumber = siteSettings.whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#18181b] selection:bg-[#d4af37]/30 selection:text-[#18181b]">
      {/* 1. Header */}
      <Header
        settings={siteSettings}
        onNavigate={handleNavigate}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={Boolean(adminToken)}
      />

      <main>
        {/* 2. Hero Section */}
        <Hero
          settings={siteSettings}
          onExploreClick={() => handleNavigate('catalogo')}
        />

        {/* Straight horizontal marquee ribbon with phrases representing the store */}
        <MarqueeRibbon />

        {/* 3. Catalog Section */}
        <Catalog
          vehicles={vehicles}
          onSelectVehicle={(v) => setSelectedVehicle(v)}
          settings={siteSettings}
          onOpenAdmin={handleOpenAdmin}
        />

        {/* 4. About Veneza Section */}
        <AboutSection settings={siteSettings} />

        {/* 5. Real Reviews Section */}
        <ReviewsSection reviews={reviews} />

        {/* 6. Location & Contact Section */}
        <LocationSection settings={siteSettings} />
      </main>

      {/* 7. Footer */}
      <Footer
        settings={siteSettings}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={Boolean(adminToken)}
      />

      {/* 8. Vehicle Details Modal */}
      <VehicleModal
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        settings={siteSettings}
        availableVehicles={vehicles}
        onSelectVehicle={(v) => setSelectedVehicle(v)}
      />

      {/* 9. Admin PIN Login Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* 10. Floating WhatsApp CTA */}
      <aside aria-label="Atendimento Rápido" className="fixed bottom-6 right-6 z-40">
        <a
          href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
            'Olá! Estive navegando pelo site da Veneza Veículos e gostaria de atendimento.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group relative"
          title="Falar no WhatsApp Oficial"
        >
          <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
          <span className="sr-only">Falar no WhatsApp Oficial</span>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#12141a] border border-[#2b303d] text-xs font-semibold text-white whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Fale conosco no WhatsApp
          </span>
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#08090b]"></span>
        </a>
      </aside>
    </div>
  );
}

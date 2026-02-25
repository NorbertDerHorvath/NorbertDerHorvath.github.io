import React, { useState, useEffect } from 'react';
import { Deal } from './types';
import { db } from './firebase';
import { jsPDF } from 'jspdf';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* =======================
   i18n
======================= */

type Language = 'hu' | 'en' | 'de';

const translations = {
  hu: {
    subtitle: "Privát Lista",
    install: "Telepítés",
    export: "PDF Export",
    error_title: "Hálózati Hiba",
    error_msg: "Az adatok jelenleg nem érhetőek el.",
    view_deal: "Megnézem az akciót",
    empty_list: "A lista jelenleg frissítés alatt áll",
    footer: "Biztonságos kapcsolat • Publikus hozzáférés • Verzió 2.0",
    expiry_last_day: "Utolsó nap!",
    expiry_tomorrow: "Holnap lejár",
    expiry_days: (days: number) => `${days} nap van hátra`,
    pdf_title: "Cashback Hub - Aktuális Ajánlatok",
    pdf_created: "Készült",
    pdf_expiry: "Lejárat",
    syncing: "Szinkronizálás...",
    share_msg: "Nézd meg ezt az ajánlatot a Cashback Hub-on!",
    clipboard_msg: "Link a vágólapra másolva!",
    legal_notice: "Az impresszum, jogi nyilatkozatok és elérhetőségek a NorbApp weboldalon érhetők el."
  },
  en: {
    subtitle: "Private List",
    install: "Install",
    export: "PDF Export",
    error_title: "Network Error",
    error_msg: "Data is currently unavailable.",
    view_deal: "View Deal",
    empty_list: "The list is currently being updated",
    footer: "Secure connection • Public access • Version 2.0",
    expiry_last_day: "Last day!",
    expiry_tomorrow: "Expires tomorrow",
    expiry_days: (days: number) => `${days} days left`,
    pdf_title: "Cashback Hub - Current Deals",
    pdf_created: "Created",
    pdf_expiry: "Expiry",
    syncing: "Syncing...",
    share_msg: "Check out this deal on Cashback Hub!",
    clipboard_msg: "Link copied to clipboard!",
    legal_notice: "Imprint, legal notices and contact information are available on the NorbApp website."
  },
  de: {
    subtitle: "Private Liste",
    install: "Installieren",
    export: "PDF Export",
    error_title: "Netzwerkfehler",
    error_msg: "Daten sind derzeit nicht verfügbar.",
    view_deal: "Angebot ansehen",
    empty_list: "Die Liste wird derzeit aktualisiert",
    footer: "Sichere Verbindung • Öffentlicher Zugang • Version 2.0",
    expiry_last_day: "Letzter Tag!",
    expiry_tomorrow: "Läuft morgen ab",
    expiry_days: (days: number) => `Noch ${days} Tage`,
    pdf_title: "Cashback Hub - Aktuelle Angebote",
    pdf_created: "Erstellt",
    pdf_expiry: "Ablauf",
    syncing: "Synchronisierung...",
    share_msg: "Schau dir dieses Angebot auf Cashback Hub an!",
    clipboard_msg: "Link in die Zwischenablage kopiert!",
    legal_notice: "Impressum, rechtliche Hinweise und Kontaktinformationen finden Sie auf der NorbApp-Website."
  }
};

/* =======================
   UI helpers
======================= */

const GermanyRibbon = () => (
  <div
    className="
      fixed top-0 right-0
      z-30
      pointer-events-none
      overflow-hidden
      w-28 h-28
      sm:w-32 sm:h-32
      md:w-40 md:h-40
      opacity-25 sm:opacity-30 md:opacity-40
    "
  >
    <div
      className="
        absolute top-0 right-0
        w-[170%] h-10 md:h-12
        rotate-45
        translate-x-[30%] translate-y-[40%]
        flex flex-col
        backdrop-blur-sm
      "
    >
      <div className="h-1/3 bg-black/70"></div>
      <div className="h-1/3 bg-[#FF0000]/70"></div>
      <div className="h-1/3 bg-[#FFCC00]/70"></div>
    </div>
  </div>
);

/* =======================
   App
======================= */

const App: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('hu');

  const t = translations[lang];

  useEffect(() => {
    const dealsRef = ref(db, 'deals');

    const unsubscribe = onValue(dealsRef, snapshot => {
      try {
        const data = snapshot.val();
        if (!data) {
          setDeals([]);
          return;
        }

        const today = new Date().toISOString().split('T')[0];

        const list = Object.entries(data)
          .map(([id, val]: any) => ({ ...val, id }))
          .filter(d =>
            (String(d.isReady) === "true" || String(d.isready) === "true") &&
            (!d.expiryDate || d.expiryDate >= today)
          )
          .sort((a, b) =>
            (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999')
          );

        setDeals(list);
      } catch {
        setError(t.error_msg);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#083344] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-500/50 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
          {t.syncing}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#083344] text-slate-100 pb-10">
      <GermanyRibbon />

      <main className="max-w-6xl mx-auto px-6 py-20 text-center">
        {deals.length === 0 ? (
          <p className="text-cyan-500/40 uppercase tracking-[0.4em] text-xs">
            {t.empty_list}
          </p>
        ) : (
          <p className="text-cyan-400">
            {deals.length} aktív ajánlat
          </p>
        )}
      </main>

      <footer className="text-center text-[9px] text-cyan-500/40 uppercase tracking-[0.4em]">
        {t.footer}
      </footer>
    </div>
  );
};

export default App;

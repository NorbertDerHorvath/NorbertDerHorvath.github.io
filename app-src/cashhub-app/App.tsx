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
    subtitle: "Privát lista",
    install: "Telepítés",
    export: "PDF export",
    error_title: "Hálózati hiba",
    error_msg: "Az adatok jelenleg nem érhetők el.",
    view_deal: "Megnézem az akciót",
    empty_list: "A lista frissítés alatt áll",
    footer: "Biztonságos kapcsolat • Publikus hozzáférés • Verzió 2.0",
    expiry_last_day: "Utolsó nap!",
    expiry_tomorrow: "Holnap lejár",
    expiry_days: (d: number) => `${d} nap van hátra`,
    pdf_title: "Cashback Hub – Aktuális ajánlatok",
    syncing: "Szinkronizálás...",
    legal_notice: "Impresszum és jogi nyilatkozatok a NorbApp oldalon."
  },
  en: {
    subtitle: "Private list",
    install: "Install",
    export: "PDF export",
    error_title: "Network error",
    error_msg: "Data is currently unavailable.",
    view_deal: "View deal",
    empty_list: "List is being updated",
    footer: "Secure connection • Public access • Version 2.0",
    expiry_last_day: "Last day!",
    expiry_tomorrow: "Expires tomorrow",
    expiry_days: (d: number) => `${d} days left`,
    pdf_title: "Cashback Hub – Current deals",
    syncing: "Syncing...",
    legal_notice: "Imprint and legal notices on the NorbApp website."
  },
  de: {
    subtitle: "Private Liste",
    install: "Installieren",
    export: "PDF Export",
    error_title: "Netzwerkfehler",
    error_msg: "Daten derzeit nicht verfügbar.",
    view_deal: "Angebot ansehen",
    empty_list: "Liste wird aktualisiert",
    footer: "Sichere Verbindung • Öffentlicher Zugang • Version 2.0",
    expiry_last_day: "Letzter Tag!",
    expiry_tomorrow: "Läuft morgen ab",
    expiry_days: (d: number) => `Noch ${d} Tage`,
    pdf_title: "Cashback Hub – Aktuelle Angebote",
    syncing: "Synchronisierung...",
    legal_notice: "Impressum und rechtliche Hinweise auf der NorbApp-Website."
  }
};

const BASE = import.meta.env.BASE_URL;

/* =======================
   UI helpers
======================= */

const GermanyRibbon = () => (
  <div className="fixed top-0 right-0 z-20 pointer-events-none opacity-25">
    <div className="w-28 h-28 overflow-hidden">
      <div className="absolute top-6 right-[-40px] w-[200px] h-10 rotate-45 flex flex-col backdrop-blur-sm">
        <div className="h-1/3 bg-black/70"></div>
        <div className="h-1/3 bg-red-600/70"></div>
        <div className="h-1/3 bg-yellow-400/70"></div>
      </div>
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

    const unsub = onValue(dealsRef, snap => {
      try {
        const data = snap.val();
        if (!data) {
          setDeals([]);
          return;
        }

        const today = new Date().toISOString().split('T')[0];

        const list = Object.entries(data)
          .map(([id, v]: any) => ({ ...v, id }))
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

    return () => unsub();
  }, [lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#083344] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-cyan-500/50 text-xs font-bold uppercase tracking-widest">
          {t.syncing}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#083344] text-slate-100">
      <GermanyRibbon />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#083344]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-4 flex-wrap min-w-0 justify-center md:justify-start">

            <a
              href="https://norbertderhorvath.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <img
                src={`${BASE}icons/norbapp.png`}
                alt="NorbApp"
                className="h-10 w-auto object-contain"
              />
              <span className="font-black text-lg tracking-tight whitespace-nowrap">
                NorbApp
              </span>
            </a>

            <div className="hidden md:block h-8 w-px bg-white/10" />

            <div className="flex items-center gap-3 min-w-0">
              <img
                src={`${BASE}icons/cashhub.png`}
                alt="Cashback Hub"
                className="h-10 w-10 object-contain"
              />
              <div className="min-w-0">
                <h1 className="font-black uppercase truncate">
                  Cashback Hub
                </h1>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest opacity-70">
                  {t.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center md:justify-end">
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              {(['hu', 'en', 'de'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${
                    lang === l
                      ? 'bg-cyan-500 text-cyan-950'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {error ? (
          <div className="max-w-md mx-auto bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-center">
            <p className="text-rose-400 font-bold uppercase text-sm mb-2">
              {t.error_title}
            </p>
            <p className="text-rose-400/70 text-xs">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.length > 0 ? deals.map(deal => (
              <div
                key={deal.id}
                className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col"
              >
                <h3 className="font-bold mb-6 leading-tight">
                  {deal.title}
                </h3>
                <a
                  href={deal.finalLink || deal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto bg-cyan-500 text-cyan-950 py-3 rounded-xl text-center font-black uppercase text-xs tracking-widest"
                >
                  {t.view_deal}
                </a>
              </div>
            )) : (
              <div className="col-span-full py-32 text-center opacity-30">
                <p className="text-cyan-400 font-bold uppercase tracking-[0.4em] text-xs">
                  {t.empty_list}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center text-[9px] text-cyan-500/40 uppercase tracking-[0.35em] py-10">
        {t.footer}
        <div className="mt-3">
          <a
            href="https://norbertderhorvath.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {t.legal_notice}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;

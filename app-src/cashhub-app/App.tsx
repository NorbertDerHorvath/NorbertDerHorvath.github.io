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
    export: "PDF Export",
    error_title: "Hálózati Hiba",
    error_msg: "Az adatok jelenleg nem érhetőek el.",
    view_deal: "Megnézem az akciót",
    empty_list: "A lista jelenleg frissítés alatt áll",
    footer: "Biztonságos kapcsolat • Publikus hozzáférés • Verzió 2.0"
  },
  en: {
    subtitle: "Private List",
    export: "PDF Export",
    error_title: "Network Error",
    error_msg: "Data is currently unavailable.",
    view_deal: "View Deal",
    empty_list: "The list is currently being updated",
    footer: "Secure connection • Public access • Version 2.0"
  },
  de: {
    subtitle: "Private Liste",
    export: "PDF Export",
    error_title: "Netzwerkfehler",
    error_msg: "Daten sind derzeit nicht verfügbar.",
    view_deal: "Angebot ansehen",
    empty_list: "Die Liste wird derzeit aktualisiert",
    footer: "Sichere Verbindung • Öffentlicher Zugang • Version 2.0"
  }
};

/* =======================
   UI
======================= */

const GermanyRibbon = () => (
  <div className="fixed top-0 right-0 z-20 pointer-events-none opacity-30">
    <div className="w-40 h-12 rotate-45 translate-x-20 translate-y-6 flex flex-col">
      <div className="h-1/3 bg-black/70"></div>
      <div className="h-1/3 bg-red-600/70"></div>
      <div className="h-1/3 bg-yellow-400/70"></div>
    </div>
  </div>
);

const NorbAppLogo = () => (
  <a
    href="https://norbertderhorvath.github.io"
    target="_blank"
    rel="noopener noreferrer"
    className="shrink-0"
  >
    <img
      src="/apps/cashhub-app/icons/norbapp-v2.png"
      alt="NorbApp"
      className="h-20 w-auto drop-shadow-lg"
    />
  </a>
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
          .map(([id, val]: any) => ({ ...val, id }))
          .filter(d =>
            (String(d.isReady) === "true" || String(d.isready) === "true") &&
            (!d.expiryDate || d.expiryDate >= today)
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
      <div className="min-h-screen flex items-center justify-center bg-[#083344]">
        <div className="animate-spin w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#083344] text-slate-100">
      <GermanyRibbon />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#083344]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

          <div className="flex items-center gap-6 min-w-0">
            <NorbAppLogo />

            <div className="flex items-center gap-4 min-w-0">
              <img
                src="/apps/cashhub-app/icons/cashhub-v2.png"
                alt="Cashback Hub"
                className="h-20 w-auto drop-shadow-xl shrink-0"
              />
              <div className="hidden md:block">
                <h1 className="text-xl font-black uppercase leading-tight">
                  Cashback Hub
                </h1>
                <p className="text-xs text-cyan-400 uppercase tracking-widest">
                  {t.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* LANG */}
          <div className="flex bg-white/5 rounded-xl p-1">
            {(['hu', 'en', 'de'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
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
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {error ? (
          <div className="text-center text-red-400">{t.error_title}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.length ? deals.map(d => (
              <div key={d.id} className="bg-slate-900/40 rounded-2xl p-6">
                <h3 className="font-bold mb-4">{d.title}</h3>
                <a
                  href={d.finalLink || d.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-cyan-500 text-cyan-950 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
                >
                  {t.view_deal}
                </a>
              </div>
            )) : (
              <div className="col-span-full text-center opacity-30">
                {t.empty_list}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center text-[10px] text-cyan-500/40 py-10 uppercase tracking-widest">
        {t.footer}
      </footer>
    </div>
  );
};

export default App;

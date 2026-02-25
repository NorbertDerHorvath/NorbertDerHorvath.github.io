import React, { useState, useEffect } from 'react';
import { Deal } from './types';
import { db } from './firebase';
import { ref, onValue } from "firebase/database";

type Language = 'hu' | 'en' | 'de';

const translations = {
  hu: {
    subtitle: "Privát Lista",
    error_title: "Hálózati Hiba",
    error_msg: "Az adatok jelenleg nem érhetőek el.",
    view_deal: "Megnézem az akciót",
    empty_list: "A lista jelenleg frissítés alatt áll",
    footer: "Biztonságos kapcsolat • Publikus hozzáférés • Verzió 2.0",
    syncing: "Szinkronizálás...",
    expiry_last_day: "Utolsó nap!",
    expiry_tomorrow: "Holnap lejár",
    expiry_days: (d: number) => `${d} nap van hátra`,
  },
  en: {
    subtitle: "Private List",
    error_title: "Network Error",
    error_msg: "Data is currently unavailable.",
    view_deal: "View Deal",
    empty_list: "The list is currently being updated",
    footer: "Secure connection • Public access • Version 2.0",
    syncing: "Syncing...",
    expiry_last_day: "Last day!",
    expiry_tomorrow: "Expires tomorrow",
    expiry_days: (d: number) => `${d} days left`,
  },
  de: {
    subtitle: "Private Liste",
    error_title: "Netzwerkfehler",
    error_msg: "Daten sind derzeit nicht verfügbar.",
    view_deal: "Angebot ansehen",
    empty_list: "Die Liste wird derzeit aktualisiert",
    footer: "Sichere Verbindung • Öffentlicher Zugang • Version 2.0",
    syncing: "Synchronisierung...",
    expiry_last_day: "Letzter Tag!",
    expiry_tomorrow: "Läuft morgen ab",
    expiry_days: (d: number) => `Noch ${d} Tage`,
  }
} as const;

const GermanyRibbon = () => (
  <div
    className="
      fixed top-0 right-0
      z-30 pointer-events-none overflow-hidden
      w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40
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
      <div className="h-1/3 bg-black/70" />
      <div className="h-1/3 bg-[#FF0000]/70" />
      <div className="h-1/3 bg-[#FFCC00]/70" />
    </div>
  </div>
);

const NorbAppLogo = () => (
  <a
    href="https://norbertderhorvath.github.io"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 group shrink-0"
    aria-label="NorbApp"
    title="NorbApp"
  >
    <img
      src="/apps/cashhub-app/icons/norbapp.png"
      alt="NorbApp"
      className="h-10 w-auto drop-shadow-lg group-hover:scale-105 transition-transform"
    />
    {/* NorbApp felirat nincs */}
  </a>
);

const App: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('hu');

  const t = translations[lang];

  const getRemainingDays = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    const exp0 = new Date(expiryDate);
    exp0.setHours(0, 0, 0, 0);
    const diff = exp0.getTime() - today0.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const dealsRef = ref(db, 'deals');
    const unsubscribe = onValue(
      dealsRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (!data) {
            setDeals([]);
            return;
          }

          const today = new Date().toISOString().split('T')[0];

          const list = Object.entries(data)
            .map(([id, val]: any) => ({ ...val, id }) as Deal)
            .filter((d: any) => {
              const isReady = String(d.isReady) === "true" || String(d.isready) === "true";
              const isNotExpired = !d.expiryDate || d.expiryDate >= today;
              return isReady && isNotExpired;
            })
            .sort((a: any, b: any) =>
              (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999')
            );

          setDeals(list);
        } catch {
          setError(t.error_msg);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError(t.error_msg);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [lang, t.error_msg]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#083344] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-cyan-500/50 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
          {t.syncing}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#083344] text-slate-100 pb-10">
      <GermanyRibbon />

      <header className="sticky top-0 z-50 bg-[#083344]/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0 flex-wrap">
            <NorbAppLogo />

            <div className="hidden md:block h-8 w-px bg-white/10" />

            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/apps/cashhub-app/icons/file_00000000db98720a9cbb5b5d33fda3f5.png"
                alt="Cashback Hub"
                className="h-10 w-10 drop-shadow-xl shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-tight truncate">
                  Cashback Hub
                </h1>
                <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-70 truncate">
                  {t.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end">
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              {(['hu', 'en', 'de'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    lang === l
                      ? 'bg-cyan-500 text-cyan-950 shadow-lg'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {error ? (
          <div className="max-w-md mx-auto bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl text-center">
            <p className="text-rose-400 font-bold text-sm mb-2 uppercase tracking-widest">
              {t.error_title}
            </p>
            <p className="text-rose-400/60 text-xs">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.length > 0 ? (
              deals.map((deal: any) => {
                const days = getRemainingDays(deal.expiryDate);
                const badgeText =
                  days === null ? null :
                  days <= 0 ? t.expiry_last_day :
                  days === 1 ? t.expiry_tomorrow :
                  t.expiry_days(days);

                const badgeClass =
                  days !== null && days <= 3
                    ? "bg-rose-500/90 text-white"
                    : "bg-cyan-500/90 text-cyan-950";

                return (
                  <div
                    key={deal.id}
                    className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col"
                  >
                    <div className="relative bg-black/10 border-b border-white/5">
                      {deal.imageUrl ? (
                        <img
                          src={deal.imageUrl}
                          alt=""
                          className="w-full h-44 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-44" />
                      )}

                      {badgeText && (
                        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${badgeClass}`}>
                          {badgeText}
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-black uppercase tracking-tight text-white mb-4 line-clamp-2">
                        {deal.title}
                      </h3>

                      <a
                        href={deal.finalLink || deal.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto block bg-cyan-500 text-cyan-950 py-3 rounded-xl text-center font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
                      >
                        {t.view_deal}
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center opacity-25">
                <p className="text-cyan-500 font-bold uppercase tracking-[0.5em] text-xs">
                  {t.empty_list}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-[9px] text-cyan-500/40 uppercase tracking-[0.4em] py-10">
        {t.footer}
      </footer>
    </div>
  );
};

export default App;

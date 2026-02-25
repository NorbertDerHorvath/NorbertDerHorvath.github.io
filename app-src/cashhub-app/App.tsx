import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import { Deal } from "./types";

type Language = "hu" | "en" | "de";

const translations = {
  hu: {
    subtitle: "Privát Lista",
    view_deal: "Megnézem az akciót",
    empty_list: "A lista jelenleg frissítés alatt áll",
    expiry_last_day: "Utolsó nap!",
    expiry_tomorrow: "Holnap lejár",
    expiry_days: (d: number) => `${d} nap van hátra`,
  },
  en: {
    subtitle: "Private List",
    view_deal: "View Deal",
    empty_list: "The list is currently being updated",
    expiry_last_day: "Last day!",
    expiry_tomorrow: "Expires tomorrow",
    expiry_days: (d: number) => `${d} days left`,
  },
  de: {
    subtitle: "Private Liste",
    view_deal: "Angebot ansehen",
    empty_list: "Die Liste wird derzeit aktualisiert",
    expiry_last_day: "Letzter Tag!",
    expiry_tomorrow: "Läuft morgen ab",
    expiry_days: (d: number) => `Noch ${d} Tage`,
  },
} as const;

const getRemainingDays = (expiryDate?: string) => {
  if (!expiryDate) return null;
  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);
  const exp0 = new Date(expiryDate);
  exp0.setHours(0, 0, 0, 0);
  const diff = exp0.getTime() - today0.getTime();
  return Math.ceil(diff / 86400000);
};

const App: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [lang, setLang] = useState<Language>("hu");

  const t = translations[lang];

  useEffect(() => {
    const dealsRef = ref(db, "deals");

    return onValue(dealsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setDeals([]);
        return;
      }

      const todayStr = new Date().toISOString().split("T")[0];

      const list = Object.entries(data)
        .map(([id, val]: any) => ({ ...val, id }) as Deal)
        .filter((d: any) => {
          const isReady = String(d.isReady) === "true" || String(d.isready) === "true";
          const isNotExpired = !d.expiryDate || d.expiryDate >= todayStr;
          return isReady && isNotExpired;
        })
        .sort((a: any, b: any) => (a.expiryDate || "9999").localeCompare(b.expiryDate || "9999"));

      setDeals(list);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#083344] text-slate-100 pb-10">
      <header className="sticky top-0 z-50 bg-[#083344]/95 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            {/* NorbApp logo (nincs felirat) */}
            <a href="https://norbertderhorvath.github.io" target="_blank" rel="noopener noreferrer" className="shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}icons/norbapp.png`}
                alt="NorbApp"
                className="h-9 w-auto drop-shadow-lg"
              />
            </a>

            <div className="hidden md:block h-8 w-px bg-white/20" />

            {/* App logo */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={`${import.meta.env.BASE_URL}icons/cashhub.png`}
                alt="Cashback Hub"
                className="h-9 w-9 drop-shadow-xl shrink-0"
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

          {/* Language */}
          <div className="flex items-center justify-center md:justify-end">
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
              {(["hu", "en", "de"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    lang === l ? "bg-cyan-500 text-cyan-950 shadow-lg" : "text-white/50 hover:text-white/80"
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
        {deals.length === 0 ? (
          <div className="col-span-full py-24 text-center opacity-30">
            <p className="text-cyan-300 font-bold uppercase tracking-[0.35em] text-xs">{t.empty_list}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal: any) => {
              const days = getRemainingDays(deal.expiryDate);
              const badgeText =
                days === null ? null : days <= 0 ? t.expiry_last_day : days === 1 ? t.expiry_tomorrow : t.expiry_days(days);
              const badgeClass = days !== null && days <= 3 ? "bg-rose-500/90 text-white" : "bg-cyan-500/90 text-cyan-950";

              return (
                <div key={deal.id} className="bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                  <div className="relative bg-black/10 border-b border-white/10">
                    {deal.imageUrl ? (
                      <img src={deal.imageUrl} alt="" className="w-full h-44 object-cover" loading="lazy" />
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
                    <h3 className="font-black uppercase tracking-tight text-white mb-4 line-clamp-2">{deal.title}</h3>

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
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

import React, { useEffect, useState } from "react";
import { Deal } from "./types";
import { db } from "./firebase";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* =======================
   i18n
======================= */

type Language = "hu" | "en" | "de";

const translations = {
  hu: {
    subtitle: "Privát Lista",
    error_title: "Hálózati Hiba",
    error_msg: "Az adatok jelenleg nem érhetőek el.",
    view_deal: "Megnézem az akciót",
    empty_list: "A lista jelenleg frissítés alatt áll",
    footer: "Biztonságos kapcsolat • Publikus hozzáférés • Verzió 2.0",
    syncing: "Szinkronizálás...",
    img_alt: "Ajánlat képe",
  },
  en: {
    subtitle: "Private List",
    error_title: "Network Error",
    error_msg: "Data is currently unavailable.",
    view_deal: "View Deal",
    empty_list: "The list is currently being updated",
    footer: "Secure connection • Public access • Version 2.0",
    syncing: "Syncing...",
    img_alt: "Deal image",
  },
  de: {
    subtitle: "Private Liste",
    error_title: "Netzwerkfehler",
    error_msg: "Daten sind derzeit nicht verfügbar.",
    view_deal: "Angebot ansehen",
    empty_list: "Die Liste wird derzeit aktualisiert",
    footer: "Sichere Verbindung • Öffentlicher Zugang • Version 2.0",
    syncing: "Synchronisierung...",
    img_alt: "Angebotsbild",
  },
};

/* =======================
   UI
======================= */

const GermanyRibbon = () => (
  <div
    className="
      fixed top-0 right-0
      z-20
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

const NorbAppLogo = () => (
  <a
    href="https://norbertderhorvath.github.io"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 group shrink-0"
  >
    {/* 2× magasabb: h-20 -> h-40 */}
    <img
      src="/apps/cashhub-app/icons/norbapp.png"
      alt="NorbApp"
      className="h-40 w-auto drop-shadow-lg transition-transform group-hover:scale-[1.02]"
    />
  </a>
);

const DealImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900/40">
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-300/70 text-xs font-black">
          %
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700"
      onError={() => setFailed(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
};

/* =======================
   App
======================= */

const App: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>("hu");

  const t = translations[lang];

  useEffect(() => {
    const dealsRef = ref(db, "deals");

    const unsubscribe = onValue(dealsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (!data) {
          setDeals([]);
          return;
        }

        const today = new Date().toISOString().split("T")[0];

        const list = Object.entries(data)
          .map(([id, val]: any) => ({ ...val, id }))
          .filter((d: any) => {
            const ready =
              String(d.isReady) === "true" || String(d.isready) === "true";
            const notExpired = !d.expiryDate || d.expiryDate >= today;
            return ready && notExpired;
          })
          .sort((a: any, b: any) =>
            (a.expiryDate || "9999").localeCompare(b.expiryDate || "9999")
          );

        setDeals(list);
        setError(null);
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

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#083344]/95 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 min-w-0">
            <NorbAppLogo />

            <div className="flex items-center gap-4 min-w-0">
              <img
                src="/apps/cashhub-app/icons/cashhub.png"
                alt="Cashback Hub"
                className="h-20 w-auto drop-shadow-xl shrink-0"
              />

              <div className="hidden md:block min-w-0">
                <h1 className="text-xl font-black uppercase leading-tight truncate">
                  Cashback Hub
                </h1>
                <p className="text-xs text-cyan-400 uppercase tracking-widest truncate">
                  {t.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Language switcher */}
          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10 shrink-0">
            {(["hu", "en", "de"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  lang === l
                    ? "bg-cyan-500 text-cyan-950 shadow-lg"
                    : "text-white/40 hover:text-white/70"
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
          <div className="max-w-md mx-auto bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl text-center">
            <p className="text-rose-400 font-bold text-sm mb-2 uppercase tracking-widest">
              {t.error_title}
            </p>
            <p className="text-rose-400/60 text-xs">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.length > 0 ? (
              deals.map((deal) => (
                <div
                  key={deal.id}
                  className="group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden flex flex-col hover:border-cyan-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10"
                >
                  {/* KÉP RÉSZ – ez hiányzott / elbukott korábban */}
                  <div className="h-52 bg-slate-800 relative overflow-hidden">
                    <DealImage src={(deal as any).imageUrl} alt={t.img_alt} />
                  </div>

                  <div className="p-7 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 line-clamp-2 min-h-[3rem] leading-tight group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                      {deal.title}
                    </h3>

                    <a
                      href={deal.finalLink || deal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full bg-cyan-500 text-cyan-950 hover:bg-white hover:text-cyan-950 py-4 rounded-2xl font-black text-center text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                    >
                      {t.view_deal}
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center opacity-20">
                <p className="text-cyan-500 font-bold uppercase tracking-[0.5em] text-xs">
                  {t.empty_list}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center text-[9px] text-cyan-500/40 uppercase tracking-[0.4em] py-10">
        {t.footer}
      </footer>
    </div>
  );
};

export default App;

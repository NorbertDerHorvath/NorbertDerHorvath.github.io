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
    slogan: "Ahol a % nem csak dísz.", // ← szellemes szlogen
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
    slogan: "Where % actually means money.",
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
    slogan: "Wo % nicht nur Deko ist.",
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
    aria-label="NorbApp"
    title="NorbApp"
  >
    {/* vissza kicsire + RELATÍV útvonal (stabil Pages-en) */}
    <img
      src="./icons/norbapp-v2.png"
      alt="NorbApp"
      className="h-14 w-auto drop-shadow-lg transition-transform group-hover:scale-[1.02]"
      loading="eager"
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
          <div className="flex items-center gap-4 min-w-0">
            <NorbAppLogo />

            {/* App ikon + szlogen (NINCS Cashback Hub felirat) */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="./icons/cashhub-v2.png"
                alt="Cashback Hub"
                className="h-14 w-auto drop-shadow-xl shrink-0"
                loading="eager"
              />
              <p className="hidden md:block text-xs text-cyan-300/80 font-bold uppercase tracking-[0.2em] truncate">
                {t.slogan}
              </p>
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

        {/* mobilon a szlogen külön sorba (hogy ne essen szét) */}
        <div className="md:hidden px-6 pb-3">
          <p

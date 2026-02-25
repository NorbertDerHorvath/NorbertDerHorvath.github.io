import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import { Deal } from "./types";

type Language = "hu" | "en" | "de";

const t = {
  hu: {
    subtitle: "Privát lista",
    view: "Megnézem az akciót",
    empty: "A lista jelenleg frissítés alatt áll",
  },
  en: {
    subtitle: "Private list",
    view: "View deal",
    empty: "The list is currently being updated",
  },
  de: {
    subtitle: "Private Liste",
    view: "Angebot ansehen",
    empty: "Die Liste wird gerade aktualisiert",
  },
};

const getRemainingDays = (expiry?: string) => {
  if (!expiry) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiry);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - today.getTime()) / 86400000);
};

const App: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [lang, setLang] = useState<Language>("hu");

  useEffect(() => {
    const r = ref(db, "deals");
    return onValue(r, snap => {
      const v = snap.val();
      if (!v) {
        setDeals([]);
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      const list = Object.entries(v)
        .map(([id, val]: any) => ({ ...val, id }))
        .filter(d =>
          (String(d.isReady) === "true" || String(d.isready) === "true") &&
          (!d.expiryDate || d.expiryDate >= today)
        )
        .sort((a, b) =>
          (a.expiryDate || "9999").localeCompare(b.expiryDate || "9999")
        );

      setDeals(list);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#083344] text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#083344]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* NorbApp logo */}
            <a
              href="https://norbertderhorvath.github.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`${import.meta.env.BASE_URL}icons/norbapp.png`}
                alt="NorbApp"
                className="h-9 w-auto"
              />
            </a>

            <div className="h-8 w-px bg-white/20 hidden sm:block" />

            {/* App logo */}
            <img
              src={`${import.meta.env.BASE_URL}icons/cashhub.png`}
              alt="Cashback Hub"
              className="h-9 w-9"
            />

            <div className="hidden sm:block">
              <div className="font-black uppercase">Cashback Hub</div>
              <div className="text-[10px] tracking-widest text-cyan-400">
                {t[lang].subtitle}
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="flex bg-white/10 rounded-lg p-1">
            {(["hu", "en", "de"] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 text-[10px] uppercase font-black rounded ${
                  lang === l
                    ? "bg-cyan-500 text-cyan-950"
                    : "text-white/60"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {deals.length === 0 ? (
          <div className="text-center opacity-30 uppercase tracking-widest text-xs">
            {t[lang].empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map(d => {
              const days = getRemainingDays(d.expiryDate);
              return (
                <div
                  key={d.id}
                  className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col"
                >
                  <div className="font-black mb-2">{d.title}</div>

                  {days !== null && (
                    <div className="text-xs mb-4 text-cyan-400">
                      {days === 0
                        ? "Utolsó nap!"
                        : days === 1
                        ? "Holnap lejár"
                        : `${days} nap van hátra`}
                    </div>
                  )}

                  <a
                    href={d.finalLink || d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto bg-cyan-500 text-cyan-950 text-xs uppercase font-black tracking-widest py-3 rounded-xl text-center"
                  >
                    {t[lang].view}
                  </a>
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

import React from "react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-slate-950/40 border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="CashHub" className="w-7 h-7" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-100">
              Cashback Hub
            </div>
            <div className="text-xs text-slate-300">
              Aktuális ajánlatok
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-300">Privát lista</div>
      </div>
    </header>
  );
}

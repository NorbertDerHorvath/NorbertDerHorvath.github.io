import React from "react";
import Header from "./components/Header";

/**
 * Fő alkalmazás komponens
 * Itt renderelődik minden, amit a felhasználó lát
 */
export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* FEJLÉC */}
      <Header />

      {/* FŐ TARTALOM */}
      <main className="max-w-5xl mx-auto px-4 py-4">
        {/* 
          IDE JÖN A MEGLÉVŐ TARTALOMOD
          (lista, kártyák, Firebase-es cuccok, stb.)
          
          Ha eddig volt JSX az App.tsx-ben,
          azt IDE kell majd visszatenni.
        */}

        <div className="text-center text-sm text-slate-400 mt-10">
          Tartalom betöltése…
        </div>
      </main>

      {/* LÁBLÉC (opcionális) */}
      <footer className="text-center text-xs text-slate-500 py-6">
        Biztonságos kapcsolat • Publikus hozzáférés • Verzió 2.0
      </footer>
    </div>
  );
}

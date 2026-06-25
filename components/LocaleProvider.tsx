"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DICIONARIOS, Idioma } from "@/lib/i18n/dicionarios";

const LocaleContext = createContext<{
  idioma: Idioma;
  definirIdioma: (idioma: Idioma) => void;
  t: typeof DICIONARIOS.pt;
}>({
  idioma: "pt",
  definirIdioma: () => {},
  t: DICIONARIOS.pt,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>("pt");

  useEffect(() => {
    const guardado = localStorage.getItem("flowops-idioma") as Idioma | null;
    if (guardado && DICIONARIOS[guardado]) {
      setIdioma(guardado);
    }
  }, []);

  function definirIdioma(novo: Idioma) {
    setIdioma(novo);
    localStorage.setItem("flowops-idioma", novo);
  }

  return (
    <LocaleContext.Provider value={{ idioma, definirIdioma, t: DICIONARIOS[idioma] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

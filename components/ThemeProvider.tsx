"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Tema = "light" | "dark";

const ThemeContext = createContext<{
  tema: Tema;
  alternarTema: () => void;
}>({
  tema: "light",
  alternarTema: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => {
    const guardado = localStorage.getItem("flowops-tema") as Tema | null;
    if (guardado === "dark" || guardado === "light") {
      setTema(guardado);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "dark");
    localStorage.setItem("flowops-tema", tema);
  }, [tema]);

  function alternarTema() {
    setTema((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

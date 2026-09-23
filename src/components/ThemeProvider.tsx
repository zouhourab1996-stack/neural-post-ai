import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type ThemeProviderProps = { children: React.ReactNode; defaultTheme?: Theme; storageKey?: string };
type ThemeProviderState = { theme: Theme; setTheme: (theme: Theme) => void };
const ThemeProviderContext = createContext<ThemeProviderState>({ theme: "dark", setTheme: () => undefined });

export function ThemeProvider({ children, defaultTheme = "dark", storageKey = "prophetic-theme" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);
  const setTheme = (next: Theme) => { setThemeState(next); localStorage.setItem(storageKey, next); };
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); document.documentElement.classList.toggle("light", theme === "light"); }, [theme]);
  return <ThemeProviderContext.Provider value={{ theme, setTheme }}>{children}</ThemeProviderContext.Provider>;
}
export const useTheme = () => useContext(ThemeProviderContext);

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  isDark: boolean;
  toggleDark: () => void;
  currency: string;
  setCurrency: (code: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleDark: () => {},
  currency: "USD",
  setCurrency: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [currency, setCurrencyState] = useState("USD");

  useEffect(() => {
    AsyncStorage.multiGet(["@theme", "@currency"]).then((pairs) => {
      pairs.forEach(([key, value]) => {
        if (key === "@theme" && value === "dark") setIsDark(true);
        if (key === "@currency" && value)        setCurrencyState(value);
      });
    });
  }, []);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem("@theme", next ? "dark" : "light");
      return next;
    });
  };

  const setCurrency = (code: string) => {
    setCurrencyState(code);
    AsyncStorage.setItem("@currency", code);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, currency, setCurrency }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

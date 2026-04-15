import React, { createContext, useCallback, useContext, useState } from "react";
import { CARDS } from "@/constants/data";

const INITIAL_BALANCE = CARDS.reduce((sum, c) => sum + c.balance, 0);

interface WalletContextValue {
  totalBalance: number;
  deductAmount: (amount: number) => void;
  addAmount:    (amount: number) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [totalBalance, setTotalBalance] = useState(INITIAL_BALANCE);

  const deductAmount = useCallback((amount: number) => {
    setTotalBalance((prev) => Math.max(0, prev - amount));
  }, []);

  const addAmount = useCallback((amount: number) => {
    setTotalBalance((prev) => prev + amount);
  }, []);

  return (
    <WalletContext.Provider value={{ totalBalance, deductAmount, addAmount }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

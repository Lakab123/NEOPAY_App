import React, { createContext, useCallback, useContext, useRef, useState } from "react";

export type NotifType = "transfer_sent" | "payment_received" | "info";

export interface AppNotification {
  id:        string;
  type:      NotifType;
  title:     string;
  message:   string;
  amount?:   string;
  timestamp: Date;
  read:      boolean;
}

interface NotificationContextValue {
  notifications:   AppNotification[];
  unreadCount:     number;
  activeToast:     AppNotification | null;
  addNotification: (type: NotifType, title: string, message: string, amount?: string) => void;
  markAllRead:     () => void;
  dismissToast:    () => void;
  clearAll:        () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast,   setActiveToast]   = useState<AppNotification | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setActiveToast(null);
  }, []);

  const addNotification = useCallback(
    (type: NotifType, title: string, message: string, amount?: string) => {
      const notif: AppNotification = {
        id:        Date.now().toString(),
        type,
        title,
        message,
        amount,
        timestamp: new Date(),
        read:      false,
      };

      setNotifications((prev) => [notif, ...prev]);

      // Show toast — dismiss any existing one first
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setActiveToast(notif);
      toastTimer.current = setTimeout(() => setActiveToast(null), 4500);
    },
    []
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, activeToast, addNotification, markAllRead, dismissToast, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}

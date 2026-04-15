import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppNotification, useNotifications } from "@/contexts/NotificationContext";
import { useColors } from "@/hooks/useColors";

function formatTime(date: Date) {
  const now   = new Date();
  const diff  = now.getTime() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);

  if (mins  < 1)   return "Just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

function notifAccent(type: AppNotification["type"], colors: ReturnType<typeof useColors>) {
  if (type === "payment_received") return "#00C896";
  if (type === "transfer_sent")    return colors.accent;
  return colors.accent;
}

function notifIcon(type: AppNotification["type"]) {
  if (type === "payment_received") return "arrow-down-left" as const;
  if (type === "transfer_sent")    return "arrow-up-right"  as const;
  return "bell" as const;
}

interface Props {
  visible:  boolean;
  onClose:  () => void;
}

export function NotificationsPanel({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, markAllRead, clearAll, unreadCount } = useNotifications();

  const handleOpen = () => {
    markAllRead();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onShow={handleOpen}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: insets.bottom + 20 }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={[styles.unreadLabel, { color: colors.accent }]}>
                {unreadCount} unread
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            {notifications.length > 0 && (
              <TouchableOpacity
                style={[styles.clearBtn, { borderColor: colors.border }]}
                onPress={() => { clearAll(); onClose(); }}
              >
                <Text style={[styles.clearText, { color: colors.mutedForeground }]}>Clear all</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={onClose}
            >
              <Feather name="x" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="bell-off" size={32} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyTitle,   { color: colors.foreground }]}>All caught up!</Text>
              <Text style={[styles.emptyMessage, { color: colors.mutedForeground }]}>
                Notifications for payments and transfers will appear here.
              </Text>
            </View>
          ) : (
            notifications.map((notif, idx) => {
              const accent = notifAccent(notif.type, colors);
              const icon   = notifIcon(notif.type);
              return (
                <View
                  key={notif.id}
                  style={[
                    styles.notifRow,
                    idx < notifications.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    !notif.read && { backgroundColor: accent + "08" },
                  ]}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <View style={[styles.unreadDot, { backgroundColor: accent }]} />
                  )}

                  {/* Icon */}
                  <View style={[styles.notifIcon, { backgroundColor: accent + "20" }]}>
                    <Feather name={icon} size={18} color={accent} />
                  </View>

                  {/* Body */}
                  <View style={styles.notifBody}>
                    <View style={styles.notifTopRow}>
                      <Text style={[styles.notifTitle, { color: colors.foreground }]} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
                        {formatTime(notif.timestamp)}
                      </Text>
                    </View>
                    <Text style={[styles.notifMessage, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {notif.message}
                    </Text>
                    {notif.amount && (
                      <View style={[styles.amountPill, { backgroundColor: accent + "15" }]}>
                        <Text style={[styles.amountPillText, { color: accent }]}>{notif.amount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet:         { position: "absolute", bottom: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, maxHeight: "80%", paddingTop: 12, paddingHorizontal: 20 },
  handle:        { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  header:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title:         { fontSize: 20, fontFamily: "Inter_700Bold" },
  unreadLabel:   { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  clearBtn:      { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  clearText:     { fontSize: 13, fontFamily: "Inter_500Medium" },
  closeBtn:      { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  list:          { flex: 0 },
  emptyState:    { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyIcon:     { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emptyTitle:    { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptyMessage:  { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 24 },
  notifRow:      { flexDirection: "row", alignItems: "flex-start", paddingVertical: 16, gap: 14, position: "relative" },
  unreadDot:     { position: "absolute", top: 22, left: -8, width: 7, height: 7, borderRadius: 4 },
  notifIcon:     { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2 },
  notifBody:     { flex: 1, gap: 4 },
  notifTopRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notifTitle:    { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 8 },
  notifTime:     { fontSize: 12, fontFamily: "Inter_400Regular" },
  notifMessage:  { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  amountPill:    { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  amountPillText:{ fontSize: 13, fontFamily: "Inter_700Bold" },
});

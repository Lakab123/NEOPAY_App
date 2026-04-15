import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppNotification, useNotifications } from "@/contexts/NotificationContext";
import { useColors } from "@/hooks/useColors";

function toastAccent(type: AppNotification["type"], colors: ReturnType<typeof useColors>) {
  if (type === "payment_received") return "#00C896";
  if (type === "transfer_sent")    return colors.accent;
  return colors.accent;
}

function toastIcon(type: AppNotification["type"]) {
  if (type === "payment_received") return "arrow-down-left" as const;
  if (type === "transfer_sent")    return "arrow-up-right"  as const;
  return "bell" as const;
}

export function NotificationToast() {
  const { activeToast, dismissToast } = useNotifications();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const slideY  = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const topOffset = Platform.OS === "web" ? 80 : insets.top + 10;

  useEffect(() => {
    if (activeToast) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideY, {
          toValue:        0,
          useNativeDriver: true,
          tension:         80,
          friction:        10,
        }),
        Animated.timing(opacity, {
          toValue:         1,
          duration:        200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideY, {
          toValue:         -160,
          duration:        280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue:         0,
          duration:        220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeToast]);

  if (!activeToast && opacity.__getValue() === 0) return null;

  const accent = toastAccent(activeToast?.type ?? "info", colors);
  const icon   = toastIcon(activeToast?.type ?? "info");

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: topOffset, transform: [{ translateY: slideY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.toast, { backgroundColor: colors.card, borderColor: accent + "50", shadowColor: accent }]}>
        {/* Colored left bar */}
        <View style={[styles.bar, { backgroundColor: accent }]} />

        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: accent + "22" }]}>
          <Feather name={icon} size={18} color={accent} />
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {activeToast?.title ?? ""}
          </Text>
          <Text style={[styles.message, { color: colors.mutedForeground }]} numberOfLines={2}>
            {activeToast?.message ?? ""}
          </Text>
        </View>

        {/* Amount badge */}
        {activeToast?.amount && (
          <View style={[styles.amountBadge, { backgroundColor: accent + "18" }]}>
            <Text style={[styles.amountText, { color: accent }]}>{activeToast.amount}</Text>
          </View>
        )}

        {/* Dismiss */}
        <TouchableOpacity style={styles.closeBtn} onPress={dismissToast} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="x" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position:     "absolute",
    left:         16,
    right:        16,
    zIndex:       9999,
  },
  toast: {
    flexDirection:  "row",
    alignItems:     "center",
    borderRadius:   16,
    borderWidth:    1,
    paddingVertical: 14,
    paddingRight:   14,
    gap:            10,
    overflow:       "hidden",
    shadowOffset:   { width: 0, height: 6 },
    shadowOpacity:  0.18,
    shadowRadius:   14,
    elevation:      10,
  },
  bar:        { width: 4, alignSelf: "stretch", borderRadius: 4, marginLeft: 0 },
  iconWrap:   { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  textWrap:   { flex: 1 },
  title:      { fontSize: 14, fontFamily: "Inter_700Bold",    marginBottom: 2 },
  message:    { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  amountBadge:{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  amountText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  closeBtn:   { padding: 2 },
});

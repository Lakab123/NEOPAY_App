import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";

type SettingItem = {
  icon: string;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  color?: string;
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, toggleDark, currency } = useTheme();

  const topPadding    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const navigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const SETTINGS: { section: string; items: SettingItem[] }[] = [
    {
      section: "Account",
      items: [
        { icon: "user",    label: "Personal Info", value: user?.name ?? "" },
        { icon: "mail",    label: "Email",          value: user?.email ?? "" },
        {
          icon: "shield", label: "Security", value: "2FA Enabled",
          onPress: () => navigate("/security"),
        },
        { icon: "bell",    label: "Notifications",  toggle: true, toggleValue: true, onToggle: () => {} },
      ],
    },
    {
      section: "Preferences",
      items: [
        {
          icon: "moon", label: "Dark Mode",
          toggle: true, toggleValue: isDark, onToggle: toggleDark,
        },
        { icon: "globe",        label: "Language", value: "English" },
        {
          icon: "dollar-sign", label: "Currency", value: currency,
          onPress: () => navigate("/currency"),
        },
      ],
    },
    {
      section: "Support",
      items: [
        { icon: "help-circle",    label: "Help Center",      onPress: () => navigate("/help-center") },
        { icon: "message-circle", label: "Contact Support" },
        { icon: "star",           label: "Rate App" },
      ],
    },
    {
      section: "Legal",
      items: [
        { icon: "file-text", label: "Privacy Policy", onPress: () => navigate("/privacy-policy") },
        { icon: "book-open", label: "Terms of Service" },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16, paddingBottom: bottomPadding + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      {/* User Card */}
      <View style={[styles.userCard, { backgroundColor: colors.primary }]}>
        <View style={styles.circleDecor1} />
        <View style={styles.circleDecor2} />
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarInitials}>
            {(user?.name ?? "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name ?? "User"}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
        </View>
        <View style={styles.memberBadge}>
          <Feather name="award" size={12} color="#FFD700" />
          <Text style={styles.memberText}>Premium</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Transactions", value: "248" },
          { label: "Saved", value: "$1.2K" },
          { label: "Member", value: "2 yrs" },
        ].map((stat) => (
          <View
            key={stat.label}
            style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Settings */}
      {SETTINGS.map((group) => (
        <View key={group.section} style={styles.settingGroup}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            {group.section.toUpperCase()}
          </Text>
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {group.items.map((item, i) => (
              <View key={item.label}>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => {
                    if (item.toggle) return;
                    if (item.onPress) item.onPress();
                    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={item.toggle ? 1 : 0.7}
                >
                  <View style={[styles.settingIcon, { backgroundColor: (item.color || colors.accent) + "18" }]}>
                    <Feather name={item.icon as any} size={16} color={item.color || colors.accent} />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <View style={styles.settingRight}>
                    {item.toggle ? (
                      <Switch
                        value={item.toggleValue ?? false}
                        onValueChange={(v) => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          item.onToggle?.(v);
                        }}
                        trackColor={{ false: colors.border, true: colors.accent }}
                        thumbColor="#FFFFFF"
                      />
                    ) : item.value ? (
                      <View style={styles.valueRow}>
                        <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{item.value}</Text>
                        {item.onPress && <Feather name="chevron-right" size={14} color={colors.mutedForeground} />}
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                    )}
                  </View>
                </TouchableOpacity>
                {i < group.items.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: "#FF4D4D18", borderColor: "#FF4D4D30" }]}
        onPress={async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace("/login");
        }}
      >
        <Feather name="log-out" size={18} color="#FF4D4D" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 20 },
  userCard: {
    borderRadius: 20, padding: 24, marginBottom: 16,
    flexDirection: "row", alignItems: "center", gap: 16,
    overflow: "hidden", position: "relative",
  },
  circleDecor1: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)", top: -30, right: 20,
  },
  circleDecor2: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)", bottom: -20, right: 100,
  },
  avatarLarge: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: "rgba(0,212,170,0.3)", alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(0,212,170,0.5)",
  },
  avatarInitials: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#00D4AA" },
  userInfo:  { flex: 1 },
  userName:  { fontSize: 18, fontFamily: "Inter_700Bold",   color: "#FFFFFF", marginBottom: 2 },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  memberBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,215,0,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  memberText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FFD700" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statItem: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 2 },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  settingGroup: { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  settingCard:  { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  settingRow:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  settingIcon:  { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  settingRight: { alignItems: "flex-end" },
  valueRow:     { flexDirection: "row", alignItems: "center", gap: 4 },
  settingValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginLeft: 62 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 16, paddingVertical: 16, borderWidth: 1, marginTop: 4, marginBottom: 20,
  },
  logoutText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FF4D4D" },
});

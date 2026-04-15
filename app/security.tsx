import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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

import { useColors } from "@/hooks/useColors";

type Method = "app" | "sms" | null;

const BACKUP_CODES = [
  "NEXA-7F2K-9P3M",
  "NEXA-4R8T-2L6Q",
  "NEXA-1B5N-7W0X",
  "NEXA-9G3D-4J2V",
  "NEXA-6H1C-8K5Z",
  "NEXA-3E0Y-5A9U",
];

export default function SecurityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [method, setMethod] = useState<Method>("app");
  const [biometric, setBiometric] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showCodes, setShowCodes] = useState(false);

  const topPadding    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const handleToggle2FA = (v: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTwoFAEnabled(v);
    if (!v) setMethod(null);
    else     setMethod("app");
  };

  const handleMethod = (m: Method) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMethod(m);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16, paddingBottom: bottomPadding + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Security</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status banner */}
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: twoFAEnabled ? colors.accent + "18" : "#FF4D4D18",
            borderColor:     twoFAEnabled ? colors.accent + "40" : "#FF4D4D40" },
        ]}
      >
        <View style={[styles.statusIconWrap, { backgroundColor: twoFAEnabled ? colors.accent : "#FF4D4D" }]}>
          <Feather name={twoFAEnabled ? "shield" : "shield-off"} size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusTitle, { color: colors.foreground }]}>
            {twoFAEnabled ? "Account Protected" : "Account at Risk"}
          </Text>
          <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>
            {twoFAEnabled
              ? "Two-factor authentication is active"
              : "Enable 2FA to secure your account"}
          </Text>
        </View>
      </View>

      {/* 2FA toggle */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TWO-FACTOR AUTHENTICATION</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.accent + "18" }]}>
            <Feather name="lock" size={16} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Enable 2FA</Text>
            <Text style={[styles.rowSub,   { color: colors.mutedForeground }]}>
              Require a second step when signing in
            </Text>
          </View>
          <Switch
            value={twoFAEnabled}
            onValueChange={handleToggle2FA}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Method picker */}
      {twoFAEnabled && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>VERIFICATION METHOD</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Authenticator app */}
            <TouchableOpacity
              style={[styles.methodRow, method === "app" && { backgroundColor: colors.accent + "10" }]}
              onPress={() => handleMethod("app")}
            >
              <View style={[styles.methodIcon, { backgroundColor: "#7B61FF20" }]}>
                <Feather name="smartphone" size={18} color="#7B61FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodTitle, { color: colors.foreground }]}>Authenticator App</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>
                  Google Authenticator, Authy, etc. (Recommended)
                </Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: method === "app" ? colors.accent : colors.border },
                ]}
              >
                {method === "app" && <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />}
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* SMS */}
            <TouchableOpacity
              style={[styles.methodRow, method === "sms" && { backgroundColor: colors.accent + "10" }]}
              onPress={() => handleMethod("sms")}
            >
              <View style={[styles.methodIcon, { backgroundColor: "#FF9F4320" }]}>
                <Feather name="message-square" size={18} color="#FF9F43" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodTitle, { color: colors.foreground }]}>SMS / Text Message</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>
                  Receive a code via SMS to your registered phone
                </Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: method === "sms" ? colors.accent : colors.border },
                ]}
              >
                {method === "sms" && <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Setup CTA */}
          <TouchableOpacity
            style={[styles.setupBtn, { backgroundColor: colors.accent }]}
            onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
          >
            <Feather name="check-circle" size={18} color="#0A0F1E" />
            <Text style={styles.setupBtnText}>
              {method === "app" ? "Set Up Authenticator App" : "Verify Phone Number"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Additional security */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ADDITIONAL SECURITY</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Biometric */}
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: "#54A0FF20" }]}>
            <Feather name="aperture" size={16} color="#54A0FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Biometric Login</Text>
            <Text style={[styles.rowSub,   { color: colors.mutedForeground }]}>
              Fingerprint or Face ID to unlock
            </Text>
          </View>
          <Switch
            value={biometric}
            onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBiometric(v); }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {/* Login alerts */}
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: "#FF9F4320" }]}>
            <Feather name="bell" size={16} color="#FF9F43" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Login Alerts</Text>
            <Text style={[styles.rowSub,   { color: colors.mutedForeground }]}>
              Notify me of new sign-ins to my account
            </Text>
          </View>
          <Switch
            value={loginAlerts}
            onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLoginAlerts(v); }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Backup codes */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BACKUP CODES</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.codesInfo, { color: colors.mutedForeground }]}>
          Save these one-time backup codes somewhere safe. Each code can only be used once if you lose access to your 2FA method.
        </Text>
        <TouchableOpacity
          style={[styles.showCodesBtn, { borderColor: colors.border }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowCodes((p) => !p); }}
        >
          <Feather name={showCodes ? "eye-off" : "eye"} size={16} color={colors.accent} />
          <Text style={[styles.showCodesBtnText, { color: colors.accent }]}>
            {showCodes ? "Hide Codes" : "Show Backup Codes"}
          </Text>
        </TouchableOpacity>
        {showCodes && (
          <View style={[styles.codesGrid, { borderTopColor: colors.border }]}>
            {BACKUP_CODES.map((code) => (
              <View key={code} style={[styles.codeChip, { backgroundColor: colors.muted }]}>
                <Text style={[styles.codeText, { color: colors.foreground }]}>{code}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  statusIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statusTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 2 },
  statusSub:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
  row:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 2 },
  rowSub:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider:  { height: 1, marginLeft: 62 },
  methodRow:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  methodIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  methodTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  methodSub:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  radioOuter:  { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner:  { width: 10, height: 10, borderRadius: 5 },
  setupBtn: { borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 },
  setupBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#0A0F1E" },
  codesInfo: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, padding: 16 },
  showCodesBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 12, margin: 12, marginTop: 0, paddingVertical: 12 },
  showCodesBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  codesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 16, paddingTop: 14, borderTopWidth: 1 },
  codeChip:  { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  codeText:  { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
});

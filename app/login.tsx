import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email,            setEmail]            = useState("");
  const [password,         setPassword]         = useState("");
  const [showPassword,     setShowPassword]     = useState(false);
  const [loading,          setLoading]          = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [error,            setError]            = useState("");
  const [biometricMsg,     setBiometricMsg]     = useState("");
  const [biometricOk,      setBiometricOk]      = useState(false);

  const topPadding    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const clearMessages = () => { setError(""); setBiometricMsg(""); setBiometricOk(false); };

  // ── Password login ──────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password) { setError("Please fill in all fields"); return; }
    clearMessages();
    setLoading(true);
    try {
      const domain  = process.env["EXPO_PUBLIC_DOMAIN"];
      const baseUrl = domain ? `https://${domain}` : "https://workspaceapi-server-production-a8a9.up.railway.app";
      const res  = await fetch(`${baseUrl}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      await login(data.token, data.user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch {
      setError("Network error. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  // ── Biometric login ─────────────────────────────────────────────
  const handleBiometricLogin = async () => {
    clearMessages();

    if (Platform.OS === "web") {
      setBiometricMsg(
        "Fingerprint / Face ID login works on the NEOPAY iOS and Android app. " +
        "Sign in with your password here, or open the app on your phone to use biometric."
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    setBiometricLoading(true);
    try {
      const LocalAuthentication = await import("expo-local-authentication");
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled  = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setBiometricMsg(
          "No biometric enrolled on this device. Set up Fingerprint or Face ID in device Settings first."
        );
        return;
      }

      // Prompt for scan
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Scan your fingerprint or face to sign in to NEOPAY",
        fallbackLabel: "Use password",
        cancelLabel:   "Cancel",
      });

      if (!result.success) {
        setBiometricMsg("Scan cancelled. Please use your password to sign in.");
        return;
      }

      // Scan succeeded → retrieve token stored on device
      const SecureStore    = await import("expo-secure-store");
      const biometricToken = await SecureStore.getItemAsync("biometric_token");

      if (!biometricToken) {
        setBiometricMsg(
          "Biometric login is not set up for this device. " +
          "Create a new account — biometric is enrolled automatically during sign-up."
        );
        return;
      }

      // Match token against database
      const domain  = process.env["EXPO_PUBLIC_DOMAIN"];
      const baseUrl = domain ? `https://${domain}` : "https://workspaceapi-server-production-a8a9.up.railway.app";
      const res  = await fetch(`${baseUrl}/api/auth/biometric-login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ biometricToken }),
      });
      const data = await res.json();

      if (res.ok) {
        setBiometricOk(true);
        setBiometricMsg("Biometric matched! Signing you in…");
        await login(data.token, data.user);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        setBiometricMsg(
          data.error ?? "Biometric token not matched. Please sign in with your password."
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setBiometricMsg("Biometric scan failed. Please use your password.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 20, paddingBottom: bottomPadding + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brand}>
          <Image
            source={require("@/assets/images/logo.jpg")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Welcome back</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sign In</Text>

          {/* Password error */}
          {!!error && (
            <View style={[styles.msgBox, { backgroundColor: "#FF4D4D18", borderColor: "#FF4D4D40" }]}>
              <Feather name="alert-circle" size={14} color="#FF4D4D" />
              <Text style={[styles.msgText, { color: "#FF4D4D" }]}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email Address</Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
              <Feather name="mail" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={styles.forgotRow}>
            <Text style={[styles.forgotText, { color: colors.accent }]}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0A0F1E" />
            ) : (
              <>
                <Feather name="log-in" size={18} color="#0A0F1E" />
                <Text style={styles.primaryBtnText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          {/* ── Biometric button ── */}
          <TouchableOpacity
            style={[
              styles.biometricBtn,
              {
                borderColor:     biometricOk ? colors.positive + "60" : colors.border,
                backgroundColor: biometricOk ? colors.positive + "10" : colors.secondary,
              },
            ]}
            onPress={handleBiometricLogin}
            disabled={biometricLoading}
            activeOpacity={0.8}
          >
            {biometricLoading ? (
              <View style={styles.scanRow}>
                <ActivityIndicator color={colors.accent} size="small" />
                <Text style={[styles.scanText, { color: colors.accent }]}>Scanning…</Text>
              </View>
            ) : (
              <>
                <View style={[
                  styles.bioIcon,
                  { backgroundColor: biometricOk ? colors.positive + "20" : colors.accent + "20" },
                ]}>
                  <Feather
                    name={biometricOk ? "check-circle" : Platform.OS === "web" ? "smartphone" : "activity"}
                    size={22}
                    color={biometricOk ? colors.positive : colors.accent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bioTitle, { color: colors.foreground }]}>
                    Fingerprint / Face ID
                  </Text>
                  <Text style={[styles.bioSub, { color: colors.mutedForeground }]}>
                    {Platform.OS === "web"
                      ? "Available on iOS & Android"
                      : "Tap to scan and sign in instantly"}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </>
            )}
          </TouchableOpacity>

          {/* Biometric feedback */}
          {!!biometricMsg && (
            <View style={[
              styles.msgBox,
              {
                backgroundColor: biometricOk ? colors.positive + "15" : colors.accent + "12",
                borderColor:     biometricOk ? colors.positive + "40" : colors.accent + "30",
                marginTop: 12,
              },
            ]}>
              <Feather
                name={biometricOk ? "check-circle" : "info"}
                size={14}
                color={biometricOk ? colors.positive : colors.accent}
                style={{ marginTop: 1 }}
              />
              <Text style={[styles.msgText, { color: biometricOk ? colors.positive : colors.accent }]}>
                {biometricMsg}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={[styles.footerLink, { color: colors.accent }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  content:       { paddingHorizontal: 24 },
  brand:         { alignItems: "center", marginBottom: 32 },
  logoImage:     { width: 200, height: 80, borderRadius: 12, marginBottom: 8 },
  tagline:       { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 4 },
  card:          { borderRadius: 20, padding: 24, borderWidth: 1, marginBottom: 24 },
  cardTitle:     { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 20 },
  msgBox:        { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  msgText:       { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1, lineHeight: 18 },
  fieldGroup:    { marginBottom: 16 },
  label:         { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 8, letterSpacing: 0.3 },
  inputRow:      { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  input:         { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  forgotRow:     { alignItems: "flex-end", marginBottom: 20, marginTop: -4 },
  forgotText:    { fontSize: 13, fontFamily: "Inter_500Medium" },
  primaryBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 14, marginBottom: 16 },
  primaryBtnText:{ fontSize: 16, fontFamily: "Inter_700Bold", color: "#0A0F1E" },
  dividerRow:    { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  divider:       { flex: 1, height: 1 },
  dividerText:   { fontSize: 13, fontFamily: "Inter_400Regular" },
  biometricBtn:  { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  scanRow:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 6 },
  scanText:      { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  bioIcon:       { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  bioTitle:      { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  bioSub:        { fontSize: 12, fontFamily: "Inter_400Regular" },
  footer:        { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText:    { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink:    { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

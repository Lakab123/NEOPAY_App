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

type Step = "form" | "scanning" | "enrolling" | "done" | "skipped";

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [step,            setStep]            = useState<Step>("form");
  const [stepMsg,         setStepMsg]         = useState("");

  const topPadding    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  // ── Biometric enrollment (called after account is created) ───────
  const enrollBiometric = async (jwtToken: string) => {
    const domain  = process.env["EXPO_PUBLIC_DOMAIN"];
    const baseUrl = domain ? `https://${domain}` : "https://workspaceapi-server-production-a8a9.up.railway.app";

    if (Platform.OS === "web") {
      // Web can't scan — skip silently
      setStep("skipped");
      return;
    }

    setStep("scanning");
    setStepMsg("Scanning your biometric…");

    try {
      const LocalAuthentication = await import("expo-local-authentication");
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled  = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setStep("skipped");
        setStepMsg("No biometric enrolled on this device — skipping.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Scan your fingerprint or face to secure your account",
        cancelLabel:   "Skip",
        fallbackLabel: "Skip",
      });

      if (!result.success) {
        setStep("skipped");
        setStepMsg("Biometric skipped — you can enable it later in Security settings.");
        return;
      }

      // Scan succeeded → enroll token in DB
      setStep("enrolling");
      setStepMsg("Saving biometric to your account…");

      const enrollRes  = await fetch(`${baseUrl}/api/auth/biometric-enroll`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${jwtToken}`,
        },
      });
      const enrollData = await enrollRes.json();

      if (enrollRes.ok && enrollData.biometricToken) {
        const SecureStore = await import("expo-secure-store");
        await SecureStore.setItemAsync("biometric_token", enrollData.biometricToken);
        setStep("done");
        setStepMsg("Biometric saved! You can now sign in with your fingerprint or face.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setStep("skipped");
        setStepMsg("Could not save biometric. You can enable it later in Security settings.");
      }
    } catch {
      setStep("skipped");
      setStepMsg("Biometric unavailable — skipping.");
    }
  };

  // ── Create account ───────────────────────────────────────────────
  const handleSignup = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const domain  = process.env["EXPO_PUBLIC_DOMAIN"];
      const baseUrl = domain ? `https://${domain}` : "https://workspaceapi-server-production-a8a9.up.railway.app";

      const res  = await fetch(`${baseUrl}/api/auth/signup`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Signup failed");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // Account created — now enroll biometric
      setLoading(false);
      await enrollBiometric(data.token);

      // Navigate to home (biometric success or skipped)
      await login(data.token, data.user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch {
      setError("Network error. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLoading(false);
    }
  };

  // ── Overlay shown after Create Account is tapped ─────────────────
  const showOverlay = step !== "form";

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Biometric progress overlay ── */}
      {showOverlay && (
        <View style={[styles.overlay, { backgroundColor: colors.background }]}>
          <View style={[styles.overlayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Icon */}
            <View style={[
              styles.overlayIcon,
              {
                backgroundColor:
                  step === "done"    ? colors.positive + "20"
                : step === "skipped" ? colors.border
                : colors.accent + "20",
              },
            ]}>
              {step === "scanning" || step === "enrolling" ? (
                <ActivityIndicator color={colors.accent} size="large" />
              ) : step === "done" ? (
                <Feather name="check-circle" size={40} color={colors.positive} />
              ) : (
                <Feather name="skip-forward" size={40} color={colors.mutedForeground} />
              )}
            </View>

            {/* Status */}
            <Text style={[styles.overlayTitle, { color: colors.foreground }]}>
              {step === "scanning"  ? "Scanning Biometric"
             : step === "enrolling" ? "Saving to Account"
             : step === "done"      ? "Biometric Enrolled!"
             : "Almost Done"}
            </Text>
            <Text style={[styles.overlayMsg, { color: colors.mutedForeground }]}>
              {stepMsg}
            </Text>

            {/* Progress dots */}
            <View style={styles.dots}>
              {(["Account Created", "Biometric Scan", "Saved to DB"] as const).map((label, i) => {
                const active =
                  (i === 0) ||
                  (i === 1 && (step === "scanning" || step === "enrolling" || step === "done")) ||
                  (i === 2 && step === "done");
                return (
                  <View key={label} style={styles.dotRow}>
                    <View style={[styles.dot, { backgroundColor: active ? colors.positive : colors.border }]} />
                    <Text style={[styles.dotLabel, { color: active ? colors.positive : colors.mutedForeground }]}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 20, paddingBottom: bottomPadding + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Brand */}
        <View style={styles.brand}>
          <Image
            source={require("@/assets/images/logo.jpg")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.brandName, { color: colors.foreground }]}>Create Account</Text>
          <Text style={[styles.tagline,   { color: colors.mutedForeground }]}>
            Join NEOPAY — biometric login included
          </Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: "#FF4D4D18", borderColor: "#FF4D4D40" }]}>
              <Feather name="alert-circle" size={14} color="#FF4D4D" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Full Name</Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
              <Feather name="user" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="e.g. Alex Morgan"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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
                placeholder="Min. 6 characters"
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

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Confirm Password</Text>
            <View style={[styles.inputRow, {
              borderColor:     confirmPassword && password !== confirmPassword ? "#FF4D4D" : colors.border,
              backgroundColor: colors.secondary,
            }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Repeat your password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {confirmPassword.length > 0 && (
                <Feather
                  name={password === confirmPassword ? "check-circle" : "x-circle"}
                  size={16}
                  color={password === confirmPassword ? colors.positive : "#FF4D4D"}
                />
              )}
            </View>
          </View>

          {/* Biometric info banner */}
          <View style={[styles.bioBanner, { backgroundColor: colors.accent + "12", borderColor: colors.accent + "30" }]}>
            <Feather name="activity" size={16} color={colors.accent} />
            <Text style={[styles.bioBannerText, { color: colors.accent }]}>
              {Platform.OS === "web"
                ? "On your mobile device, you'll be prompted to scan your Fingerprint or Face ID to secure your account."
                : "After creating your account, you'll be prompted to scan your Fingerprint or Face ID."}
            </Text>
          </View>

          {/* Terms */}
          <Text style={[styles.terms, { color: colors.mutedForeground }]}>
            By creating an account you agree to our{" "}
            <Text style={{ color: colors.accent }}>Terms of Service</Text> and{" "}
            <Text style={{ color: colors.accent }}>Privacy Policy</Text>
          </Text>

          {/* Create Account */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0A0F1E" />
            ) : (
              <>
                <Feather name="user-plus" size={18} color="#0A0F1E" />
                <Text style={styles.primaryBtnText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.footerLink, { color: colors.accent }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  content:    { paddingHorizontal: 24 },
  topRow:     { marginBottom: 20 },
  backBtn:    { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  brand:      { alignItems: "center", marginBottom: 28 },
  logoImage:  { width: 200, height: 80, borderRadius: 12, marginBottom: 6 },
  brandName:  { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline:    { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" },
  card:       { borderRadius: 20, padding: 24, borderWidth: 1, marginBottom: 24 },
  errorBox:   { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  errorText:  { color: "#FF4D4D", fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  fieldGroup: { marginBottom: 16 },
  label:      { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 8, letterSpacing: 0.3 },
  inputRow:   { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  input:      { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  bioBanner:  { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  bioBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  terms:      { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18, marginBottom: 20 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 14 },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0A0F1E" },
  footer:     { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // Overlay
  overlay:     { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  overlayCard: { width: "100%", borderRadius: 24, padding: 32, borderWidth: 1, alignItems: "center", gap: 16 },
  overlayIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  overlayTitle:{ fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  overlayMsg:  { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  dots:        { flexDirection: "row", gap: 20, marginTop: 8 },
  dotRow:      { alignItems: "center", gap: 6 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  dotLabel:    { fontSize: 11, fontFamily: "Inter_500Medium" },
});

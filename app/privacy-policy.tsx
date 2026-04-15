import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us, such as when you create an account, make a transaction, or contact support. This includes:

• Personal identification information (name, email address, phone number, date of birth, national ID/CNIC)
• Financial information (account numbers, transaction history, balance)
• Device information (IP address, device type, operating system, unique device identifiers)
• Location data (with your permission) to detect fraud and verify transactions
• Biometric data (with your explicit consent) used only for device-level authentication`,
  },
  {
    title: "2. How We Use Your Information",
    body: `NEOPAY uses the information we collect to:

• Provide, maintain, and improve our banking services
• Process transactions and send related information
• Verify your identity and prevent fraud
• Send security alerts and account notifications
• Comply with legal obligations under Pakistani financial regulations (SBP guidelines)
• Communicate with you about products, services, and promotions
• Personalise your banking experience`,
  },
  {
    title: "3. Information Sharing",
    body: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:

• With your consent or at your direction
• With service providers who perform services on our behalf (subject to strict confidentiality agreements)
• With regulatory authorities, law enforcement, or government agencies as required by law
• In connection with a merger, acquisition, or sale of all or a portion of our assets (with advance notice)
• To protect the rights, property, or safety of NEOPAY, our users, or the public`,
  },
  {
    title: "4. Data Security",
    body: `We implement industry-standard security measures to protect your personal information:

• AES-256 encryption for data at rest
• TLS 1.3 for all data in transit
• Multi-factor authentication options
• Regular security audits and penetration testing
• Automatic session timeout after inactivity
• Biometric authentication support on compatible devices

No method of transmission over the Internet or electronic storage is 100% secure, however, and we cannot guarantee absolute security.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your personal information for as long as your account is active or as needed to provide you services. We will also retain and use your information as necessary to comply with our legal obligations (typically 7 years under SBP regulations), resolve disputes, and enforce our agreements.

You may request deletion of your account and personal data at any time by contacting support@nexabank.com, subject to applicable legal retention requirements.`,
  },
  {
    title: "6. Your Rights",
    body: `You have the right to:

• Access the personal information we hold about you
• Correct inaccurate or incomplete information
• Request deletion of your personal information (subject to legal obligations)
• Object to or restrict certain processing of your information
• Data portability — receive your data in a machine-readable format
• Withdraw consent at any time where processing is based on consent

To exercise these rights, contact our Data Protection Officer at dpo@nexabank.com.`,
  },
  {
    title: "7. Cookies & Tracking",
    body: `Our mobile application uses local storage and similar technologies to enhance your experience, remember your preferences, and analyse usage patterns. We do not use cross-app advertising trackers.

You can control local storage through your device settings, but disabling it may affect app functionality.`,
  },
  {
    title: "8. Children's Privacy",
    body: `NEOPAY services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided personal information, we will promptly delete it from our systems.`,
  },
  {
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via email at least 30 days before the changes take effect. Your continued use of NEOPAY after the effective date constitutes acceptance of the revised policy.`,
  },
  {
    title: "10. Contact Us",
    body: `If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:

NEOPAY Privacy Team
Email: privacy@nexabank.com
Address: NEOPAY Tower, I.I. Chundrigar Road, Karachi, Pakistan
Phone: +92 21 111 639 262
Hours: Monday–Friday, 9:00 AM – 6:00 PM PKT`,
  },
];

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

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
        <Text style={[styles.title, { color: colors.foreground }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero banner */}
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={[styles.heroIcon, { backgroundColor: "rgba(0,212,170,0.2)" }]}>
          <Feather name="lock" size={28} color="#00D4AA" />
        </View>
        <Text style={styles.heroTitle}>Your Privacy Matters</Text>
        <Text style={styles.heroSub}>
          Protecting your data is at the heart of everything we do.
        </Text>
      </View>

      {/* Meta */}
      <View style={[styles.metaRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { icon: "calendar", text: "Effective: April 1, 2026" },
          { icon: "refresh-cw", text: "Last updated: April 9, 2026" },
        ].map((m) => (
          <View key={m.text} style={styles.metaItem}>
            <Feather name={m.icon as any} size={13} color={colors.accent} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{m.text}</Text>
          </View>
        ))}
      </View>

      {/* Intro */}
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        This Privacy Policy explains how NEOPAY Pvt. Ltd. ("NEOPAY", "we", "us", or "our") collects, uses, shares, and protects your personal information when you use our mobile banking application and related services.
      </Text>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
          <Text style={[styles.sectionBody,  { color: colors.mutedForeground }]}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  hero: {
    borderRadius: 20, padding: 28, alignItems: "center", gap: 8,
    marginBottom: 16, overflow: "hidden", position: "relative",
  },
  heroCircle1: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.04)", top: -40, right: -20 },
  heroCircle2: { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.04)", bottom: -30, left: 20 },
  heroIcon:  { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  heroSub:   { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center" },
  metaRow:   { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16, gap: 12 },
  metaItem:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  metaText:  { fontSize: 12, fontFamily: "Inter_400Regular" },
  intro: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 16 },
  section: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10 },
  sectionBody:  { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
});

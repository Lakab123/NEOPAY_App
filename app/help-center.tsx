import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type FAQ = { q: string; a: string };
type Section = { title: string; icon: string; color: string; items: FAQ[] };

const SECTIONS: Section[] = [
  {
    title: "Account & Security",
    icon: "shield",
    color: "#7B61FF",
    items: [
      {
        q: "How do I reset my password?",
        a: "Go to the Login screen and tap 'Forgot password?'. Enter your registered email address and we will send you a reset link within a few minutes.",
      },
      {
        q: "How do I enable two-factor authentication?",
        a: "Go to Profile → Security → Two-Factor Authentication. You can enable 2FA via an authenticator app (recommended) or SMS verification.",
      },
      {
        q: "What should I do if my account is compromised?",
        a: "Contact us immediately via support@nexabank.com or call +92 21 111 639 262. We will lock your account and guide you through recovery.",
      },
    ],
  },
  {
    title: "Transfers & Payments",
    icon: "send",
    color: "#00D4AA",
    items: [
      {
        q: "What is the daily transfer limit?",
        a: "Standard accounts can transfer up to PKR 500,000 (or equivalent) per day. Premium members have a limit of PKR 2,000,000. Limits reset at midnight PKT.",
      },
      {
        q: "How long does an international transfer take?",
        a: "International transfers typically take 1–3 business days depending on the destination country and correspondent banks.",
      },
      {
        q: "What is a PSID?",
        a: "A Payment System ID (PSID) is a unique identifier assigned to your NEOPAY account. Others can use your PSID to send you money instantly without needing your full account number.",
      },
      {
        q: "Are transfers free?",
        a: "Transfers between NEOPAY accounts are always free. Bank-to-bank transfers may incur a small fee depending on the amount and destination bank.",
      },
    ],
  },
  {
    title: "Cards",
    icon: "credit-card",
    color: "#FF9F43",
    items: [
      {
        q: "How do I freeze or unfreeze my card?",
        a: "Go to the Cards tab, select your card and tap 'Lock'. The card will be instantly frozen. Tap again to unfreeze.",
      },
      {
        q: "How do I report a lost or stolen card?",
        a: "Immediately freeze your card from the Cards tab, then contact support. We will cancel your card and issue a replacement within 3–5 business days.",
      },
      {
        q: "Can I use my NEOPAY card internationally?",
        a: "Yes! Your card is accepted wherever Visa or Mastercard is accepted. Standard foreign transaction fees may apply.",
      },
    ],
  },
  {
    title: "App & Technical",
    icon: "smartphone",
    color: "#54A0FF",
    items: [
      {
        q: "How do I set up biometric login?",
        a: "Go to Profile → Security and enable Biometric Login. On your next login, tap the fingerprint/Face ID button on the login screen.",
      },
      {
        q: "The app is running slowly. What should I do?",
        a: "Try force-closing and reopening the app. If the issue persists, check for updates in your app store or clear the app cache in your device settings.",
      },
    ],
  },
];

export default function HelpCenterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const topPadding    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const query = search.trim().toLowerCase();

  const filtered: Section[] = SECTIONS.map((s) => ({
    ...s,
    items: query
      ? s.items.filter(
          (f) =>
            f.q.toLowerCase().includes(query) ||
            f.a.toLowerCase().includes(query)
        )
      : s.items,
  })).filter((s) => s.items.length > 0);

  const toggle = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((prev) => (prev === key ? null : key));
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
        <Text style={[styles.title, { color: colors.foreground }]}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.accent + "18", borderColor: colors.accent + "30" }]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.accent }]}>
          <Feather name="help-circle" size={28} color="#0A0F1E" />
        </View>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>How can we help?</Text>
        <Text style={[styles.heroSub,   { color: colors.mutedForeground }]}>
          Search for answers or browse by topic below.
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search questions…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* FAQ sections */}
      {filtered.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results for "{search}"</Text>
        </View>
      ) : (
        filtered.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: section.color + "20" }]}>
                <Feather name={section.icon as any} size={14} color={section.color} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
            </View>
            <View style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((faq, idx) => {
                const key = `${section.title}-${idx}`;
                const isOpen = expanded === key;
                return (
                  <View key={key}>
                    <TouchableOpacity
                      style={styles.faqRow}
                      onPress={() => toggle(key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.faqQ, { color: colors.foreground, flex: 1 }]}>{faq.q}</Text>
                      <Feather
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.mutedForeground}
                      />
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                        <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{faq.a}</Text>
                      </View>
                    )}
                    {idx < section.items.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))
      )}

      {/* Contact support */}
      <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.contactTitle, { color: colors.foreground }]}>Still need help?</Text>
        <Text style={[styles.contactSub,   { color: colors.mutedForeground }]}>
          Our support team is available 24/7
        </Text>
        <View style={styles.contactBtns}>
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: colors.accent }]}
            onPress={() => Linking.openURL("mailto:support@nexabank.com")}
          >
            <Feather name="mail" size={16} color="#0A0F1E" />
            <Text style={styles.contactBtnText}>Email Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactBtnOutline, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => Linking.openURL("tel:+922111639262")}
          >
            <Feather name="phone" size={16} color={colors.accent} />
            <Text style={[styles.contactBtnOutlineText, { color: colors.foreground }]}>Call Us</Text>
          </TouchableOpacity>
        </View>
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
  hero: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginBottom: 20 },
  heroIcon:  { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroSub:   { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 24 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyBox:  { alignItems: "center", padding: 40, borderRadius: 16, borderWidth: 1, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  section:      { marginBottom: 20 },
  sectionHeader:{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionIcon:  { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  faqCard:   { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  faqRow:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  faqQ:      { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1 },
  faqA:      { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: 10 },
  divider:   { height: 1, marginLeft: 16 },
  contactCard: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 6, marginTop: 4 },
  contactTitle:{ fontSize: 16, fontFamily: "Inter_700Bold" },
  contactSub:  { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  contactBtns: { flexDirection: "row", gap: 12, width: "100%" },
  contactBtn:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  contactBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0A0F1E" },
  contactBtnOutline: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1 },
  contactBtnOutlineText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

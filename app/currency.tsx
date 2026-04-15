import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";

type Currency = {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  popular?: boolean;
};

const CURRENCIES: Currency[] = [
  { code: "PKR", name: "Pakistani Rupee",   symbol: "₨",  flag: "🇵🇰", popular: true },
  { code: "USD", name: "US Dollar",          symbol: "$",  flag: "🇺🇸", popular: true },
  { code: "EUR", name: "Euro",               symbol: "€",  flag: "🇪🇺", popular: true },
  { code: "GBP", name: "British Pound",      symbol: "£",  flag: "🇬🇧", popular: true },
  { code: "AED", name: "UAE Dirham",         symbol: "د.إ",flag: "🇦🇪", popular: true },
  { code: "SAR", name: "Saudi Riyal",        symbol: "﷼",  flag: "🇸🇦", popular: true },
  { code: "CAD", name: "Canadian Dollar",    symbol: "CA$",flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar",  symbol: "A$", flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen",       symbol: "¥",  flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan",       symbol: "¥",  flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee",       symbol: "₹",  flag: "🇮🇳" },
  { code: "TRY", name: "Turkish Lira",       symbol: "₺",  flag: "🇹🇷" },
  { code: "MYR", name: "Malaysian Ringgit",  symbol: "RM", flag: "🇲🇾" },
  { code: "SGD", name: "Singapore Dollar",   symbol: "S$", flag: "🇸🇬" },
  { code: "CHF", name: "Swiss Franc",        symbol: "Fr", flag: "🇨🇭" },
  { code: "BDT", name: "Bangladeshi Taka",   symbol: "৳",  flag: "🇧🇩" },
  { code: "KWD", name: "Kuwaiti Dinar",      symbol: "KD", flag: "🇰🇼" },
  { code: "QAR", name: "Qatari Riyal",       symbol: "QR", flag: "🇶🇦" },
];

export default function CurrencyScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { currency, setCurrency } = useTheme();
  const [search, setSearch] = useState("");

  const topPadding    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const query    = search.trim().toLowerCase();
  const popular  = CURRENCIES.filter((c) => c.popular);
  const filtered = query
    ? CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(query) ||
          c.name.toLowerCase().includes(query) ||
          c.symbol.toLowerCase().includes(query)
      )
    : CURRENCIES;

  const handleSelect = (code: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCurrency(code);
    setTimeout(() => router.back(), 300);
  };

  const CurrencyRow = ({ c }: { c: Currency }) => {
    const isSelected = currency === c.code;
    return (
      <TouchableOpacity
        style={[
          styles.row,
          isSelected && { backgroundColor: colors.accent + "12" },
        ]}
        onPress={() => handleSelect(c.code)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{c.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.currencyCode, { color: colors.foreground }]}>{c.code}</Text>
          <Text style={[styles.currencyName, { color: colors.mutedForeground }]}>{c.name}</Text>
        </View>
        <Text style={[styles.currencySymbol, { color: colors.mutedForeground }]}>{c.symbol}</Text>
        {isSelected && (
          <View style={[styles.checkCircle, { backgroundColor: colors.accent }]}>
            <Feather name="check" size={12} color="#0A0F1E" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16, paddingBottom: bottomPadding + 40 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Currency</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Selected */}
      {(() => {
        const sel = CURRENCIES.find((c) => c.code === currency);
        return sel ? (
          <View style={[styles.selectedBanner, { backgroundColor: colors.accent + "18", borderColor: colors.accent + "40" }]}>
            <Text style={styles.selectedFlag}>{sel.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.selectedLabel, { color: colors.mutedForeground }]}>Currently selected</Text>
              <Text style={[styles.selectedValue, { color: colors.foreground }]}>{sel.code} — {sel.name}</Text>
            </View>
            <Text style={[styles.selectedSymbol, { color: colors.accent }]}>{sel.symbol}</Text>
          </View>
        ) : null;
      })()}

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search currency…"
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

      {/* Popular (only shown when not searching) */}
      {!query && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>POPULAR</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {popular.map((c, idx) => (
              <View key={c.code}>
                <CurrencyRow c={c} />
                {idx < popular.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ALL CURRENCIES</Text>
        </>
      )}

      {/* Full list */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {filtered.map((c, idx) => (
          <View key={c.code}>
            <CurrencyRow c={c} />
            {idx < filtered.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results for "{search}"</Text>
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
  selectedBanner: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  selectedFlag:   { fontSize: 32 },
  selectedLabel:  { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  selectedValue:  { fontSize: 15, fontFamily: "Inter_700Bold" },
  selectedSymbol: { fontSize: 22, fontFamily: "Inter_700Bold" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
  row:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  flag:           { fontSize: 28 },
  currencyCode:   { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  currencyName:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  currencySymbol: { fontSize: 16, fontFamily: "Inter_600SemiBold", minWidth: 30, textAlign: "right" },
  checkCircle:    { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  divider: { height: 1, marginLeft: 68 },
  emptyBox:  { alignItems: "center", paddingVertical: 32 },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});

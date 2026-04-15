import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TransactionItem } from "@/components/TransactionItem";
import { Transaction, TRANSACTIONS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const FILTERS = ["All", "Income", "Expenses", "Transfer"];

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const filtered = TRANSACTIONS.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === "Income") return t.amount > 0;
    if (activeFilter === "Expenses") return t.amount < 0 && t.category !== "transfer";
    if (activeFilter === "Transfer") return t.category === "transfer";
    return true;
  });

  const totalIncome = TRANSACTIONS.filter((t) => t.amount > 0).reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const totalExpenses = TRANSACTIONS.filter((t) => t.amount < 0).reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Transactions</Text>
        <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Feather name="sliders" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: "#00C89615" }]}>
          <Feather name="arrow-down-left" size={18} color="#00C896" />
          <View>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Income</Text>
            <Text style={[styles.summaryValue, { color: "#00C896" }]}>
              +${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#FF4D4D15" }]}>
          <Feather name="arrow-up-right" size={18} color="#FF4D4D" />
          <View>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: "#FF4D4D" }]}>
              -${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search transactions"
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

      {/* Filters */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              setActiveFilter(f);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.filterBtn,
              {
                backgroundColor:
                  activeFilter === f ? colors.accent : colors.card,
                borderColor: activeFilter === f ? colors.accent : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === f ? "#0A0F1E" : colors.mutedForeground },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPadding + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No transactions found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
  },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  summaryValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 20 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});

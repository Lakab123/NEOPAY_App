import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BankCard } from "@/components/BankCard";
import { CARDS } from "@/constants/data";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const SPENDING_CATEGORIES = [
  { label: "Shopping", percent: 35, color: "#7B61FF", amount: "$430.40" },
  { label: "Food", percent: 25, color: "#FF9F43", amount: "$307.44" },
  { label: "Transport", percent: 15, color: "#54A0FF", amount: "$184.46" },
  { label: "Health", percent: 10, color: "#00C896", amount: "$122.98" },
  { label: "Other", percent: 15, color: "#FF6B9D", amount: "$184.46" },
];

export default function CardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState(0);
  const [showNumber, setShowNumber] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const card = CARDS[selectedCard];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16, paddingBottom: bottomPadding + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Cards</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Feather name="plus" size={18} color="#0A0F1E" />
        </TouchableOpacity>
      </View>

      {/* Cards Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardScroll}
        snapToInterval={336}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / 336);
          setSelectedCard(Math.min(index, CARDS.length - 1));
        }}
      >
        {CARDS.map((c, i) => (
          <BankCard key={c.id} card={{ ...c, holder: user?.name ?? c.holder }} />
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {CARDS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === selectedCard ? colors.accent : colors.border },
              i === selectedCard && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Card Details */}
      <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Card Number</Text>
            <View style={styles.numberRow}>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                {showNumber ? `4821 5947 3302 ${card.lastFour}` : `•••• •••• •••• ${card.lastFour}`}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowNumber(!showNumber);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Feather
                  name={showNumber ? "eye-off" : "eye"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Type</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Expires</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{card.expiry}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Status</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.positive }]} />
              <Text style={[styles.detailValue, { color: colors.positive }]}>Active</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Card Actions */}
      <View style={styles.actionRow}>
        {[
          { icon: "lock", label: "Lock", color: "#FF4D4D" },
          { icon: "credit-card", label: "Limits", color: "#7B61FF" },
          { icon: "settings", label: "Settings", color: "#54A0FF" },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.cardAction, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name={action.icon as any} size={20} color={action.color} />
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spending Breakdown */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Spending Breakdown</Text>
        <View style={[styles.spendingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Bar */}
          <View style={styles.barContainer}>
            {SPENDING_CATEGORIES.map((cat) => (
              <View
                key={cat.label}
                style={[
                  styles.barSegment,
                  { backgroundColor: cat.color, flex: cat.percent },
                ]}
              />
            ))}
          </View>

          {/* Legend */}
          {SPENDING_CATEGORIES.map((cat) => (
            <View key={cat.label} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.legendLabel, { color: colors.foreground }]}>{cat.label}</Text>
              </View>
              <View style={styles.legendRight}>
                <Text style={[styles.legendAmount, { color: colors.foreground }]}>{cat.amount}</Text>
                <Text style={[styles.legendPercent, { color: colors.mutedForeground }]}>
                  {cat.percent}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardScroll: { paddingRight: 20 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14, marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 20 },
  detailsCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  detailRow: { marginBottom: 12 },
  detailGrid: { flexDirection: "row", justifyContent: "space-between" },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  numberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginVertical: 14 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  cardAction: { flex: 1, borderRadius: 14, padding: 16, alignItems: "center", gap: 8, borderWidth: 1 },
  actionLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 14 },
  spendingCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  barContainer: { flexDirection: "row", borderRadius: 8, overflow: "hidden", height: 10, marginBottom: 16 },
  barSegment: {},
  legendRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  legendLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  legendRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendAmount: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  legendPercent: { fontSize: 12, fontFamily: "Inter_400Regular", width: 36, textAlign: "right" },
});

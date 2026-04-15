import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Transaction } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

type Props = {
  transaction: Transaction;
  onPress?: () => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  shopping: "#7B61FF",
  food: "#FF9F43",
  transport: "#54A0FF",
  health: "#00C896",
  entertainment: "#FF6B9D",
  transfer: "#00D4AA",
  income: "#00C896",
};

export function TransactionItem({ transaction, onPress }: Props) {
  const colors = useColors();
  const isPositive = transaction.amount > 0;
  const iconColor = CATEGORY_COLORS[transaction.category] || colors.accent;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}18` }]}>
        <Feather name={transaction.icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]}>{transaction.title}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{transaction.date}</Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: isPositive ? colors.positive : colors.foreground },
        ]}
      >
        {isPositive ? "+" : ""}
        {transaction.amount.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  amount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});

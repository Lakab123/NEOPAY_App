import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
};

export function QuickAction({ icon, label, color, onPress }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});

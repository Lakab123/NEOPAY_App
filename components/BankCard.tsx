import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Card } from "@/constants/data";

type Props = {
  card: Card;
  style?: object;
};

export function BankCard({ card, style }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animStyle, style]}>
      <View style={[styles.card, { backgroundColor: card.color[0] }]}>
        {/* Background circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        {/* Top row */}
        <View style={styles.topRow}>
          <Image
            source={require("@/assets/images/logo.jpg")}
            style={styles.cardLogo}
            resizeMode="contain"
          />
          <View style={styles.chipContainer}>
            <View style={styles.chip} />
          </View>
        </View>

        {/* Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balance}>
            ${card.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.cardLabel}>CARD HOLDER</Text>
            <Text style={styles.cardValue}>{card.holder}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>EXPIRES</Text>
            <Text style={styles.cardValue}>{card.expiry}</Text>
          </View>
          <View style={styles.networkContainer}>
            {card.type === "visa" ? (
              <Text style={styles.visaText}>VISA</Text>
            ) : (
              <View style={styles.mcContainer}>
                <View style={[styles.mcCircle, { backgroundColor: "#EB001B", opacity: 0.9 }]} />
                <View style={[styles.mcCircle, { backgroundColor: "#F79E1B", marginLeft: -14 }]} />
              </View>
            )}
          </View>
        </View>

        {/* Card number */}
        <Text style={styles.cardNumber}>•••• •••• •••• {card.lastFour}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    marginRight: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    height: 190,
    overflow: "hidden",
    position: "relative",
    justifyContent: "space-between",
  },
  circle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -60,
    right: -40,
  },
  circle2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -30,
    left: 40,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLogo: {
    width: 90,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  chipContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: "rgba(255, 215, 0, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  balanceSection: {
    flex: 1,
    justifyContent: "center",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  networkContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  visaText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    fontStyle: "italic",
    letterSpacing: 2,
  },
  mcContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mcCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  cardNumber: {
    position: "absolute",
    bottom: 54,
    left: 24,
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 2,
  },
});

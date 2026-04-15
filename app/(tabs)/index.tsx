import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BankCard } from "@/components/BankCard";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { QuickAction } from "@/components/QuickAction";
import { TransactionItem } from "@/components/TransactionItem";
import { CARDS, TRANSACTIONS } from "@/constants/data";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useWallet } from "@/contexts/WalletContext";
import { useColors } from "@/hooks/useColors";

const DEMO_PAYMENTS = [
  { sender: "Ahmed Khan",  amount: 1250.00, label: "$1,250.00", note: "Monthly rent share"   },
  { sender: "Zara Malik",  amount:  380.00, label: "$380.00",   note: "Freelance invoice #4" },
  { sender: "Omar Farooq", amount:   75.00, label: "$75.00",    note: "Dinner split"          },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { totalBalance, addAmount } = useWallet();
  const { unreadCount, addNotification } = useNotifications();

  const [panelOpen, setPanelOpen] = useState(false);
  const demoFired   = useRef(false);

  // Animate balance when it changes
  const animBalance = useRef(new Animated.Value(totalBalance)).current;
  const prevBalance = useRef(totalBalance);

  useEffect(() => {
    if (prevBalance.current !== totalBalance) {
      Animated.timing(animBalance, {
        toValue:         totalBalance,
        duration:        600,
        useNativeDriver: false,
      }).start();
      prevBalance.current = totalBalance;
    }
  }, [totalBalance]);

  const topPadding    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  // Simulate incoming payment after login
  useEffect(() => {
    if (demoFired.current) return;
    demoFired.current = true;

    const demo  = DEMO_PAYMENTS[Math.floor(Math.random() * DEMO_PAYMENTS.length)];
    const delay = Platform.OS === "web" ? 2500 : 3000;

    const timer = setTimeout(() => {
      addAmount(demo.amount);
      addNotification(
        "payment_received",
        "Payment Received",
        `${demo.sender} sent you ${demo.label}${demo.note ? ` · "${demo.note}"` : ""}`,
        demo.label
      );
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const handleQuickAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action === "transfer")     router.push("/transfer");
    if (action === "transactions") router.push("/transactions");
  };

  const recentTransactions = TRANSACTIONS.slice(0, 5);

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 16, paddingBottom: bottomPadding + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header (no logo) ── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>{user?.name ?? "Welcome"}</Text>
          </View>

          {/* Bell with unread badge */}
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPanelOpen(true); }}
          >
            <Feather name="bell" size={20} color={colors.foreground} />
            {unreadCount > 0 ? (
              <View style={[styles.badgeWrap, { backgroundColor: "#FF4D4D" }]}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            ) : (
              <View style={[styles.notifDot, { backgroundColor: colors.accent }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Total Balance (live, updates on transfer) ── */}
        <View style={[styles.balanceSummary, { backgroundColor: colors.accent }]}>
          <View>
            <Text style={styles.totalLabel}>Total Balance</Text>
            <Animated.Text style={styles.totalBalance}>
              {/* JS-driven interpolation for smooth number update */}
              {"$" + totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Animated.Text>
          </View>
          <View style={styles.changeContainer}>
            <Feather name="trending-up" size={14} color="#0A0F1E" />
            <Text style={styles.changeText}> +2.4%</Text>
          </View>
        </View>

        {/* ── Cards ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Cards</Text>
            <TouchableOpacity onPress={() => router.push("/cards")}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CARDS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BankCard card={{ ...item, holder: user?.name ?? item.holder }} />}
            contentContainerStyle={styles.cardList}
            scrollEnabled={CARDS.length > 1}
          />
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={[styles.quickActions, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <QuickAction icon="send"        label="Transfer"  color="#7B61FF" onPress={() => handleQuickAction("transfer")} />
            <QuickAction icon="download"    label="Receive"   color="#00C896" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
            <QuickAction icon="credit-card" label="Pay"       color="#FF9F43" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
            <QuickAction icon="bar-chart-2" label="Analytics" color="#54A0FF" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
          </View>
        </View>

        {/* ── Recent Transactions ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push("/transactions")}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((txn) => (
            <TransactionItem key={txn.id} transaction={txn} />
          ))}
        </View>
      </ScrollView>

      <NotificationsPanel visible={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { paddingHorizontal: 20 },

  header: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   20,
  },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 4 },
  name:     { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },

  notifBtn: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  notifDot: {
    position: "absolute", width: 8, height: 8, borderRadius: 4,
    top: 10, right: 10,
  },
  badgeWrap: {
    position: "absolute", top: 6, right: 6,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontFamily: "Inter_700Bold", lineHeight: 12 },

  balanceSummary: {
    borderRadius: 16, padding: 22,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 24,
  },
  totalLabel: {
    color: "rgba(10,15,30,0.65)", fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
    textTransform: "uppercase", letterSpacing: 0.9,
  },
  totalBalance: {
    color: "#0A0F1E", fontSize: 32,
    fontFamily: "Inter_700Bold", letterSpacing: -1.2,
  },
  changeContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(10,15,30,0.1)",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  changeText: { color: "#0A0F1E", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  section:       { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle:  { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 14 },
  seeAll:        { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  cardList:      { paddingRight: 20 },
  quickActions:  {
    flexDirection: "row", justifyContent: "space-around",
    padding: 20, borderRadius: 16, borderWidth: 1,
  },
});

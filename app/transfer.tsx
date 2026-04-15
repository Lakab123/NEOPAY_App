import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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
import { useNotifications } from "@/contexts/NotificationContext";
import { useWallet } from "@/contexts/WalletContext";

type Recipient = {
  id: string;
  name: string;
  initials: string;
  color: string;
  phone?: string;
  psid?: string;
};

const PRESET_CONTACTS: Recipient[] = [
  { id: "1", name: "Sarah",  initials: "S",  color: "#FF6B9D", phone: "+1 555 0101", psid: "PSID-SARAH" },
  { id: "2", name: "James",  initials: "J",  color: "#00D4AA", phone: "+1 555 0102", psid: "PSID-JAMES" },
  { id: "3", name: "Emma",   initials: "E",  color: "#7B61FF", phone: "+1 555 0103", psid: "PSID-EMMA"  },
  { id: "4", name: "Mike",   initials: "M",  color: "#FF9F43", phone: "+1 555 0104", psid: "PSID-MIKE"  },
  { id: "5", name: "Lisa",   initials: "L",  color: "#54A0FF", phone: "+1 555 0105", psid: "PSID-LISA"  },
];

const AVATAR_COLORS = [
  "#FF6B9D", "#00D4AA", "#7B61FF",
  "#FF9F43", "#54A0FF", "#FF4D4D", "#00C896",
];
const AMOUNTS = ["50", "100", "250", "500"];

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function TransferScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addNotification } = useNotifications();
  const { deductAmount } = useWallet();

  const [contacts, setContacts] = useState<Recipient[]>(PRESET_CONTACTS);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [amount, setAmount]             = useState("");
  const [note, setNote]                 = useState("");
  const [sent, setSent]                 = useState(false);
  const [search, setSearch]             = useState("");
  const [showNewForm, setShowNewForm]   = useState(false);

  // New-recipient form state
  const [newName,  setNewName]  = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPsid,  setNewPsid]  = useState("");
  const [formError, setFormError] = useState("");

  const topPadding    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  // ── Search filter ──────────────────────────────────────────────
  const query = search.trim().toLowerCase();
  const filtered = query
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.phone && c.phone.toLowerCase().includes(query)) ||
          (c.psid  && c.psid.toLowerCase().includes(query))
      )
    : contacts;

  const selected = contacts.find((c) => c.id === selectedId);

  // ── Add new recipient ──────────────────────────────────────────
  const handleAddRecipient = () => {
    if (!newName.trim()) { setFormError("Name is required"); return; }
    if (!newPhone.trim() && !newPsid.trim()) {
      setFormError("Provide a phone number or PSID");
      return;
    }
    const color = AVATAR_COLORS[contacts.length % AVATAR_COLORS.length];
    const newContact: Recipient = {
      id: Date.now().toString(),
      name: newName.trim(),
      initials: getInitials(newName),
      color,
      phone: newPhone.trim() || undefined,
      psid:  newPsid.trim()  || undefined,
    };
    setContacts((prev) => [...prev, newContact]);
    setSelectedId(newContact.id);
    setNewName(""); setNewPhone(""); setNewPsid(""); setFormError("");
    setShowNewForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const resetForm = () => {
    setNewName(""); setNewPhone(""); setNewPsid(""); setFormError("");
    setShowNewForm(false);
  };

  // ── Send ───────────────────────────────────────────────────────
  const handleSend = () => {
    if (!selectedId || !amount) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSent(true);

    // Deduct from wallet balance — updates home screen immediately
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount)) deductAmount(numericAmount);

    // Fire transfer notification — will show as a toast banner
    addNotification(
      "transfer_sent",
      "Transfer Successful",
      `$${amount} sent to ${selected?.name ?? "recipient"}${note ? ` · "${note}"` : ""}`,
      `-$${amount}`
    );

    setTimeout(() => { setSent(false); router.back(); }, 2200);
  };

  // ── Success screen ─────────────────────────────────────────────
  if (sent) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.successRing, { borderColor: colors.accent }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.accent }]}>
            <Feather name="check" size={40} color="#0A0F1E" />
          </View>
        </View>
        <Text style={[styles.successTitle,    { color: colors.foreground }]}>Transfer Sent!</Text>
        <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
          ${amount} sent to {selected?.name}
        </Text>
      </View>
    );
  }

  // ── Main screen ────────────────────────────────────────────────
  return (
    <>
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
          <Text style={[styles.title, { color: colors.foreground }]}>Send Money</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name, phone or PSID…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Recipient section header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.label, { color: colors.foreground }]}>Select Recipient</Text>
          <TouchableOpacity
            style={[styles.newBtn, { backgroundColor: colors.accent + "18", borderColor: colors.accent + "40" }]}
            onPress={() => { setShowNewForm(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Feather name="user-plus" size={13} color={colors.accent} />
            <Text style={[styles.newBtnText, { color: colors.accent }]}>New Recipient</Text>
          </TouchableOpacity>
        </View>

        {/* Contact list */}
        {filtered.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="users" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No recipients found</Text>
            <TouchableOpacity onPress={() => { setNewName(search); setShowNewForm(true); }}>
              <Text style={[styles.emptyAction, { color: colors.accent }]}>+ Add "{search}"</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.contactList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {filtered.map((c, idx) => {
              const isSelected = selectedId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.contactRow,
                    idx < filtered.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    isSelected && { backgroundColor: colors.accent + "12" },
                  ]}
                  onPress={() => {
                    setSelectedId(c.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={[styles.avatarCircle, { backgroundColor: c.color + "22" }]}>
                    <Text style={[styles.avatarText, { color: c.color }]}>{c.initials}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: colors.foreground }]}>{c.name}</Text>
                    <Text style={[styles.contactSub, { color: colors.mutedForeground }]}>
                      {c.phone ? c.phone : c.psid ?? ""}
                    </Text>
                  </View>
                  {c.psid && (
                    <View style={[styles.psidBadge, { backgroundColor: colors.accent + "18" }]}>
                      <Text style={[styles.psidText, { color: colors.accent }]}>{c.psid}</Text>
                    </View>
                  )}
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: colors.accent }]}>
                      <Feather name="check" size={12} color="#0A0F1E" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Amount */}
        <Text style={[styles.label, { color: colors.foreground, marginTop: 24 }]}>Amount</Text>
        <View style={[styles.amountContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.currency, { color: colors.mutedForeground }]}>$</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.foreground }]}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Quick amounts */}
        <View style={styles.quickAmounts}>
          {AMOUNTS.map((a) => (
            <TouchableOpacity
              key={a}
              style={[
                styles.quickAmount,
                {
                  backgroundColor: amount === a ? colors.accent : colors.card,
                  borderColor:     amount === a ? colors.accent : colors.border,
                },
              ]}
              onPress={() => { setAmount(a); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={[styles.quickAmountText, { color: amount === a ? "#0A0F1E" : colors.foreground }]}>
                ${a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text style={[styles.label, { color: colors.foreground }]}>Note (optional)</Text>
        <TextInput
          style={[styles.noteInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="What's this for?"
          placeholderTextColor={colors.mutedForeground}
          value={note}
          onChangeText={setNote}
          multiline
        />

        {/* Summary */}
        {selected && amount ? (
          <View style={[styles.summary, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            {[
              { label: "Sending to", value: selected.name },
              { label: "Amount",     value: `$${amount}` },
              { label: "Fee",        value: "Free", accent: true },
            ].map((row) => (
              <View key={row.label} style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.summaryValue, { color: row.accent ? colors.positive : colors.foreground }]}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Send button */}
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: selected && amount ? colors.accent : colors.muted }]}
          onPress={handleSend}
          disabled={!selected || !amount}
        >
          <Feather name="send" size={18} color={selected && amount ? "#0A0F1E" : colors.mutedForeground} />
          <Text style={[styles.sendText, { color: selected && amount ? "#0A0F1E" : colors.mutedForeground }]}>
            Send Money
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── New Recipient Modal ───────────────────────────────────── */}
      <Modal
        visible={showNewForm}
        animationType="slide"
        transparent
        onRequestClose={resetForm}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={resetForm} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalWrapper}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Drag handle */}
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            {/* Title row */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Recipient</Text>
              <TouchableOpacity onPress={resetForm}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Full name */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Full Name *</Text>
            <View style={[styles.fieldBox, { backgroundColor: colors.background, borderColor: formError && !newName.trim() ? "#FF4D4D" : colors.border }]}>
              <Feather name="user" size={16} color={colors.mutedForeground} style={styles.fieldIcon} />
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                placeholder="e.g. John Smith"
                placeholderTextColor={colors.mutedForeground}
                value={newName}
                onChangeText={(v) => { setNewName(v); setFormError(""); }}
                returnKeyType="next"
              />
            </View>

            {/* Phone */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone Number</Text>
            <View style={[styles.fieldBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="phone" size={16} color={colors.mutedForeground} style={styles.fieldIcon} />
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                placeholder="+1 555 0100"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={(v) => { setNewPhone(v); setFormError(""); }}
                returnKeyType="next"
              />
            </View>

            {/* Divider */}
            <View style={styles.orRow}>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.mutedForeground }]}>OR</Text>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            </View>

            {/* PSID */}
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>PSID / Payment ID</Text>
            <View style={[styles.fieldBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="hash" size={16} color={colors.mutedForeground} style={styles.fieldIcon} />
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                placeholder="e.g. PSID-JOHN123"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                value={newPsid}
                onChangeText={(v) => { setNewPsid(v); setFormError(""); }}
                returnKeyType="done"
                onSubmitEditing={handleAddRecipient}
              />
            </View>

            {/* Error */}
            {formError ? (
              <Text style={styles.errorText}>{formError}</Text>
            ) : null}

            {/* Add button */}
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.accent }]}
              onPress={handleAddRecipient}
            >
              <Feather name="user-check" size={18} color="#0A0F1E" />
              <Text style={styles.addBtnText}>Add Recipient</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { paddingHorizontal: 20 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title:   { fontSize: 18, fontFamily: "Inter_700Bold" },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  label:        { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  newBtn:       { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  newBtnText:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  emptyBox:   { alignItems: "center", padding: 32, borderRadius: 16, borderWidth: 1, gap: 8, marginBottom: 8 },
  emptyText:  { fontSize: 14, fontFamily: "Inter_500Medium" },
  emptyAction:{ fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 4 },

  contactList:  { borderRadius: 16, borderWidth: 1, marginBottom: 4, overflow: "hidden" },
  contactRow:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText:   { fontSize: 16, fontFamily: "Inter_700Bold" },
  contactInfo:  { flex: 1 },
  contactName:  { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  contactSub:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  psidBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  psidText:     { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  checkCircle:  { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },

  amountContainer: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 14 },
  currency:        { fontSize: 28, fontFamily: "Inter_400Regular", marginRight: 6 },
  amountInput:     { flex: 1, fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: -1 },

  quickAmounts:   { flexDirection: "row", gap: 10, marginBottom: 24 },
  quickAmount:    { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  quickAmountText:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },

  noteInput: { borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80, textAlignVertical: "top", marginBottom: 20 },

  summary:      { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 24, gap: 10 },
  summaryRow:   { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  sendBtn:  { borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  sendText: { fontSize: 16, fontFamily: "Inter_700Bold" },

  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  successRing:      { width: 120, height: 120, borderRadius: 60, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  successIcon:      { width: 90,  height: 90,  borderRadius: 45, alignItems: "center", justifyContent: "center" },
  successTitle:     { fontSize: 24, fontFamily: "Inter_700Bold" },
  successSubtitle:  { fontSize: 16, fontFamily: "Inter_400Regular" },

  // Modal
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000060" },
  modalWrapper: { position: "absolute", bottom: 0, left: 0, right: 0 },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 40,
    gap: 0,
  },
  handle:      { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle:  { fontSize: 18, fontFamily: "Inter_700Bold" },

  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  fieldBox:   { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 16 },
  fieldIcon:  { marginRight: 10 },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },

  orRow:  { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  errorText: { color: "#FF4D4D", fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12, marginTop: -8 },

  addBtn:     { borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8 },
  addBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0A0F1E" },
});

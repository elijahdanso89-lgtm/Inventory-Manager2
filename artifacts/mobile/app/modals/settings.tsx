import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { CURRENCY_SYMBOLS, Currency, useApp } from "@/context/AppContext";

const CURRENCIES: Currency[] = ["GHS", "USD", "EUR", "GBP"];

export default function SettingsModal() {
  const insets = useSafeAreaInsets();
  const { currency, setCurrency, clearAllData, products, sales } = useApp();

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      `This will permanently delete all ${products.length} products and ${sales.length} sale records. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={[styles.handle, { marginTop: insets.top > 0 ? insets.top : 16 }]} />
      <View style={styles.modalHeader}>
        <View style={{ width: 60 }} />
        <Text style={styles.modalTitle}>Settings</Text>
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      >
        <View style={styles.appBrand}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>Inventoria</Text>
          <Text style={styles.brandVersion}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <Text style={styles.sectionSubtitle}>Choose your preferred currency for display</Text>
          <View style={styles.currencyGrid}>
            {CURRENCIES.map((c) => (
              <Pressable
                key={c}
                style={[styles.currencyChip, currency === c && styles.currencyChipActive]}
                onPress={() => setCurrency(c)}
              >
                <Text style={[styles.currencySymbol, currency === c && styles.currencySymbolActive]}>
                  {CURRENCY_SYMBOLS[c]}
                </Text>
                <Text style={[styles.currencyCode, currency === c && styles.currencyCodeActive]}>
                  {c}
                </Text>
                {currency === c && (
                  <Feather name="check" size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{sales.length}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {products.filter((p) => p.stock <= 5).length}
              </Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutRow}>
            <Feather name="code" size={16} color={Colors.gray[500]} />
            <Text style={styles.aboutText}>Built by Elijah Danso</Text>
          </View>
          <View style={styles.aboutRow}>
            <Feather name="shield" size={16} color={Colors.gray[500]} />
            <Text style={styles.aboutText}>All data stored locally on your device</Text>
          </View>
        </View>

        <View style={styles.dangerSection}>
          <Text style={[styles.sectionTitle, { color: Colors.red }]}>Danger Zone</Text>
          <Pressable
            style={({ pressed }) => [styles.clearBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleClearData}
          >
            <Feather name="trash-2" size={16} color={Colors.red} />
            <Text style={styles.clearBtnText}>Clear All Data</Text>
          </Pressable>
          <Text style={styles.clearBtnSub}>
            Permanently deletes all products, sales, and achievements
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray[300],
    alignSelf: "center",
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  doneBtn: { padding: 4 },
  doneText: { fontSize: 16, color: Colors.primary, fontFamily: "Inter_700Bold" },
  content: {
    padding: 20,
  },
  appBrand: {
    alignItems: "center",
    marginBottom: 28,
    paddingVertical: 16,
  },
  brandLogo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  brandVersion: {
    fontSize: 13,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  section: {
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  currencyGrid: {
    flexDirection: "row",
    gap: 10,
  },
  currencyChip: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  currencyChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.gray[700],
  },
  currencySymbolActive: {
    color: Colors.white,
  },
  currencyCode: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.gray[500],
  },
  currencyCodeActive: {
    color: "rgba(255,255,255,0.8)",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  statNum: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: "Inter_400Regular",
  },
  dangerSection: {
    backgroundColor: Colors.redLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 16,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.red,
    marginTop: 8,
  },
  clearBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.red,
  },
  clearBtnSub: {
    fontSize: 12,
    color: Colors.red,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    opacity: 0.7,
  },
});

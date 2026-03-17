import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { Sale, useApp } from "@/context/AppContext";

function SaleCard({
  sale,
  formatCurrency,
  onDelete,
}: {
  sale: Sale;
  formatCurrency: (n: number) => string;
  onDelete: () => void;
}) {
  const date = new Date(sale.soldAt);
  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <View style={styles.saleCard}>
      <View style={styles.saleHeader}>
        <View style={styles.saleIcon}>
          <Feather name="shopping-bag" size={16} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.saleName} numberOfLines={1}>{sale.productName}</Text>
          <Text style={styles.saleDate}>{dateStr} · {timeStr}</Text>
        </View>
        <Pressable onPress={onDelete} style={styles.deleteBtn}>
          <Feather name="trash-2" size={15} color={Colors.gray[400]} />
        </Pressable>
      </View>
      <View style={styles.saleDetails}>
        <View style={styles.saleDetailCol}>
          <Text style={styles.detailLabel}>Qty</Text>
          <Text style={styles.detailValue}>{sale.quantity}</Text>
        </View>
        <View style={styles.saleDetailCol}>
          <Text style={styles.detailLabel}>Revenue</Text>
          <Text style={[styles.detailValue, { color: Colors.primary }]}>
            {formatCurrency(sale.revenue)}
          </Text>
        </View>
        <View style={styles.saleDetailCol}>
          <Text style={styles.detailLabel}>Profit</Text>
          <Text style={[styles.detailValue, { color: Colors.green }]}>
            {formatCurrency(sale.profit)}
          </Text>
        </View>
        {sale.discount > 0 && (
          <View style={styles.saleDetailCol}>
            <Text style={styles.detailLabel}>Discount</Text>
            <Text style={[styles.detailValue, { color: Colors.red }]}>
              -{formatCurrency(sale.discount)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function SalesScreen() {
  const insets = useSafeAreaInsets();
  const { sales, deleteSale, formatCurrency, getTotalRevenue, getTotalProfit, getTodayRevenue } = useApp();

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomInset = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const handleDelete = (sale: Sale) => {
    Alert.alert(
      "Delete Sale",
      "Remove this sale record? This won't restore the stock.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteSale(sale.id) },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <Text style={styles.title}>Sales</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/modals/record-sale")}
        >
          <Feather name="plus" size={20} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
          <Text style={[styles.summaryValue, { color: Colors.primary }]} numberOfLines={1}>
            {formatCurrency(getTotalRevenue())}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Profit</Text>
          <Text style={[styles.summaryValue, { color: Colors.green }]} numberOfLines={1}>
            {formatCurrency(getTotalProfit())}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today</Text>
          <Text style={[styles.summaryValue, { color: Colors.amber }]} numberOfLines={1}>
            {formatCurrency(getTodayRevenue())}
          </Text>
        </View>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomInset + 100 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!sales.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="shopping-cart" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>No sales recorded</Text>
            <Text style={styles.emptyText}>Record your first sale to start tracking revenue and profits</Text>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => router.push("/modals/record-sale")}
            >
              <Feather name="plus" size={16} color={Colors.white} />
              <Text style={styles.emptyBtnText}>Record Sale</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <SaleCard
            sale={item}
            formatCurrency={formatCurrency}
            onDelete={() => handleDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <Pressable
        style={[styles.fab, { bottom: bottomInset + 100 }]}
        onPress={() => router.push("/modals/record-sale")}
      >
        <Feather name="plus" size={24} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  saleCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  saleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  saleIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  saleName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text.primary,
  },
  saleDate: {
    fontSize: 12,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  saleDetails: {
    flexDirection: "row",
    backgroundColor: Colors.gray[50],
    borderRadius: 10,
    padding: 10,
    gap: 0,
  },
  saleDetailCol: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.gray[600],
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    maxWidth: 260,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 4,
  },
  emptyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});

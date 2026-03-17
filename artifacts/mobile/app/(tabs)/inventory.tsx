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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { Product, useApp } from "@/context/AppContext";

type Filter = "all" | "low" | "out";

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <View style={[styles.badge, { backgroundColor: Colors.redLight }]}>
        <Text style={[styles.badgeText, { color: Colors.red }]}>Out of Stock</Text>
      </View>
    );
  if (stock <= 5)
    return (
      <View style={[styles.badge, { backgroundColor: Colors.amberLight }]}>
        <Text style={[styles.badgeText, { color: Colors.amberDark }]}>Low Stock</Text>
      </View>
    );
  return (
    <View style={[styles.badge, { backgroundColor: Colors.greenLight }]}>
      <Text style={[styles.badgeText, { color: Colors.green }]}>In Stock</Text>
    </View>
  );
}

function ProductCard({ product, onQuickAdd, onEdit, onDelete, formatCurrency }: {
  product: Product;
  onQuickAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatCurrency: (n: number) => string;
}) {
  const margin = product.sellingPrice - product.costPrice;
  const marginPct = product.costPrice > 0 ? ((margin / product.costPrice) * 100).toFixed(0) : "0";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          {product.category ? (
            <Text style={styles.categoryTag}>{product.category}</Text>
          ) : null}
        </View>
        <StockBadge stock={product.stock} />
      </View>

      <View style={styles.cardPrices}>
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>Cost</Text>
          <Text style={styles.priceValue}>{formatCurrency(product.costPrice)}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={[styles.priceValue, { color: Colors.primary }]}>
            {formatCurrency(product.sellingPrice)}
          </Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>Margin</Text>
          <Text style={[styles.priceValue, { color: Colors.green }]}>{marginPct}%</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>Stock</Text>
          <Text style={[styles.priceValue, product.stock === 0 && { color: Colors.red }]}>
            {product.stock}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable style={styles.actionBtn} onPress={onQuickAdd}>
          <Feather name="plus-circle" size={14} color={Colors.amber} />
          <Text style={[styles.actionText, { color: Colors.amber }]}>Quick Add</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={onEdit}>
          <Feather name="edit-2" size={14} color={Colors.primary} />
          <Text style={[styles.actionText, { color: Colors.primary }]}>Edit</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={onDelete}>
          <Feather name="trash-2" size={14} color={Colors.red} />
          <Text style={[styles.actionText, { color: Colors.red }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { products, deleteProduct, formatCurrency } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomInset = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "low") return p.stock > 0 && p.stock <= 5;
    if (filter === "out") return p.stock === 0;
    return true;
  });

  const handleDelete = (p: Product) => {
    Alert.alert(
      "Delete Product",
      `Delete "${p.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Product Only",
          onPress: () => deleteProduct(p.id, false),
        },
        {
          text: "Delete + Sales History",
          style: "destructive",
          onPress: () => deleteProduct(p.id, true),
        },
      ]
    );
  };

  const filterTabs: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${products.length})` },
    { key: "low", label: "Low Stock" },
    { key: "out", label: "Out of Stock" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <Text style={styles.title}>Inventory</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/modals/add-product")}
        >
          <Feather name="plus" size={20} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={Colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.gray[400]}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Feather name="x" size={16} color={Colors.gray[400]} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        {filterTabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.filterText, filter === tab.key && styles.filterTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomInset + 100 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="package" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>
              {products.length === 0 ? "No products yet" : "No matches found"}
            </Text>
            <Text style={styles.emptyText}>
              {products.length === 0
                ? "Tap the + button to add your first product"
                : "Try a different search or filter"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            formatCurrency={formatCurrency}
            onQuickAdd={() =>
              router.push({ pathname: "/modals/quick-add", params: { productId: item.id } })
            }
            onEdit={() =>
              router.push({ pathname: "/modals/edit-product", params: { productId: item.id } })
            }
            onDelete={() => handleDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <Pressable
        style={[styles.fab, { bottom: bottomInset + 100 }]}
        onPress={() => router.push("/modals/add-product")}
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    fontFamily: "Inter_400Regular",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.gray[600],
  },
  filterTextActive: {
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  categoryTag: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  cardPrices: {
    flexDirection: "row",
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  priceCol: {
    flex: 1,
    alignItems: "center",
  },
  priceDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginBottom: 3,
  },
  priceValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  cardActions: {
    flexDirection: "row",
    gap: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    paddingTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
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
  fab: {
    position: "absolute",
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.amber,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});

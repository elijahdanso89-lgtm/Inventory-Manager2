import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { Product, useApp } from "@/context/AppContext";

export default function RecordSaleModal() {
  const insets = useSafeAreaInsets();
  const { products, addSale, formatCurrency } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [discount, setDiscount] = useState("0");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const qty = parseInt(quantity) || 0;
  const disc = parseFloat(discount) || 0;
  const revenue = selectedProduct ? selectedProduct.sellingPrice * qty - disc : 0;
  const cost = selectedProduct ? selectedProduct.costPrice * qty : 0;
  const profit = revenue - cost;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedProduct) e.product = "Select a product";
    else if (qty <= 0) e.qty = "Enter a valid quantity";
    else if (qty > selectedProduct.stock) e.qty = `Only ${selectedProduct.stock} in stock`;
    if (disc < 0) e.discount = "Discount cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRecord = () => {
    if (!validate() || !selectedProduct) return;
    addSale({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: qty,
      sellingPrice: selectedProduct.sellingPrice,
      costPrice: selectedProduct.costPrice,
      discount: disc,
      revenue,
      profit,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.white }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.handle, { marginTop: insets.top > 0 ? insets.top : 16 }]} />
      <View style={styles.modalHeader}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.modalTitle}>Record Sale</Text>
        <Pressable onPress={handleRecord}>
          <Text style={styles.saveText}>Record</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      >
        <Text style={styles.sectionLabel}>Select Product</Text>
        {errors.product ? <Text style={styles.errorText}>{errors.product}</Text> : null}

        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {selectedProduct && (
          <View style={styles.selectedProduct}>
            <View style={styles.selectedIcon}>
              <Feather name="check-circle" size={16} color={Colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}>{selectedProduct.name}</Text>
              <Text style={styles.selectedStock}>{selectedProduct.stock} in stock · {formatCurrency(selectedProduct.sellingPrice)} each</Text>
            </View>
            <Pressable onPress={() => setSelectedProduct(null)}>
              <Feather name="x" size={18} color={Colors.gray[400]} />
            </Pressable>
          </View>
        )}

        {!selectedProduct && filteredProducts.length > 0 && (
          <View style={styles.productList}>
            {filteredProducts.map((p) => (
              <Pressable
                key={p.id}
                style={styles.productRow}
                onPress={() => {
                  setSelectedProduct(p);
                  setSearchQuery("");
                  setErrors((e) => ({ ...e, product: "" }));
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.pRowName}>{p.name}</Text>
                  <Text style={styles.pRowSub}>{p.stock} in stock</Text>
                </View>
                <Text style={styles.pRowPrice}>{formatCurrency(p.sellingPrice)}</Text>
                <Feather name="chevron-right" size={16} color={Colors.gray[300]} />
              </Pressable>
            ))}
          </View>
        )}

        {!selectedProduct && products.length === 0 && (
          <View style={styles.emptyProducts}>
            <Text style={styles.emptyText}>No products yet. Add a product first.</Text>
          </View>
        )}

        {selectedProduct && (
          <>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>Quantity</Text>
                <TextInput
                  style={[styles.input, errors.qty && styles.inputErr]}
                  placeholder="1"
                  placeholderTextColor={Colors.gray[400]}
                  value={quantity}
                  onChangeText={(t) => { setQuantity(t); setErrors((e) => ({ ...e, qty: "" })); }}
                  keyboardType="number-pad"
                />
                {errors.qty ? <Text style={styles.errorText}>{errors.qty}</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>Discount</Text>
                <TextInput
                  style={[styles.input, errors.discount && styles.inputErr]}
                  placeholder="0"
                  placeholderTextColor={Colors.gray[400]}
                  value={discount}
                  onChangeText={(t) => { setDiscount(t); setErrors((e) => ({ ...e, discount: "" })); }}
                  keyboardType="decimal-pad"
                />
                {errors.discount ? <Text style={styles.errorText}>{errors.discount}</Text> : null}
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Sale Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Unit Price</Text>
                <Text style={styles.summaryValue}>{formatCurrency(selectedProduct.sellingPrice)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity</Text>
                <Text style={styles.summaryValue}>× {qty}</Text>
              </View>
              {disc > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, { color: Colors.red }]}>-{formatCurrency(disc)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryDivider]}>
                <Text style={[styles.summaryLabel, styles.summaryTotalLabel]}>Revenue</Text>
                <Text style={[styles.summaryValue, { color: Colors.primary, fontSize: 18 }]}>
                  {formatCurrency(revenue)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Est. Profit</Text>
                <Text style={[styles.summaryValue, { color: Colors.green }]}>
                  {formatCurrency(profit)}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.recordBtn,
            !selectedProduct && styles.recordBtnDisabled,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleRecord}
          disabled={!selectedProduct}
        >
          <Feather name="check" size={18} color={Colors.white} />
          <Text style={styles.recordBtnText}>Record Sale</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  cancelText: { fontSize: 16, color: Colors.gray[500], fontFamily: "Inter_400Regular" },
  saveText: { fontSize: 16, color: Colors.primary, fontFamily: "Inter_700Bold" },
  content: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.gray[700],
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    fontFamily: "Inter_400Regular",
  },
  selectedProduct: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.greenLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  selectedIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text.primary,
  },
  selectedStock: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  productList: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: "hidden",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  pRowName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text.primary,
  },
  pRowSub: {
    fontSize: 12,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
  },
  pRowPrice: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    marginRight: 4,
  },
  emptyProducts: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text.primary,
    fontFamily: "Inter_400Regular",
  },
  inputErr: {
    borderColor: Colors.red,
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 6,
    paddingTop: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
  },
  summaryTotalLabel: {
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  summaryValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  recordBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  recordBtnDisabled: {
    backgroundColor: Colors.gray[300],
  },
  recordBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
});

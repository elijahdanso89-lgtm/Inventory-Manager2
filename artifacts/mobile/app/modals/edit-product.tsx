import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
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
import { useApp } from "@/context/AppContext";

const CATEGORIES = [
  "Electronics", "Clothing", "Food & Drinks", "Beauty", "Home",
  "Office", "Sports", "Toys", "Other",
];

export default function EditProductModal() {
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { products, updateProduct } = useApp();

  const product = products.find((p) => p.id === productId);

  const [name, setName] = useState(product?.name ?? "");
  const [costPrice, setCostPrice] = useState(String(product?.costPrice ?? ""));
  const [sellingPrice, setSellingPrice] = useState(String(product?.sellingPrice ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? ""));
  const [category, setCategory] = useState(product?.category ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!product) {
    router.back();
    return null;
  }

  const margin = () => {
    const cost = parseFloat(costPrice) || 0;
    const sell = parseFloat(sellingPrice) || 0;
    if (cost === 0) return null;
    return (((sell - cost) / cost) * 100).toFixed(1);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Product name is required";
    if (!costPrice || isNaN(Number(costPrice)) || Number(costPrice) < 0) e.cost = "Enter a valid cost price";
    if (!sellingPrice || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) e.sell = "Enter a valid selling price";
    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) e.stock = "Enter a valid stock quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateProduct(productId!, {
      name: name.trim(),
      costPrice: parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
      stock: parseInt(stock),
      category,
    });
    router.back();
  };

  const m = margin();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.white }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.handle, { marginTop: insets.top > 0 ? insets.top : 16 }]} />
      <View style={styles.modalHeader}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.modalTitle}>Edit Product</Text>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputErr]}
            placeholder="Product name"
            placeholderTextColor={Colors.gray[400]}
            value={name}
            onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: "" })); }}
            autoCapitalize="words"
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <View style={styles.field}>
              <Text style={styles.label}>Cost Price</Text>
              <TextInput
                style={[styles.input, errors.cost && styles.inputErr]}
                placeholder="0.00"
                placeholderTextColor={Colors.gray[400]}
                value={costPrice}
                onChangeText={(t) => { setCostPrice(t); setErrors((e) => ({ ...e, cost: "" })); }}
                keyboardType="decimal-pad"
              />
              {errors.cost ? <Text style={styles.errorText}>{errors.cost}</Text> : null}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.field}>
              <Text style={styles.label}>Selling Price</Text>
              <TextInput
                style={[styles.input, errors.sell && styles.inputErr]}
                placeholder="0.00"
                placeholderTextColor={Colors.gray[400]}
                value={sellingPrice}
                onChangeText={(t) => { setSellingPrice(t); setErrors((e) => ({ ...e, sell: "" })); }}
                keyboardType="decimal-pad"
              />
              {errors.sell ? <Text style={styles.errorText}>{errors.sell}</Text> : null}
            </View>
          </View>
        </View>

        {m !== null && (
          <View style={[styles.marginBanner, { backgroundColor: Number(m) >= 0 ? Colors.greenLight : Colors.redLight }]}>
            <Feather name="trending-up" size={14} color={Number(m) >= 0 ? Colors.green : Colors.red} />
            <Text style={[styles.marginText, { color: Number(m) >= 0 ? Colors.green : Colors.red }]}>
              {Number(m) >= 0 ? "+" : ""}{m}% margin
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Stock Quantity</Text>
          <TextInput
            style={[styles.input, errors.stock && styles.inputErr]}
            placeholder="0"
            placeholderTextColor={Colors.gray[400]}
            value={stock}
            onChangeText={(t) => { setStock(t); setErrors((e) => ({ ...e, stock: "" })); }}
            keyboardType="number-pad"
          />
          {errors.stock ? <Text style={styles.errorText}>{errors.stock}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category (optional)</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.catChip, category === cat && styles.catChipActive]}
                onPress={() => setCategory(category === cat ? "" : cat)}
              >
                <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleSave}
        >
          <Feather name="check" size={18} color={Colors.white} />
          <Text style={styles.primaryBtnText}>Save Changes</Text>
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
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 16, color: Colors.gray[500], fontFamily: "Inter_400Regular" },
  saveBtn: { padding: 4 },
  saveText: { fontSize: 16, color: Colors.primary, fontFamily: "Inter_700Bold" },
  content: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.gray[700],
    marginBottom: 8,
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
  },
  marginBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginBottom: 18,
  },
  marginText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.gray[600],
  },
  catTextActive: {
    color: Colors.white,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
});

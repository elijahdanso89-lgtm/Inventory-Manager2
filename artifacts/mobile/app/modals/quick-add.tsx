import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function QuickAddModal() {
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { products, quickAddStock, formatCurrency } = useApp();

  const product = products.find((p) => p.id === productId);
  const [qty, setQty] = useState("1");
  const [error, setError] = useState("");

  if (!product) {
    router.back();
    return null;
  }

  const handleAdd = () => {
    const n = parseInt(qty);
    if (!qty || isNaN(n) || n <= 0) {
      setError("Enter a valid quantity");
      return;
    }
    quickAddStock(product.id, n);
    router.back();
  };

  const presets = [5, 10, 20, 50];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.productInfo}>
        <View style={styles.productIcon}>
          <Feather name="package" size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.currentStock}>Current stock: {product.stock} units</Text>
        </View>
      </View>

      <Text style={styles.label}>Add Quantity</Text>

      <View style={styles.presetRow}>
        {presets.map((p) => (
          <Pressable
            key={p}
            style={[styles.presetBtn, qty === String(p) && styles.presetBtnActive]}
            onPress={() => { setQty(String(p)); setError(""); }}
          >
            <Text style={[styles.presetText, qty === String(p) && styles.presetTextActive]}>
              +{p}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.inputWrapper, error && styles.inputErr]}>
        <Feather name="plus" size={18} color={Colors.gray[400]} />
        <TextInput
          style={styles.input}
          placeholder="Custom amount"
          placeholderTextColor={Colors.gray[400]}
          value={qty}
          onChangeText={(t) => { setQty(t); setError(""); }}
          keyboardType="number-pad"
          autoFocus
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.newStockBanner}>
        <Text style={styles.newStockLabel}>New stock will be</Text>
        <Text style={styles.newStockValue}>
          {product.stock + (parseInt(qty) || 0)} units
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.85 : 1 }]}
        onPress={handleAdd}
      >
        <Feather name="plus-circle" size={18} color={Colors.white} />
        <Text style={styles.addBtnText}>Add Stock</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.white,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  currentStock: {
    fontSize: 13,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.gray[700],
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  presetBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.gray[600],
  },
  presetTextActive: {
    color: Colors.white,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  inputErr: {
    borderColor: Colors.red,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.text.primary,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    marginBottom: 8,
    fontFamily: "Inter_400Regular",
  },
  newStockBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.greenLight,
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
  },
  newStockLabel: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: "Inter_400Regular",
  },
  newStockValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.green,
  },
  addBtn: {
    backgroundColor: Colors.amber,
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
});

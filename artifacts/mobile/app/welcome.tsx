import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
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

const features = [
  { icon: "package" as const, text: "Track Products & Stock" },
  { icon: "trending-up" as const, text: "Monitor Profits & Revenue" },
  { icon: "bar-chart-2" as const, text: "Insights & Analytics" },
  { icon: "dollar-sign" as const, text: "Multi-Currency Support" },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { setProfile } = useApp();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [errors, setErrors] = useState({ name: false, business: false });

  const handleGetStarted = () => {
    const newErrors = {
      name: name.trim().length === 0,
      business: businessName.trim().length === 0,
    };
    setErrors(newErrors);
    if (newErrors.name || newErrors.business) return;

    setProfile({
      name: name.trim(),
      businessName: businessName.trim(),
      hasSeenWelcome: true,
    });
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.white }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>
            Inventory & Profit Tracking{"\n"}for Small Businesses
          </Text>
        </View>

        <View style={styles.featuresRow}>
          {features.map((f) => (
            <View key={f.text} style={styles.featurePill}>
              <Feather name={f.icon} size={14} color={Colors.primary} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Let's get started</Text>
          <Text style={styles.formSubtitle}>Tell us about you and your business</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
              <Feather name="user" size={18} color={errors.name ? Colors.red : Colors.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. John Mensah"
                placeholderTextColor={Colors.gray[400]}
                value={name}
                onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: false })); }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>Please enter your name</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <View style={[styles.inputWrapper, errors.business && styles.inputError]}>
              <Feather name="briefcase" size={18} color={errors.business ? Colors.red : Colors.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Mensah Traders"
                placeholderTextColor={Colors.gray[400]}
                value={businessName}
                onChangeText={(t) => { setBusinessName(t); setErrors((e) => ({ ...e, business: false })); }}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleGetStarted}
              />
            </View>
            {errors.business && <Text style={styles.errorText}>Please enter your business name</Text>}
          </View>

          <Pressable
            style={({ pressed }) => [styles.ctaButton, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleGetStarted}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <Feather name="arrow-right" size={20} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.developerCard}>
          <Feather name="code" size={14} color={Colors.gray[500]} />
          <Text style={styles.developerText}>Built by Elijah Danso</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  logo: {
    width: 160,
    height: 160,
  },
  tagline: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  featureText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  formSection: {
    width: "100%",
    backgroundColor: Colors.gray[50],
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.gray[700],
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: Colors.red,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: Colors.text.primary,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  ctaButton: {
    backgroundColor: Colors.amber,
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  developerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  developerText: {
    fontSize: 13,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
  },
});

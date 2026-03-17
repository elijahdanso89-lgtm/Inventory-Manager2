import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
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

type Mode = "login" | "signup";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signUp, logIn } = useApp();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (newMode: Mode) => {
    Animated.timing(slideAnim, {
      toValue: newMode === "login" ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setMode(newMode);
    setErrors({});
    setApiError("");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && !name.trim()) e.name = "Name is required";
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Enter a valid email address";
    }
    if (!password) {
      e.password = "Password is required";
    } else if (mode === "signup" && password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }
    if (mode === "signup" && password !== confirmPassword) {
      e.confirm = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      if (mode === "signup") {
        await signUp(email.trim(), name.trim(), password);
        router.replace("/welcome");
      } else {
        await logIn(email.trim(), password);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setApiError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "50%"],
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#1A56DB", "#1346B8", "#0D3591"]}
        style={[styles.hero, { paddingTop: insets.top + 24 }]}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>Inventoria</Text>
        <Text style={styles.heroSub}>
          Track inventory & profits effortlessly
        </Text>
      </LinearGradient>

      <View style={styles.sheet}>
        <View style={styles.tabSwitcher}>
          <Animated.View style={[styles.tabIndicator, { left: indicatorLeft }]} />
          <Pressable style={styles.tabBtn} onPress={() => switchMode("login")}>
            <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
              Log In
            </Text>
          </Pressable>
          <Pressable style={styles.tabBtn} onPress={() => switchMode("signup")}>
            <Text style={[styles.tabText, mode === "signup" && styles.tabTextActive]}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.form,
            { paddingBottom: insets.bottom + 32 },
          ]}
        >
          {mode === "signup" && (
            <InputField
              icon="user"
              label="Full Name"
              placeholder="e.g. John Mensah"
              value={name}
              onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: "" })); }}
              autoCapitalize="words"
              error={errors.name}
            />
          )}

          <InputField
            icon="mail"
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: "" })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <InputField
            icon="lock"
            label="Password"
            placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: "" })); }}
            secureTextEntry={!showPassword}
            error={errors.password}
            rightIcon={
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={Colors.gray[400]} />
              </Pressable>
            }
          />

          {mode === "signup" && (
            <InputField
              icon="lock"
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirm: "" })); }}
              secureTextEntry={!showConfirm}
              error={errors.confirm}
              rightIcon={
                <Pressable onPress={() => setShowConfirm((v) => !v)}>
                  <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={Colors.gray[400]} />
                </Pressable>
              }
            />
          )}

          {mode === "login" && (
            <Pressable
              style={styles.forgotRow}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </Pressable>
          )}

          {apiError ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={15} color={Colors.red} />
              <Text style={styles.errorBannerText}>{apiError}</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              loading && styles.submitBtnLoading,
              { opacity: pressed || loading ? 0.85 : 1 },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.submitBtnText}>Please wait...</Text>
            ) : (
              <>
                <Text style={styles.submitBtnText}>
                  {mode === "login" ? "Log In" : "Create Account"}
                </Text>
                <Feather name="arrow-right" size={18} color={Colors.white} />
              </>
            )}
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <Pressable onPress={() => switchMode(mode === "login" ? "signup" : "login")}>
              <Text style={styles.switchLink}>
                {mode === "login" ? "Sign up" : "Log in"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.privacyRow}>
            <Feather name="shield" size={12} color={Colors.gray[400]} />
            <Text style={styles.privacyText}>
              Your data is stored locally on this device only
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function InputField({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  rightIcon,
}: {
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  error?: string;
  rightIcon?: React.ReactNode;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowErr : null]}>
        <Feather
          name={icon as any}
          size={17}
          color={error ? Colors.red : Colors.gray[400]}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "none"}
          returnKeyType="next"
        />
        {rightIcon}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    textAlign: "center",
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabSwitcher: {
    flexDirection: "row",
    margin: 20,
    marginBottom: 8,
    backgroundColor: Colors.gray[100],
    borderRadius: 14,
    padding: 4,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    width: "48%",
    bottom: 4,
    backgroundColor: Colors.white,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.gray[500],
  },
  tabTextActive: {
    color: Colors.primary,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.gray[700],
    marginBottom: 7,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowErr: {
    borderColor: Colors.red,
    backgroundColor: "#FFF5F5",
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    fontFamily: "Inter_400Regular",
  },
  fieldError: {
    fontSize: 12,
    color: Colors.red,
    marginTop: 5,
    fontFamily: "Inter_400Regular",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.redLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.red,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnLoading: {
    backgroundColor: Colors.gray[400],
    shadowOpacity: 0,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: 6,
    marginBottom: 2,
    padding: 4,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
    textDecorationLine: "underline",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
  },
  switchLink: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 20,
  },
  privacyText: {
    fontSize: 12,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
  },
});

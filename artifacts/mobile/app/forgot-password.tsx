import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { findAccountByEmail, resetPassword } = useApp();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState("");

  const handleCheckEmail = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const found = await findAccountByEmail(email.trim().toLowerCase());
      if (!found) {
        setError("No account found with this email address");
        return;
      }
      setAccountName(found.name);
      setStep("reset");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError("");
    if (!newPassword) { setError("Please enter a new password"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), newPassword);
      setStep("done");
    } catch {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#1A56DB", "#1346B8", "#0D3591"]}
        style={[styles.hero, { paddingTop: insets.top + 20 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={Colors.white} />
          <Text style={styles.backText}>Back to Login</Text>
        </Pressable>
        <View style={styles.heroIcon}>
          <Feather name="unlock" size={32} color={Colors.white} />
        </View>
        <Text style={styles.heroTitle}>Recover Account</Text>
        <Text style={styles.heroSub}>
          {step === "email" && "Enter your registered email to reset your password"}
          {step === "reset" && `Hi ${accountName}! Set your new password below`}
          {step === "done" && "Your password has been reset successfully"}
        </Text>
      </LinearGradient>

      <View style={styles.sheet}>
        {step === "email" && (
          <View style={styles.form}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>1</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={[styles.stepDotText, { color: Colors.gray[400] }]}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={[styles.stepDotText, { color: Colors.gray[400] }]}>3</Text>
              </View>
            </View>

            <Text style={styles.stepLabel}>Step 1 — Verify your email</Text>
            <Text style={styles.stepDesc}>
              We'll look up your account using the email you registered with.
            </Text>

            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputRow, error ? styles.inputRowErr : null]}>
              <Feather
                name="mail"
                size={17}
                color={error ? Colors.red : Colors.gray[400]}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.textInput}
                placeholder="you@example.com"
                placeholderTextColor={Colors.gray[400]}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
            </View>
            {error ? <ErrorMsg text={error} /> : null}

            <Pressable
              style={[styles.btn, loading && styles.btnLoading, { marginTop: 20 }]}
              onPress={handleCheckEmail}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? "Checking..." : "Find My Account"}</Text>
              {!loading && <Feather name="arrow-right" size={18} color={Colors.white} />}
            </Pressable>
          </View>
        )}

        {step === "reset" && (
          <View style={styles.form}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <Feather name="check" size={12} color={Colors.white} />
              </View>
              <View style={[styles.stepLine, styles.stepLineDone]} />
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={[styles.stepDotText, { color: Colors.gray[400] }]}>3</Text>
              </View>
            </View>

            <Text style={styles.stepLabel}>Step 2 — Set new password</Text>
            <View style={styles.accountFoundBanner}>
              <Feather name="check-circle" size={16} color={Colors.green} />
              <Text style={styles.accountFoundText}>Account found for <Text style={{ fontFamily: "Inter_700Bold" }}>{email}</Text></Text>
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={[styles.inputRow, error ? styles.inputRowErr : null]}>
              <Feather name="lock" size={17} color={error ? Colors.red : Colors.gray[400]} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.gray[400]}
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setError(""); }}
                secureTextEntry={!showNew}
                autoFocus
              />
              <Pressable onPress={() => setShowNew((v) => !v)}>
                <Feather name={showNew ? "eye-off" : "eye"} size={18} color={Colors.gray[400]} />
              </Pressable>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Confirm New Password</Text>
            <View style={[styles.inputRow, error ? styles.inputRowErr : null]}>
              <Feather name="lock" size={17} color={error ? Colors.red : Colors.gray[400]} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Repeat your password"
                placeholderTextColor={Colors.gray[400]}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(""); }}
                secureTextEntry={!showConfirm}
              />
              <Pressable onPress={() => setShowConfirm((v) => !v)}>
                <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={Colors.gray[400]} />
              </Pressable>
            </View>
            {error ? <ErrorMsg text={error} /> : null}

            <Pressable
              style={[styles.btn, loading && styles.btnLoading, { marginTop: 20 }]}
              onPress={handleReset}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? "Resetting..." : "Reset Password"}</Text>
              {!loading && <Feather name="shield" size={18} color={Colors.white} />}
            </Pressable>
          </View>
        )}

        {step === "done" && (
          <View style={styles.form}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <Feather name="check" size={12} color={Colors.white} />
              </View>
              <View style={[styles.stepLine, styles.stepLineDone]} />
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <Feather name="check" size={12} color={Colors.white} />
              </View>
              <View style={[styles.stepLine, styles.stepLineDone]} />
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <Feather name="check" size={12} color={Colors.white} />
              </View>
            </View>

            <View style={styles.successCard}>
              <View style={styles.successIcon}>
                <Feather name="check-circle" size={40} color={Colors.green} />
              </View>
              <Text style={styles.successTitle}>Password Reset!</Text>
              <Text style={styles.successText}>
                Your password has been updated successfully. You can now log in with your new password.
              </Text>
            </View>

            <Pressable
              style={[styles.btn, { backgroundColor: Colors.green }]}
              onPress={() => router.replace("/auth")}
            >
              <Feather name="log-in" size={18} color={Colors.white} />
              <Text style={styles.btnText}>Go to Login</Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return (
    <View style={styles.errorRow}>
      <Feather name="alert-circle" size={14} color={Colors.red} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  form: {
    padding: 24,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotDone: {
    backgroundColor: Colors.green,
  },
  stepDotText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.gray[200],
    marginHorizontal: 6,
  },
  stepLineDone: {
    backgroundColor: Colors.green,
  },
  stepLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 20,
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
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    fontFamily: "Inter_400Regular",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: Colors.red,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  accountFoundBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.greenLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  accountFoundText: {
    fontSize: 13,
    color: Colors.text.primary,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnLoading: {
    backgroundColor: Colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  successCard: {
    alignItems: "center",
    backgroundColor: Colors.greenLight,
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.green,
    gap: 12,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  successText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});

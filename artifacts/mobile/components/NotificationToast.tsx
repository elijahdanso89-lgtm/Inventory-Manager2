import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { AppNotification, NotificationType, useApp } from "@/context/AppContext";

const TYPE_COLORS: Record<NotificationType, string> = {
  sale: Colors.green,
  low_stock: "#EF4444",
  achievement: Colors.amber,
  info: Colors.primary,
};

const TYPE_BG: Record<NotificationType, string> = {
  sale: "#F0FDF4",
  low_stock: "#FEF2F2",
  achievement: "#FFFBEB",
  info: Colors.primaryLight,
};

function ToastItem({ notification, onDismiss }: { notification: AppNotification; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const topOffset = insets.top + (Platform.OS === "web" ? 67 : 0) + 8;
  const accent = TYPE_COLORS[notification.type];
  const bg = TYPE_BG[notification.type];

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topOffset,
          backgroundColor: bg,
          borderLeftColor: accent,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accent + "22" }]}>
        <Feather name={notification.icon as any} size={16} color={accent} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: accent }]} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>
      <Pressable onPress={onDismiss} style={styles.closeBtn} hitSlop={12}>
        <Feather name="x" size={14} color={Colors.gray[400]} />
      </Pressable>
    </Animated.View>
  );
}

export default function NotificationToast() {
  const { activeToast, dismissToast } = useApp();

  if (!activeToast) return null;

  return (
    <ToastItem
      key={activeToast.id}
      notification={activeToast}
      onDismiss={dismissToast}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.gray[600],
    lineHeight: 16,
  },
  closeBtn: {
    flexShrink: 0,
    padding: 2,
  },
});

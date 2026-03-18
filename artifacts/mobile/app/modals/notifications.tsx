import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import {
  AppNotification,
  NotificationType,
  useApp,
} from "@/context/AppContext";

const TYPE_COLOR: Record<NotificationType, string> = {
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

const TYPE_LABEL: Record<NotificationType, string> = {
  sale: "Sale",
  low_stock: "Low Stock",
  achievement: "Achievement",
  info: "Info",
};

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function NotificationItem({
  item,
  onRead,
  onDelete,
}: {
  item: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const accent = TYPE_COLOR[item.type];
  const bg = TYPE_BG[item.type];

  return (
    <Pressable
      style={[styles.item, !item.read && styles.itemUnread]}
      onPress={() => onRead(item.id)}
    >
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Feather name={item.icon as any} size={18} color={accent} />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemTop}>
          <View style={styles.itemTitleRow}>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />}
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color: accent }]}>
              {TYPE_LABEL[item.type]}
            </Text>
          </View>
        </View>
        <Text style={styles.itemBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.itemTime}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      <Pressable
        onPress={() => onDelete(item.id)}
        style={styles.deleteBtn}
        hitSlop={10}
      >
        <Feather name="trash-2" size={14} color={Colors.gray[400]} />
      </Pressable>
    </Pressable>
  );
}

export default function NotificationsModal() {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
    clearAllNotifications,
  } = useApp();

  // Mark all as read after 1.5s of viewing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (unreadCount > 0) markAllRead();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const isEmpty = notifications.length === 0;

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + 16 }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === "ios" ? 16 : insets.top + 16 }]}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <Pressable onPress={clearAllNotifications} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>Clear all</Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={20} color={Colors.gray[600]} />
          </Pressable>
        </View>
      </View>

      {/* List */}
      {isEmpty ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="bell-off" size={36} color={Colors.gray[400]} />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySub}>
            Notifications for sales, low stock, and achievements will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              onRead={markRead}
              onDelete={deleteNotification}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.primary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  headerBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#EF4444",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    gap: 0,
  },
  separator: {
    height: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemUnread: {
    borderColor: Colors.primary + "33",
    backgroundColor: Colors.primaryLight + "66",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  itemBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.gray[600],
    lineHeight: 18,
  },
  itemTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.gray[400],
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
    flexShrink: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.gray[500],
    textAlign: "center",
    lineHeight: 20,
  },
});

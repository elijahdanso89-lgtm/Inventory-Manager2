import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MiniBarChart({ data }: { data: { date: string; revenue: number; profit: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <View style={styles.barChart}>
      {data.map((d, i) => (
        <View key={i} style={styles.barCol}>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barRevenue,
                { height: `${(d.revenue / maxVal) * 100}%` },
              ]}
            />
            <View
              style={[
                styles.barProfit,
                { height: `${(d.profit / maxVal) * 100}%` },
              ]}
            />
          </View>
          {i % 3 === 0 && (
            <Text style={styles.barLabel} numberOfLines={1}>
              {d.date.split(" ")[1]}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile,
    products,
    formatCurrency,
    getTodayRevenue,
    getTodayProfit,
    getTotalRevenue,
    getTotalProfit,
    getStockValue,
    getLast14Days,
    getTopProducts,
    getLowStockProducts,
    newlyUnlocked,
    clearNewlyUnlocked,
  } = useApp();

  const toastAnim = useRef(new Animated.Value(-120)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (newlyUnlocked) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(toastAnim, { toValue: 0, useNativeDriver: true }),
          Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        Animated.delay(2500),
        Animated.parallel([
          Animated.spring(toastAnim, { toValue: -120, useNativeDriver: true }),
          Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => clearNewlyUnlocked());
    }
  }, [newlyUnlocked]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const chartData = getLast14Days();
  const topProducts = getTopProducts();
  const lowStock = getLowStockProducts();

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomInset = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {newlyUnlocked && (
        <Animated.View
          style={[
            styles.achievementToast,
            { top: topInset + 12, transform: [{ translateY: toastAnim }], opacity: toastOpacity },
          ]}
        >
          <Feather name="award" size={20} color={Colors.amber} />
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>Achievement Unlocked!</Text>
            <Text style={styles.toastSub}>{newlyUnlocked.title}</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 100 }}
      >
        <View style={[styles.header, { paddingTop: topInset + 16 }]}>
          <View>
            <Text style={styles.greeting}>{greeting} </Text>
            <Text style={styles.greetingName}>{profile?.name ?? "there"}</Text>
            <Text style={styles.businessName}>{profile?.businessName}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerBtn}
              onPress={() => router.push("/modals/settings")}
            >
              <Feather name="settings" size={20} color={Colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="Total Revenue"
            value={formatCurrency(getTotalRevenue())}
            icon="trending-up"
            color={Colors.primary}
            bg={Colors.primaryLight}
          />
          <StatCard
            label="Total Profit"
            value={formatCurrency(getTotalProfit())}
            icon="dollar-sign"
            color={Colors.green}
            bg={Colors.greenLight}
          />
          <StatCard
            label="Stock Value"
            value={formatCurrency(getStockValue())}
            icon="package"
            color={Colors.purple}
            bg="#EDE9FE"
          />
          <StatCard
            label="Today's Sales"
            value={formatCurrency(getTodayRevenue())}
            icon="shopping-bag"
            color={Colors.amber}
            bg={Colors.amberLight}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue (14 days)</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Revenue</Text>
              <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
              <Text style={styles.legendText}>Profit</Text>
            </View>
          </View>
          <View style={styles.chartCard}>
            {chartData.every((d) => d.revenue === 0) ? (
              <View style={styles.emptyChart}>
                <Feather name="bar-chart-2" size={32} color={Colors.gray[300]} />
                <Text style={styles.emptyChartText}>No sales data yet</Text>
              </View>
            ) : (
              <MiniBarChart data={chartData} />
            )}
          </View>
        </View>

        {topProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Products</Text>
            {topProducts.map((item, i) => (
              <View key={item.product.id} style={styles.topProductRow}>
                <View style={[styles.rankBadge, i === 0 && { backgroundColor: Colors.amber }]}>
                  <Text style={[styles.rankText, i === 0 && { color: Colors.white }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName} numberOfLines={1}>{item.product.name}</Text>
                  <Text style={styles.productStat}>{item.soldQty} units sold</Text>
                </View>
                <Text style={styles.productProfit}>{formatCurrency(item.profit)}</Text>
              </View>
            ))}
          </View>
        )}

        {lowStock.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.red }]}>
              Low Stock Alert
            </Text>
            {lowStock.map((p) => (
              <View key={p.id} style={styles.lowStockRow}>
                <View style={styles.lowStockIcon}>
                  <Feather name="alert-triangle" size={14} color={Colors.red} />
                </View>
                <Text style={styles.lowStockName} numberOfLines={1}>{p.name}</Text>
                <View style={[styles.stockBadge, p.stock === 0 && styles.stockBadgeOut]}>
                  <Text style={[styles.stockBadgeText, p.stock === 0 && { color: Colors.red }]}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {products.length === 0 && (
          <View style={styles.onboardCard}>
            <Feather name="package" size={36} color={Colors.primary} />
            <Text style={styles.onboardTitle}>Welcome to Inventoria!</Text>
            <Text style={styles.onboardText}>
              Start by adding your first product to begin tracking your inventory and profits.
            </Text>
            <Pressable
              style={styles.onboardBtn}
              onPress={() => router.push("/modals/add-product")}
            >
              <Feather name="plus" size={16} color={Colors.white} />
              <Text style={styles.onboardBtnText}>Add First Product</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
  },
  greetingName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  businessName: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    width: "47.5%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  legendText: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginRight: 6,
  },
  chartCard: {
    height: 120,
  },
  barChart: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  barTrack: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
  },
  barRevenue: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    opacity: 0.8,
  },
  barProfit: {
    flex: 1,
    backgroundColor: Colors.green,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  barLabel: {
    fontSize: 9,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
  },
  emptyChart: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyChartText: {
    fontSize: 13,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
  },
  topProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.gray[600],
  },
  productName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text.primary,
  },
  productStat: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
  },
  productProfit: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.green,
  },
  lowStockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  lowStockIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.redLight,
    alignItems: "center",
    justifyContent: "center",
  },
  lowStockName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text.primary,
  },
  stockBadge: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockBadgeOut: {
    backgroundColor: Colors.redLight,
  },
  stockBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.amberDark,
  },
  onboardCard: {
    margin: 16,
    marginTop: 24,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  onboardTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
    textAlign: "center",
  },
  onboardText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  onboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  onboardBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  achievementToast: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 100,
    backgroundColor: Colors.black,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastTitle: {
    fontSize: 11,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
  },
  toastSub: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
});

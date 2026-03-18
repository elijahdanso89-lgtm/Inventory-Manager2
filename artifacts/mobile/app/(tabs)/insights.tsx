import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { Achievement, useApp } from "@/context/AppContext";

const ACHIEVEMENT_COLORS: Record<string, string> = {
  // Early
  first_product: Colors.primary,
  first_sale: Colors.green,
  // Inventory
  five_products: "#06B6D4",
  ten_products: Colors.purple,
  fifty_products: "#7C3AED",
  // Sales volume
  ten_sales: Colors.green,
  fifty_sales: "#059669",
  hundred_sales: Colors.amber,
  thousand_sales: "#DC2626",
  // Profit
  profit_500: "#10B981",
  profit_1000: Colors.green,
  profit_5000: "#F59E0B",
  profit_10000: Colors.amber,
  profit_50000: "#EF4444",
  // Efficiency
  high_margin: "#8B5CF6",
  well_stocked: "#0EA5E9",
  // Diversification
  diverse_catalog: "#F97316",
  // Bulk
  bulk_seller: "#6366F1",
  // Premium
  premium_seller: "#EC4899",
};

function LineChart({ data }: { data: { date: string; revenue: number; profit: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.revenue), 1);
  const WIDTH = 300;
  const HEIGHT = 100;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * WIDTH,
    yRev: HEIGHT - (d.revenue / maxVal) * HEIGHT,
    yPro: HEIGHT - (d.profit / maxVal) * HEIGHT,
  }));

  const revenueD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yRev.toFixed(1)}`)
    .join(" ");
  const profitD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yPro.toFixed(1)}`)
    .join(" ");

  return (
    <View style={styles.lineChartContainer}>
      <View style={{ height: HEIGHT, width: "100%" }}>
        <View style={StyleSheet.absoluteFill}>
          {[0, 25, 50, 75, 100].map((pct) => (
            <View
              key={pct}
              style={[
                styles.gridLine,
                { top: `${pct}%` },
              ]}
            />
          ))}
        </View>
        <View style={StyleSheet.absoluteFill}>
          {points.map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            return (
              <React.Fragment key={i}>
                <View
                  style={{
                    position: "absolute",
                    left: prev.x,
                    top: Math.min(prev.yRev, p.yRev),
                    width: p.x - prev.x,
                    height: Math.abs(p.yRev - prev.yRev) || 1,
                    backgroundColor: Colors.primary,
                    opacity: 0.7,
                  }}
                />
              </React.Fragment>
            );
          })}
          {points.map((p) => (
            <View
              key={p.x}
              style={[
                styles.dotRev,
                {
                  left: p.x - 3,
                  top: p.yRev - 3,
                },
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.xLabels}>
        {data.map((d, i) =>
          i % 3 === 0 ? (
            <Text key={i} style={styles.xLabel} numberOfLines={1}>
              {d.date.split(" ")[1]}
            </Text>
          ) : (
            <View key={i} style={{ flex: 1 }} />
          )
        )}
      </View>
    </View>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const unlocked = !!achievement.unlockedAt;
  const color = ACHIEVEMENT_COLORS[achievement.id] ?? Colors.primary;

  return (
    <View style={[styles.achievementCard, !unlocked && styles.achievementLocked]}>
      <View
        style={[
          styles.achievementIcon,
          { backgroundColor: unlocked ? color : Colors.gray[200] },
        ]}
      >
        <Feather
          name={achievement.icon as any}
          size={18}
          color={unlocked ? Colors.white : Colors.gray[400]}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.achievementTitle, !unlocked && styles.lockedText]}>
          {achievement.title}
        </Text>
        <Text style={styles.achievementDesc}>{achievement.description}</Text>
      </View>
      {unlocked ? (
        <Feather name="check-circle" size={18} color={color} />
      ) : (
        <Feather name="lock" size={16} color={Colors.gray[300]} />
      )}
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const {
    products,
    sales,
    achievements,
    formatCurrency,
    getLast14Days,
    getTopProducts,
    getLowStockProducts,
    getTotalRevenue,
    getTotalProfit,
  } = useApp();

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomInset = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const chartData = getLast14Days();
  const topProducts = getTopProducts();
  const lowStock = getLowStockProducts();
  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;

  const avgOrderValue = sales.length > 0 ? getTotalRevenue() / sales.length : 0;
  const profitMargin = getTotalRevenue() > 0
    ? ((getTotalProfit() / getTotalRevenue()) * 100).toFixed(1)
    : "0.0";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomInset + 100 }}
    >
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <Text style={styles.title}>Insights</Text>
        <View style={styles.achievementBadge}>
          <Feather name="award" size={14} color={Colors.amber} />
          <Text style={styles.achievementBadgeText}>
            {unlockedCount}/{achievements.length}
          </Text>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Avg. Order Value</Text>
          <Text style={styles.kpiValue}>{formatCurrency(avgOrderValue)}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Profit Margin</Text>
          <Text style={[styles.kpiValue, { color: Colors.green }]}>{profitMargin}%</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Sales</Text>
          <Text style={styles.kpiValue}>{sales.length}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Revenue</Text>
          </View>
        </View>
        {chartData.every((d) => d.revenue === 0) ? (
          <View style={styles.emptyChart}>
            <Feather name="trending-up" size={32} color={Colors.gray[300]} />
            <Text style={styles.emptyChartText}>No data yet</Text>
          </View>
        ) : (
          <LineChart data={chartData} />
        )}
      </View>

      {topProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          {topProducts.map((item, i) => {
            const pct = getTotalRevenue() > 0
              ? ((item.revenue / getTotalRevenue()) * 100).toFixed(0)
              : "0";
            return (
              <View key={item.product.id} style={styles.perfRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.perfHeader}>
                    <Text style={styles.perfName} numberOfLines={1}>{item.product.name}</Text>
                    <Text style={styles.perfPct}>{pct}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(100, Number(pct))}%`,
                          backgroundColor: i === 0 ? Colors.amber : Colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.perfSub}>
                    {formatCurrency(item.revenue)} revenue · {item.soldQty} units
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {lowStock.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.red }]}>Needs Attention</Text>
          {lowStock.map((p) => (
            <View key={p.id} style={styles.needsRow}>
              <Feather
                name={p.stock === 0 ? "alert-circle" : "alert-triangle"}
                size={16}
                color={p.stock === 0 ? Colors.red : Colors.amber}
              />
              <Text style={styles.needsName} numberOfLines={1}>{p.name}</Text>
              <Text style={[styles.needsStock, p.stock === 0 && { color: Colors.red }]}>
                {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionSub}>
          {unlockedCount} of {achievements.length} unlocked
        </Text>
        {achievements.map((a) => (
          <AchievementCard key={a.id} achievement={a} />
        ))}
      </View>
    </ScrollView>
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
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  achievementBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.amberDark,
  },
  kpiRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text.primary,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
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
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: "Inter_400Regular",
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
  },
  lineChartContainer: {
    paddingTop: 8,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.gray[100],
  },
  dotRev: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  xLabels: {
    flexDirection: "row",
    marginTop: 6,
  },
  xLabel: {
    flex: 1,
    fontSize: 9,
    color: Colors.gray[400],
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  emptyChart: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyChartText: {
    fontSize: 13,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
  },
  perfRow: {
    marginBottom: 12,
  },
  perfHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  perfName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  perfPct: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.gray[500],
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.gray[100],
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  perfSub: {
    fontSize: 12,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
  },
  needsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  needsName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text.primary,
  },
  needsStock: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.amberDark,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text.primary,
  },
  lockedText: {
    color: Colors.gray[500],
  },
  achievementDesc: {
    fontSize: 12,
    color: Colors.gray[400],
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
});

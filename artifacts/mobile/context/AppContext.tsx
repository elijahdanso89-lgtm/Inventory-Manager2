import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Currency = "GHS" | "USD" | "EUR" | "GBP";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GHS: "₵",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const CURRENCY_RATES: Record<Currency, number> = {
  GHS: 1,
  USD: 0.067,
  EUR: 0.062,
  GBP: 0.053,
};

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
  createdAt: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
  discount: number;
  revenue: number;
  profit: number;
  soldAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (products: Product[], sales: Sale[]) => boolean;
  unlockedAt?: number;
}

export interface UserProfile {
  name: string;
  businessName: string;
  hasSeenWelcome: boolean;
}

interface AppContextValue {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  products: Product[];
  sales: Sale[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  achievements: Achievement[];
  newlyUnlocked: Achievement | null;
  clearNewlyUnlocked: () => void;
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string, deleteSales?: boolean) => void;
  quickAddStock: (id: string, qty: number) => void;
  addSale: (s: Omit<Sale, "id" | "soldAt">) => void;
  deleteSale: (id: string) => void;
  clearAllData: () => void;
  formatCurrency: (amount: number) => string;
  getTodayRevenue: () => number;
  getTodayProfit: () => number;
  getTotalRevenue: () => number;
  getTotalProfit: () => number;
  getStockValue: () => number;
  getLast14Days: () => { date: string; revenue: number; profit: number }[];
  getTopProducts: () => { product: Product; revenue: number; profit: number; soldQty: number }[];
  getLowStockProducts: () => Product[];
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_product",
    title: "First Product",
    description: "Add your first product",
    icon: "package",
    condition: (products) => products.length >= 1,
  },
  {
    id: "first_sale",
    title: "First Sale",
    description: "Record your first sale",
    icon: "shopping-cart",
    condition: (_p, sales) => sales.length >= 1,
  },
  {
    id: "ten_products",
    title: "Growing Catalog",
    description: "Add 10 products",
    icon: "layers",
    condition: (products) => products.length >= 10,
  },
  {
    id: "hundred_sales",
    title: "Century Seller",
    description: "Record 100 sales",
    icon: "award",
    condition: (_p, sales) => sales.length >= 100,
  },
  {
    id: "profit_1000",
    title: "Four Figures",
    description: "Earn 1,000 in profit (GHS)",
    icon: "trending-up",
    condition: (_p, sales) =>
      sales.reduce((sum, s) => sum + s.profit, 0) >= 1000,
  },
  {
    id: "profit_10000",
    title: "Big Business",
    description: "Earn 10,000 in profit (GHS)",
    icon: "zap",
    condition: (_p, sales) =>
      sales.reduce((sum, s) => sum + s.profit, 0) >= 10000,
  },
];

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  profile: "inventoria_profile",
  products: "inventoria_products",
  sales: "inventoria_sales",
  currency: "inventoria_currency",
  achievements: "inventoria_achievements",
};

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("GHS");
  const [unlockedIds, setUnlockedIds] = useState<Record<string, number>>({});
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, pr, s, c, a] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.products),
          AsyncStorage.getItem(STORAGE_KEYS.sales),
          AsyncStorage.getItem(STORAGE_KEYS.currency),
          AsyncStorage.getItem(STORAGE_KEYS.achievements),
        ]);
        if (p) setProfileState(JSON.parse(p));
        if (pr) setProducts(JSON.parse(pr));
        if (s) setSales(JSON.parse(s));
        if (c) setCurrencyState(c as Currency);
        if (a) setUnlockedIds(JSON.parse(a));
      } catch (e) {
        console.log("Load error", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const checkAchievements = useCallback(
    (updatedProducts: Product[], updatedSales: Sale[]) => {
      for (const ach of ACHIEVEMENTS) {
        if (!unlockedIds[ach.id] && ach.condition(updatedProducts, updatedSales)) {
          const now = Date.now();
          const newIds = { ...unlockedIds, [ach.id]: now };
          setUnlockedIds(newIds);
          AsyncStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(newIds));
          setNewlyUnlocked({ ...ach, unlockedAt: now });
          break;
        }
      }
    },
    [unlockedIds]
  );

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(p));
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    AsyncStorage.setItem(STORAGE_KEYS.currency, c);
  }, []);

  const addProduct = useCallback(
    (data: Omit<Product, "id" | "createdAt">) => {
      const newProduct: Product = { ...data, id: genId(), createdAt: Date.now() };
      const updated = [...products, newProduct];
      setProducts(updated);
      AsyncStorage.setItem(STORAGE_KEYS.products, JSON.stringify(updated));
      checkAchievements(updated, sales);
    },
    [products, sales, checkAchievements]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setProducts(updated);
      AsyncStorage.setItem(STORAGE_KEYS.products, JSON.stringify(updated));
    },
    [products]
  );

  const deleteProduct = useCallback(
    (id: string, deleteSales = false) => {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      AsyncStorage.setItem(STORAGE_KEYS.products, JSON.stringify(updatedProducts));
      if (deleteSales) {
        const updatedSales = sales.filter((s) => s.productId !== id);
        setSales(updatedSales);
        AsyncStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(updatedSales));
      }
    },
    [products, sales]
  );

  const quickAddStock = useCallback(
    (id: string, qty: number) => {
      const updated = products.map((p) =>
        p.id === id ? { ...p, stock: p.stock + qty } : p
      );
      setProducts(updated);
      AsyncStorage.setItem(STORAGE_KEYS.products, JSON.stringify(updated));
    },
    [products]
  );

  const addSale = useCallback(
    (data: Omit<Sale, "id" | "soldAt">) => {
      const newSale: Sale = { ...data, id: genId(), soldAt: Date.now() };
      const updatedSales = [newSale, ...sales];
      setSales(updatedSales);
      AsyncStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(updatedSales));
      // Reduce stock
      const updatedProducts = products.map((p) =>
        p.id === data.productId ? { ...p, stock: Math.max(0, p.stock - data.quantity) } : p
      );
      setProducts(updatedProducts);
      AsyncStorage.setItem(STORAGE_KEYS.products, JSON.stringify(updatedProducts));
      checkAchievements(updatedProducts, updatedSales);
    },
    [sales, products, checkAchievements]
  );

  const deleteSale = useCallback(
    (id: string) => {
      const updated = sales.filter((s) => s.id !== id);
      setSales(updated);
      AsyncStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(updated));
    },
    [sales]
  );

  const clearAllData = useCallback(async () => {
    setProducts([]);
    setSales([]);
    setUnlockedIds({});
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.products),
      AsyncStorage.removeItem(STORAGE_KEYS.sales),
      AsyncStorage.removeItem(STORAGE_KEYS.achievements),
    ]);
  }, []);

  const formatCurrency = useCallback(
    (amount: number) => {
      const rate = CURRENCY_RATES[currency];
      const converted = amount * rate;
      const symbol = CURRENCY_SYMBOLS[currency];
      return `${symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    [currency]
  );

  const getTodayRevenue = useCallback(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return sales
      .filter((s) => s.soldAt >= start.getTime())
      .reduce((sum, s) => sum + s.revenue, 0);
  }, [sales]);

  const getTodayProfit = useCallback(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return sales
      .filter((s) => s.soldAt >= start.getTime())
      .reduce((sum, s) => sum + s.profit, 0);
  }, [sales]);

  const getTotalRevenue = useCallback(
    () => sales.reduce((sum, s) => sum + s.revenue, 0),
    [sales]
  );

  const getTotalProfit = useCallback(
    () => sales.reduce((sum, s) => sum + s.profit, 0),
    [sales]
  );

  const getStockValue = useCallback(
    () => products.reduce((sum, p) => sum + p.costPrice * p.stock, 0),
    [products]
  );

  const getLast14Days = useCallback(() => {
    const days: { date: string; revenue: number; profit: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      const daySales = sales.filter((s) => s.soldAt >= d.getTime() && s.soldAt <= end.getTime());
      days.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: daySales.reduce((sum, s) => sum + s.revenue, 0),
        profit: daySales.reduce((sum, s) => sum + s.profit, 0),
      });
    }
    return days;
  }, [sales]);

  const getTopProducts = useCallback(() => {
    const map: Record<string, { product: Product; revenue: number; profit: number; soldQty: number }> = {};
    for (const sale of sales) {
      const product = products.find((p) => p.id === sale.productId);
      if (!product) continue;
      if (!map[sale.productId]) {
        map[sale.productId] = { product, revenue: 0, profit: 0, soldQty: 0 };
      }
      map[sale.productId].revenue += sale.revenue;
      map[sale.productId].profit += sale.profit;
      map[sale.productId].soldQty += sale.quantity;
    }
    return Object.values(map).sort((a, b) => b.profit - a.profit).slice(0, 5);
  }, [products, sales]);

  const getLowStockProducts = useCallback(
    () => products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock),
    [products]
  );

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked(null), []);

  const achievements = useMemo(
    () =>
      ACHIEVEMENTS.map((a) => ({
        ...a,
        unlockedAt: unlockedIds[a.id],
      })),
    [unlockedIds]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      profile,
      setProfile,
      products,
      sales,
      currency,
      setCurrency,
      achievements,
      newlyUnlocked,
      clearNewlyUnlocked,
      addProduct,
      updateProduct,
      deleteProduct,
      quickAddStock,
      addSale,
      deleteSale,
      clearAllData,
      formatCurrency,
      getTodayRevenue,
      getTodayProfit,
      getTotalRevenue,
      getTotalProfit,
      getStockValue,
      getLast14Days,
      getTopProducts,
      getLowStockProducts,
    }),
    [
      profile, setProfile, products, sales, currency, setCurrency,
      achievements, newlyUnlocked, clearNewlyUnlocked,
      addProduct, updateProduct, deleteProduct, quickAddStock,
      addSale, deleteSale, clearAllData, formatCurrency,
      getTodayRevenue, getTodayProfit, getTotalRevenue, getTotalProfit,
      getStockValue, getLast14Days, getTopProducts, getLowStockProducts,
    ]
  );

  if (!loaded) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

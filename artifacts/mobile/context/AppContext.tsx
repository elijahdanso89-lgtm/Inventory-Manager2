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

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

interface AppContextValue {
  // Auth
  authUser: AuthUser | null;
  isAuthLoaded: boolean;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  findAccountByEmail: (email: string) => Promise<AuthUser | null>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;

  // Profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;

  // Inventory
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
  users: "inventoria_users",
  session: "inventoria_session",
  profile: (userId: string) => `inventoria_profile_${userId}`,
  products: (userId: string) => `inventoria_products_${userId}`,
  sales: (userId: string) => `inventoria_sales_${userId}`,
  currency: (userId: string) => `inventoria_currency_${userId}`,
  achievements: (userId: string) => `inventoria_achievements_${userId}`,
};

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Simple deterministic hash for local password storage
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("GHS");
  const [unlockedIds, setUnlockedIds] = useState<Record<string, number>>({});
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Load user data when authUser changes
  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [p, pr, s, c, a] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.profile(userId)),
        AsyncStorage.getItem(STORAGE_KEYS.products(userId)),
        AsyncStorage.getItem(STORAGE_KEYS.sales(userId)),
        AsyncStorage.getItem(STORAGE_KEYS.currency(userId)),
        AsyncStorage.getItem(STORAGE_KEYS.achievements(userId)),
      ]);
      setProfileState(p ? JSON.parse(p) : null);
      setProducts(pr ? JSON.parse(pr) : []);
      setSales(s ? JSON.parse(s) : []);
      setCurrencyState((c as Currency) ?? "GHS");
      setUnlockedIds(a ? JSON.parse(a) : {});
    } catch (e) {
      console.log("Load user data error", e);
    }
  }, []);

  // Initial load — check for saved session
  useEffect(() => {
    (async () => {
      try {
        const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.session);
        if (sessionId) {
          const usersRaw = await AsyncStorage.getItem(STORAGE_KEYS.users);
          const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
          const found = users.find((u) => u.id === sessionId);
          if (found) {
            const user: AuthUser = { id: found.id, email: found.email, name: found.name, createdAt: found.createdAt };
            setAuthUser(user);
            await loadUserData(found.id);
          }
        }
      } catch (e) {
        console.log("Session load error", e);
      } finally {
        setIsAuthLoaded(true);
      }
    })();
  }, [loadUserData]);

  const signUp = useCallback(async (email: string, name: string, password: string) => {
    const usersRaw = await AsyncStorage.getItem(STORAGE_KEYS.users);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

    const emailLower = email.toLowerCase().trim();
    if (users.find((u) => u.email === emailLower)) {
      throw new Error("An account with this email already exists");
    }

    const newUser: StoredUser = {
      id: genId(),
      email: emailLower,
      name: name.trim(),
      passwordHash: simpleHash(password),
      createdAt: Date.now(),
    };
    users.push(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    await AsyncStorage.setItem(STORAGE_KEYS.session, newUser.id);

    const authUserObj: AuthUser = { id: newUser.id, email: newUser.email, name: newUser.name, createdAt: newUser.createdAt };
    setAuthUser(authUserObj);
    setProfileState(null);
    setProducts([]);
    setSales([]);
    setCurrencyState("GHS");
    setUnlockedIds({});
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    const usersRaw = await AsyncStorage.getItem(STORAGE_KEYS.users);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

    const emailLower = email.toLowerCase().trim();
    const found = users.find((u) => u.email === emailLower);
    if (!found) {
      throw new Error("No account found with this email");
    }
    if (found.passwordHash !== simpleHash(password)) {
      throw new Error("Incorrect password");
    }

    await AsyncStorage.setItem(STORAGE_KEYS.session, found.id);
    const authUserObj: AuthUser = { id: found.id, email: found.email, name: found.name, createdAt: found.createdAt };
    setAuthUser(authUserObj);
    await loadUserData(found.id);
  }, [loadUserData]);

  const findAccountByEmail = useCallback(async (email: string): Promise<AuthUser | null> => {
    const usersRaw = await AsyncStorage.getItem(STORAGE_KEYS.users);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find((u) => u.email === email.toLowerCase().trim());
    if (!found) return null;
    return { id: found.id, email: found.email, name: found.name, createdAt: found.createdAt };
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    const usersRaw = await AsyncStorage.getItem(STORAGE_KEYS.users);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u) => u.email === email.toLowerCase().trim());
    if (idx === -1) throw new Error("Account not found");
    users[idx] = { ...users[idx], passwordHash: simpleHash(newPassword) };
    await AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, []);

  const logOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.session);
    setAuthUser(null);
    setProfileState(null);
    setProducts([]);
    setSales([]);
    setCurrencyState("GHS");
    setUnlockedIds({});
    setNewlyUnlocked(null);
  }, []);

  const checkAchievements = useCallback(
    (updatedProducts: Product[], updatedSales: Sale[]) => {
      for (const ach of ACHIEVEMENTS) {
        if (!unlockedIds[ach.id] && ach.condition(updatedProducts, updatedSales)) {
          const now = Date.now();
          const newIds = { ...unlockedIds, [ach.id]: now };
          setUnlockedIds(newIds);
          if (authUser) {
            AsyncStorage.setItem(STORAGE_KEYS.achievements(authUser.id), JSON.stringify(newIds));
          }
          setNewlyUnlocked({ ...ach, unlockedAt: now });
          break;
        }
      }
    },
    [unlockedIds, authUser]
  );

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    if (authUser) {
      AsyncStorage.setItem(STORAGE_KEYS.profile(authUser.id), JSON.stringify(p));
    }
  }, [authUser]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    if (authUser) {
      AsyncStorage.setItem(STORAGE_KEYS.currency(authUser.id), c);
    }
  }, [authUser]);

  const addProduct = useCallback(
    (data: Omit<Product, "id" | "createdAt">) => {
      const newProduct: Product = { ...data, id: genId(), createdAt: Date.now() };
      const updated = [...products, newProduct];
      setProducts(updated);
      if (authUser) {
        AsyncStorage.setItem(STORAGE_KEYS.products(authUser.id), JSON.stringify(updated));
      }
      checkAchievements(updated, sales);
    },
    [products, sales, checkAchievements, authUser]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setProducts(updated);
      if (authUser) {
        AsyncStorage.setItem(STORAGE_KEYS.products(authUser.id), JSON.stringify(updated));
      }
    },
    [products, authUser]
  );

  const deleteProduct = useCallback(
    (id: string, deleteSalesHistory = false) => {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      if (authUser) {
        AsyncStorage.setItem(STORAGE_KEYS.products(authUser.id), JSON.stringify(updatedProducts));
      }
      if (deleteSalesHistory) {
        const updatedSales = sales.filter((s) => s.productId !== id);
        setSales(updatedSales);
        if (authUser) {
          AsyncStorage.setItem(STORAGE_KEYS.sales(authUser.id), JSON.stringify(updatedSales));
        }
      }
    },
    [products, sales, authUser]
  );

  const quickAddStock = useCallback(
    (id: string, qty: number) => {
      const updated = products.map((p) =>
        p.id === id ? { ...p, stock: p.stock + qty } : p
      );
      setProducts(updated);
      if (authUser) {
        AsyncStorage.setItem(STORAGE_KEYS.products(authUser.id), JSON.stringify(updated));
      }
    },
    [products, authUser]
  );

  const addSale = useCallback(
    (data: Omit<Sale, "id" | "soldAt">) => {
      const newSale: Sale = { ...data, id: genId(), soldAt: Date.now() };
      const updatedSales = [newSale, ...sales];
      setSales(updatedSales);
      const updatedProducts = products.map((p) =>
        p.id === data.productId ? { ...p, stock: Math.max(0, p.stock - data.quantity) } : p
      );
      setProducts(updatedProducts);
      if (authUser) {
        AsyncStorage.setItem(STORAGE_KEYS.sales(authUser.id), JSON.stringify(updatedSales));
        AsyncStorage.setItem(STORAGE_KEYS.products(authUser.id), JSON.stringify(updatedProducts));
      }
      checkAchievements(updatedProducts, updatedSales);
    },
    [sales, products, checkAchievements, authUser]
  );

  const deleteSale = useCallback(
    (id: string) => {
      const updated = sales.filter((s) => s.id !== id);
      setSales(updated);
      if (authUser) {
        AsyncStorage.setItem(STORAGE_KEYS.sales(authUser.id), JSON.stringify(updated));
      }
    },
    [sales, authUser]
  );

  const clearAllData = useCallback(async () => {
    setProducts([]);
    setSales([]);
    setUnlockedIds({});
    if (authUser) {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.products(authUser.id)),
        AsyncStorage.removeItem(STORAGE_KEYS.sales(authUser.id)),
        AsyncStorage.removeItem(STORAGE_KEYS.achievements(authUser.id)),
      ]);
    }
  }, [authUser]);

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
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return sales.filter((s) => s.soldAt >= start.getTime()).reduce((sum, s) => sum + s.revenue, 0);
  }, [sales]);

  const getTodayProfit = useCallback(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return sales.filter((s) => s.soldAt >= start.getTime()).reduce((sum, s) => sum + s.profit, 0);
  }, [sales]);

  const getTotalRevenue = useCallback(() => sales.reduce((sum, s) => sum + s.revenue, 0), [sales]);
  const getTotalProfit = useCallback(() => sales.reduce((sum, s) => sum + s.profit, 0), [sales]);
  const getStockValue = useCallback(() => products.reduce((sum, p) => sum + p.costPrice * p.stock, 0), [products]);

  const getLast14Days = useCallback(() => {
    const days: { date: string; revenue: number; profit: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      const ds = sales.filter((s) => s.soldAt >= d.getTime() && s.soldAt <= end.getTime());
      days.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: ds.reduce((sum, s) => sum + s.revenue, 0),
        profit: ds.reduce((sum, s) => sum + s.profit, 0),
      });
    }
    return days;
  }, [sales]);

  const getTopProducts = useCallback(() => {
    const map: Record<string, { product: Product; revenue: number; profit: number; soldQty: number }> = {};
    for (const sale of sales) {
      const product = products.find((p) => p.id === sale.productId);
      if (!product) continue;
      if (!map[sale.productId]) map[sale.productId] = { product, revenue: 0, profit: 0, soldQty: 0 };
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
    () => ACHIEVEMENTS.map((a) => ({ ...a, unlockedAt: unlockedIds[a.id] })),
    [unlockedIds]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      authUser, isAuthLoaded, signUp, logIn, logOut, findAccountByEmail, resetPassword,
      profile, setProfile,
      products, sales, currency, setCurrency,
      achievements, newlyUnlocked, clearNewlyUnlocked,
      addProduct, updateProduct, deleteProduct, quickAddStock,
      addSale, deleteSale, clearAllData, formatCurrency,
      getTodayRevenue, getTodayProfit, getTotalRevenue, getTotalProfit,
      getStockValue, getLast14Days, getTopProducts, getLowStockProducts,
    }),
    [
      authUser, isAuthLoaded, signUp, logIn, logOut, findAccountByEmail, resetPassword,
      profile, setProfile, products, sales, currency, setCurrency,
      achievements, newlyUnlocked, clearNewlyUnlocked,
      addProduct, updateProduct, deleteProduct, quickAddStock,
      addSale, deleteSale, clearAllData, formatCurrency,
      getTodayRevenue, getTodayProfit, getTotalRevenue, getTotalProfit,
      getStockValue, getLast14Days, getTopProducts, getLowStockProducts,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

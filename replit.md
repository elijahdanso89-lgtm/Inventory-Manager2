# Inventoria — Inventory & Profit Tracking App

## Overview
A complete Expo React Native mobile app for inventory and profit tracking for small businesses. Built by Elijah Danso.

## Architecture

### Stack
- **Framework**: Expo SDK 54 with Expo Router v6 (file-based routing)
- **Language**: TypeScript
- **State**: React Context + AsyncStorage (no backend, fully local)
- **Fonts**: Inter (400/600/700) via `@expo-google-fonts/inter`
- **Icons**: `@expo/vector-icons` (Feather) + `expo-symbols` (SF Symbols on iOS)

### Directory Structure
```
artifacts/mobile/
├── app/
│   ├── _layout.tsx           # Root stack + auth gate + branded loading screen
│   ├── auth.tsx              # Email login/signup with animated tab switcher
│   ├── forgot-password.tsx   # 3-step password recovery flow
│   ├── welcome.tsx           # One-time onboarding screen
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tabs nav (BlurView on iOS)
│   │   ├── index.tsx         # Dashboard (bell icon, stats, chart, low stock)
│   │   ├── inventory.tsx     # Product management
│   │   ├── sales.tsx         # Sales history
│   │   └── insights.tsx      # Analytics + achievements
│   └── modals/
│       ├── add-product.tsx   # Add product modal
│       ├── edit-product.tsx  # Edit product modal
│       ├── quick-add.tsx     # Quick stock add (formSheet)
│       ├── record-sale.tsx   # Record sale modal
│       ├── settings.tsx      # Settings + account card + logout
│       └── notifications.tsx # Notification center modal
├── components/
│   ├── NotificationToast.tsx # Animated top-banner toast
│   ├── ErrorBoundary.tsx
│   └── ErrorFallback.tsx
├── context/
│   └── AppContext.tsx        # Full app state: products, sales, currency,
│                             # achievements (20), notifications, auth
├── constants/
│   └── colors.ts             # Design tokens (Blue #1A56DB + Amber #F59E0B)
└── assets/images/
    ├── logo.png              # Inventoria logo (gold cart + green arrow)
    ├── icon.png              # App icon
    └── splash-icon.png       # Splash screen image
```

## Features
- **Auth**: Email/password login + signup, forgot-password recovery (3-step), per-user data isolation via AsyncStorage
- **Dashboard**: Greeting, stats cards, 14-day bar chart, top products, low stock alerts, bell icon with unread badge
- **Inventory**: Product cards with cost/price/margin/stock, quick-add, edit, delete, search & filter
- **Sales**: Sale history with revenue/profit summary, delete sale, 3-metric summary header
- **Insights**: KPI cards (avg order, profit margin, total sales), revenue trend chart, top performers, low stock, **20 achievements**
- **Welcome**: One-time onboarding, shown only when `profile.hasSeenWelcome === false`
- **Notifications**: Real-time animated toast banners + notification center modal. Auto-fires on: sale recorded, low-stock (≤5 units, once/day per product), achievement unlocked
- **Multi-currency**: GHS (default), USD, EUR, GBP with conversion rates
- **Settings**: Account card (avatar, email, name), currency switcher, stats, clear data, logout

## Achievements (20 total)
| ID | Title | Trigger |
|---|---|---|
| first_product | First Step | Add 1 product |
| first_sale | First Sale | Record 1 sale |
| five_products | Starter Pack | Add 5 products |
| ten_products | Growing Catalog | Add 10 products |
| fifty_products | Inventory Master | Add 50 products |
| ten_sales | Getting Started | Record 10 sales |
| fifty_sales | Regular Seller | Record 50 sales |
| hundred_sales | Century Seller | Record 100 sales |
| thousand_sales | Power Seller | Record 1,000 sales |
| profit_500 | First Profit | Earn 500 GHS profit |
| profit_1000 | Four Figures | Earn 1,000 GHS profit |
| profit_5000 | High Earner | Earn 5,000 GHS profit |
| profit_10000 | Big Business | Earn 10,000 GHS profit |
| profit_50000 | Entrepreneur | Earn 50,000 GHS profit |
| high_margin | Savvy Seller | 50%+ average profit margin |
| well_stocked | Stock Keeper | 1,000 GHS stock value |
| diverse_catalog | Variety Pack | 5+ different categories |
| bulk_seller | Bulk Master | Single sale of 50+ items |
| premium_seller | Premium Products | Product with 1,000+ GHS price |

## Build & Publish
- `app.json`: version `1.0.1`, Android package `com.elijahdanso.inventoria`, iOS bundle ID `com.elijahdanso.inventoria`
- `eas.json`: `preview` profile → APK/IPA for sharing; `production` → AAB/IPA for stores

```bash
# One-time setup
npm install -g eas-cli
eas login
eas build:configure

# Android APK (for testing/sharing)
eas build --platform android --profile preview

# iOS IPA (for TestFlight)
eas build --platform ios --profile preview

# Production (Play Store / App Store)
eas build --platform all --profile production
```

## Developer Notes
- All data persisted with AsyncStorage (keys prefixed `inventoria_`)
- Per-user data keyed as `inventoria_{type}_{userId}`
- Currency is display-only: all internal values stored in GHS
- Achievements check runs after every `addProduct` and `addSale`
- Low-stock notifications fire once per product per app session (tracked in `lowStockSentTodayRef`)
- `formSheet` presentation for quick-add modal (bottom sheet feel)
- Path alias `@/` maps to `artifacts/mobile/` root
- Branded loading screen shown while AsyncStorage session is read on startup

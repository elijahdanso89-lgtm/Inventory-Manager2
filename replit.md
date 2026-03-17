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
│   ├── _layout.tsx           # Root stack + onboarding gate
│   ├── welcome.tsx           # One-time onboarding screen
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tabs nav (BlurView on iOS)
│   │   ├── index.tsx         # Dashboard
│   │   ├── inventory.tsx     # Product management
│   │   ├── sales.tsx         # Sales history
│   │   └── insights.tsx      # Analytics + achievements
│   └── modals/
│       ├── add-product.tsx   # Add product modal
│       ├── edit-product.tsx  # Edit product modal
│       ├── quick-add.tsx     # Quick stock add (formSheet)
│       ├── record-sale.tsx   # Record sale modal
│       └── settings.tsx      # Settings + currency + clear data
├── context/
│   └── AppContext.tsx         # Full app state (products, sales, currency, achievements)
├── constants/
│   └── colors.ts             # Design tokens (Blue #1A56DB + Amber #F59E0B)
└── assets/images/
    └── logo.png              # Inventoria logo (gold cart + green arrow)
```

## Features
- **Dashboard**: Stats cards, 14-day bar chart, top products, low stock alerts, achievement toast
- **Inventory**: Product cards with cost/price/margin/stock, quick-add, edit, delete (with option to delete sales history), search & filter
- **Sales**: Sale history with revenue/profit summary, delete sale, 3-metric summary header
- **Insights**: KPI cards (avg order, profit margin, total sales), revenue trend line chart, top performers with progress bars, low stock alerts, achievements
- **Welcome**: One-time onboarding with name + business name, shown if `profile.hasSeenWelcome === false`
- **Modals**: Add Product, Edit Product, Quick Add Stock, Record Sale (with product picker + summary), Settings (currency switcher, stats, clear data)
- **Achievements**: 6 unlockable achievements tracked in AsyncStorage
- **Multi-currency**: GHS (default), USD, EUR, GBP with conversion rates

## Design
- Color scheme: Blue (#1A56DB) + Amber (#F59E0B)
- Background: #F8FAFC
- Cards with subtle shadows, rounded 16px corners
- BlurView tab bar on iOS, solid white on web/Android

## Developer Notes
- All data persisted with AsyncStorage (keys prefixed `inventoria_`)
- Currency is display-only: all internal values stored in GHS
- Achievements check runs after every `addProduct` and `addSale` call
- `formSheet` presentation for quick-add modal (bottom sheet feel)
- Path alias `@/` maps to `artifacts/mobile/` root

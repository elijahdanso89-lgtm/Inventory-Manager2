import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootNavigator() {
  const { profile } = useApp();
  const segments = useSegments();

  useEffect(() => {
    const inTabsGroup = segments[0] === "(tabs)";
    const isWelcome = segments[0] === "welcome";

    const needsOnboarding = !profile || !profile.hasSeenWelcome;

    if (needsOnboarding && !isWelcome) {
      router.replace("/welcome");
    } else if (!needsOnboarding && isWelcome) {
      router.replace("/(tabs)");
    }
  }, [profile, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="welcome" />
      <Stack.Screen
        name="modals/add-product"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="modals/edit-product"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="modals/record-sale"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="modals/quick-add"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5],
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="modals/settings"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
              <RootNavigator />
            </AppProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

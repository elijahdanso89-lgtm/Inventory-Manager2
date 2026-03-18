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
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotificationToast from "@/components/NotificationToast";
import { Colors } from "@/constants/colors";
import { AppProvider, useApp } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.loadingLogo}
        resizeMode="contain"
      />
      <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 24 }} />
    </View>
  );
}

function RootNavigator() {
  const { authUser, isAuthLoaded, profile } = useApp();
  const segments = useSegments();

  useEffect(() => {
    if (!isAuthLoaded) return;

    const current = segments[0] as string | undefined;

    if (!authUser) {
      if (current !== "auth") router.replace("/auth");
      return;
    }

    const needsOnboarding = !profile || !profile.hasSeenWelcome;
    if (needsOnboarding) {
      if (current !== "welcome") router.replace("/welcome");
      return;
    }

    if (current === "auth" || current === "welcome" || current === undefined) {
      router.replace("/(tabs)");
    }
  }, [authUser, isAuthLoaded, profile, segments]);

  // Show branded loading screen while session is being read from storage
  if (!isAuthLoaded) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="auth" options={{ animation: "none" }} />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
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
        <Stack.Screen
          name="modals/notifications"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <NotificationToast />
    </>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingLogo: {
    width: 120,
    height: 120,
  },
});

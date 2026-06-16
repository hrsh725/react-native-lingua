import "../lib/polyfills";
import "../../global.css";

import { useEffect, useState } from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import * as Font from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, ClerkLoaded, useAuth } from "@/lib/clerk";
import { StreamProvider } from "@/components/StreamProvider";
import { useLanguageStore } from "@/store/languageStore";

function InitialLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoaded, isSignedIn } = useAuth();
  const { _hasHydrated } = useLanguageStore();

  useEffect(() => {
    if (!isLoaded || !_hasHydrated) return;

    const root = (segments && segments.length > 0) ? segments[0] : "";

    if (isSignedIn) {
      if (root === "onboarding" || root === "signin" || root === "signup" || root === "") {
        router.replace("/(tabs)");
      }
    } else {
      if (root !== "onboarding" && root !== "signin" && root !== "signup") {
        router.replace("/onboarding");
      }
    }
  }, [isLoaded, isSignedIn, segments, _hasHydrated]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = Font.useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (fontError) {
    console.error("Font Load Error:", fontError);
  }

  // Pure HTML fallback for Web to guarantee something shows up immediately
  if (Platform.OS === 'web' && !isClient) {
    return (
        <div style={{ backgroundColor: '#5B3BF6', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            <h1>Starting Lingua...</h1>
        </div>
    );
  }

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Resources...</Text>
      </View>
    );
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkLoaded>
        <StreamProvider>
          <InitialLayout />
          <StatusBar style="dark" />
        </StreamProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#5B3BF6",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});

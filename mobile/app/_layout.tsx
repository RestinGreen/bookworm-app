import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function RootLayout() {
  const { checkAuth, user, token } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait for segments to be available
    if (!segments) return;

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    console.log("Auth check:", { inAuthScreen, isSignedIn, segments });

    // Use requestAnimationFrame to ensure navigation happens after rendering
    requestAnimationFrame(() => {
      if (!isSignedIn && !inAuthScreen) {
        router.replace("/(auth)");
      } else if (isSignedIn && inAuthScreen) {
        router.replace("/(tabs)");
      }
    });

  }, [user, token, segments]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
        <AuthNavigator />
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

function AuthNavigator() {
  

  return null;
}

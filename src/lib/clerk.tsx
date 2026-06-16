/* eslint-disable react-hooks/rules-of-hooks */
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { View, Text, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Determine if we should use Mock Auth
const getIsMockMode = () => {
  const useMock = process.env.EXPO_PUBLIC_USE_MOCK_AUTH;
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (useMock === "true" || useMock === true) return true;
  if (!publishableKey || publishableKey.includes("placeholder")) return true;
  if (Platform.OS === 'web') return true; // Force mock for web stability

  return false;
};

export const isMockMode = getIsMockMode();

// Dynamic loader for real Clerk to avoid bundling crashes on Web
const getRealClerk = () => {
  if (isMockMode) return null;
  try {
    return require("@clerk/expo");
  } catch (e) {
    console.error("Failed to load @clerk/expo", e);
    return null;
  }
};

const RealClerk = getRealClerk();

interface MockAuthContextType {
  isSignedIn: boolean;
  setIsSignedIn: (val: boolean) => Promise<void>;
  userEmail: string;
  setUserEmail: (email: string) => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextType>({
  isSignedIn: false,
  setIsSignedIn: async () => {},
  userEmail: "",
  setUserEmail: async () => {},
});

export function MockClerkProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedInState] = useState(false);
  const [userEmail, setUserEmailState] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSignedIn = await AsyncStorage.getItem("mock_is_signed_in");
        const storedEmail = await AsyncStorage.getItem("mock_user_email");
        if (storedSignedIn === "true") {
          setIsSignedInState(true);
          setUserEmailState(storedEmail || "learner@example.com");
        }
      } catch (e) {
        console.error("Failed to load mock session", e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const setIsSignedIn = async (val: boolean) => {
    setIsSignedInState(val);
    await AsyncStorage.setItem("mock_is_signed_in", val ? "true" : "false");
  };

  const setUserEmail = async (email: string) => {
    setUserEmailState(email);
    await AsyncStorage.setItem("mock_user_email", email);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#5B3BF6", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Lingua Auth...</Text>
      </View>
    );
  }

  return (
    <MockAuthContext.Provider value={{ isSignedIn, setIsSignedIn, userEmail, setUserEmail }}>
      {children}
    </MockAuthContext.Provider>
  );
}

// Token Cache export (noop on web mock)
export const tokenCache = {
  getToken: async (key: string) => null,
  saveToken: async (key: string, value: string) => {},
};

// ClerkProvider Wrapper
export function ClerkProvider({
  children,
  publishableKey,
  tokenCache: cache,
}: {
  children: React.ReactNode;
  publishableKey: string;
  tokenCache?: any;
}) {
  if (isMockMode || !RealClerk) {
    return <MockClerkProvider>{children}</MockClerkProvider>;
  }
  return (
    <RealClerk.ClerkProvider publishableKey={publishableKey} tokenCache={cache}>
      {children}
    </RealClerk.ClerkProvider>
  );
}

// ClerkLoaded Wrapper
export function ClerkLoaded({ children }: { children: React.ReactNode }) {
  if (isMockMode || !RealClerk) {
    return <>{children}</>;
  }
  return <RealClerk.ClerkLoaded>{children}</RealClerk.ClerkLoaded>;
}

// useAuth Wrapper
export function useAuth() {
  if (!isMockMode && RealClerk) {
    return RealClerk.useAuth();
  }
   
  const { isSignedIn, setIsSignedIn } = useContext(MockAuthContext);
  return {
    isLoaded: true,
    isSignedIn,
    userId: isSignedIn ? "mock-user-123" : null,
    signOut: async () => { await setIsSignedIn(false); },
  } as any;
}

// useUser Wrapper
export function useUser() {
  if (!isMockMode && RealClerk) {
    return RealClerk.useUser();
  }
   
  const { isSignedIn, userEmail } = useContext(MockAuthContext);
  return {
    isLoaded: true,
    isSignedIn,
    user: isSignedIn ? {
      id: "mock-user-123",
      firstName: (userEmail || "Learner").split("@")[0],
      emailAddresses: [{ emailAddress: userEmail || "learner@example.com" }],
    } : null,
  } as any;
}

// useSignIn Wrapper
export function useSignIn() {
  if (!isMockMode && RealClerk) {
    return RealClerk.useSignIn();
  }
   
  const { setIsSignedIn, setUserEmail } = useContext(MockAuthContext);
  return {
    isLoaded: true,
    signIn: {
      create: async (params: any) => {
        if (params.identifier) await setUserEmail(params.identifier);
        return { status: "complete" };
      },
      attemptFirstFactor: async () => ({ status: "complete" }),
    },
    setActive: async () => { await setIsSignedIn(true); },
  } as any;
}

// useSignUp Wrapper
export function useSignUp() {
  if (!isMockMode && RealClerk) {
    return RealClerk.useSignUp();
  }
  return {
    isLoaded: true,
    signUp: {
      create: async () => ({ status: "complete" }),
      prepareEmailAddressVerification: async () => ({}),
      attemptEmailAddressVerification: async () => ({ status: "complete" }),
    },
    setActive: async () => {},
  } as any;
}

// Legacy exports
export const useSignInLegacy = useSignIn;
export const useSignUpLegacy = useSignUp;

// useOAuth Wrapper
export function useOAuth(params: any) {
  if (!isMockMode && RealClerk) {
    return RealClerk.useOAuth(params);
  }
  const { setIsSignedIn } = useContext(MockAuthContext);
  return {
    startOAuthFlow: async () => {
      await setIsSignedIn(true);
      return { createdSessionId: "mock-session" };
    },
  } as any;
}

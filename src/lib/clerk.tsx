/* eslint-disable react-hooks/rules-of-hooks */
import * as RealClerk from "@clerk/expo";
import * as RealClerkLegacy from "@clerk/expo/legacy";
import { tokenCache as realTokenCache } from "@clerk/expo/token-cache";
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Determine if we should use Mock Auth
const isMockMode =
  !process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("your_clerk") ||
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_test_Y2xlcmsubW9kZXJuLmFwcHMuZGV2JA");

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
    try {
      await AsyncStorage.setItem("mock_is_signed_in", val ? "true" : "false");
    } catch (e) {
      console.error(e);
    }
  };

  const setUserEmail = async (email: string) => {
    setUserEmailState(email);
    try {
      await AsyncStorage.setItem("mock_user_email", email);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return null;

  return (
    <MockAuthContext.Provider value={{ isSignedIn, setIsSignedIn, userEmail, setUserEmail }}>
      {children}
    </MockAuthContext.Provider>
  );
}

// Token Cache export
export const tokenCache = realTokenCache;

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
  if (isMockMode) {
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
  if (isMockMode) {
    return <>{children}</>;
  }
  return <RealClerk.ClerkLoaded>{children}</RealClerk.ClerkLoaded>;
}

// useAuth Wrapper
export function useAuth() {
  if (!isMockMode) {
    return RealClerk.useAuth();
  }
   
  const { isSignedIn, setIsSignedIn } = useContext(MockAuthContext);
  return {
    isLoaded: true,
    isSignedIn,
    userId: isSignedIn ? "mock-user-123" : null,
    signOut: async () => {
      await setIsSignedIn(false);
    },
  } as unknown as ReturnType<typeof RealClerk.useAuth>;
}

// useUser Wrapper
export function useUser() {
  if (!isMockMode) {
    return RealClerk.useUser();
  }
   
  const { isSignedIn, userEmail } = useContext(MockAuthContext);
  return {
    isLoaded: true,
    isSignedIn,
    user: isSignedIn
      ? {
          id: "mock-user-123",
          firstName: userEmail.split("@")[0] || "Learner",
          fullName: userEmail.split("@")[0] || "Learner",
          imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          emailAddresses: [{ emailAddress: userEmail }],
        }
      : null,
  } as unknown as ReturnType<typeof RealClerk.useUser>;
}

// useSignIn Wrapper
export function useSignIn() {
  if (!isMockMode) {
    return RealClerk.useSignIn();
  }
   
  const { setIsSignedIn, setUserEmail } = useContext(MockAuthContext);

  const signInMock = {
    status: "needs_first_factor",
    emailCode: {
      sendCode: async (params: { emailAddress: string }) => {
        await setUserEmail(params.emailAddress);
        return { error: null };
      },
      verifyCode: async (params: { code: string }) => {
        signInMock.status = "complete";
        return { error: null };
      },
    },
    finalize: async (params: { navigate: () => void }) => {
      await setIsSignedIn(true);
      params.navigate();
      return { error: null };
    },
    create: async (params: any) => {
      return { error: null };
    },
    reload: async (params: any) => {
      return { error: null };
    },
    firstFactorVerification: {
      status: "transferable",
      externalVerificationRedirectURL: "http://localhost:8081/oauth-native-callback",
    },
    createdSessionId: "mock-session-123",
  };

  return {
    signIn: signInMock,
    fetchStatus: "idle" as const,
    setActive: async (params: { session: string }) => {
      await setIsSignedIn(true);
    },
    isLoaded: true,
  } as unknown as ReturnType<typeof RealClerk.useSignIn>;
}

// useSignUp Wrapper
export function useSignUp() {
  if (!isMockMode) {
    return RealClerk.useSignUp();
  }
   
  const { setIsSignedIn, setUserEmail } = useContext(MockAuthContext);

  const signUpMock = {
    status: "needs_verification",
    password: async (params: { emailAddress: string; password?: string }) => {
      await setUserEmail(params.emailAddress);
      return { error: null };
    },
    verifications: {
      sendEmailCode: async () => {
        return { error: null };
      },
      verifyEmailCode: async (params: { code: string }) => {
        signUpMock.status = "complete";
        return { error: null };
      },
    },
    finalize: async (params: { navigate: () => void }) => {
      await setIsSignedIn(true);
      params.navigate();
      return { error: null };
    },
    create: async (params: any) => {
      return { error: null };
    },
    createdSessionId: "mock-session-123",
  };

  return {
    signUp: signUpMock,
    fetchStatus: "idle" as const,
    setActive: async (params: { session: string }) => {
      await setIsSignedIn(true);
    },
    isLoaded: true,
  } as unknown as ReturnType<typeof RealClerk.useSignUp>;
}

// useSignInLegacy Wrapper
export function useSignInLegacy() {
  if (!isMockMode) {
    return RealClerkLegacy.useSignIn();
  }
   
  const { setIsSignedIn, setUserEmail } = useContext(MockAuthContext);

  const signInMock = {
    status: "needs_first_factor",
    emailCode: {
      sendCode: async (params: { emailAddress: string }) => {
        await setUserEmail(params.emailAddress);
        return { error: null };
      },
      verifyCode: async (params: { code: string }) => {
        signInMock.status = "complete";
        return { error: null };
      },
    },
    finalize: async (params: { navigate: () => void }) => {
      await setIsSignedIn(true);
      params.navigate();
      return { error: null };
    },
    create: async (params: any) => {
      return { error: null };
    },
    reload: async (params: any) => {
      return { error: null };
    },
    firstFactorVerification: {
      status: "transferable",
      externalVerificationRedirectURL: "http://localhost:8081/oauth-native-callback",
    },
    createdSessionId: "mock-session-123",
  };

  return {
    signIn: signInMock,
    setActive: async (params: { session: string }) => {
      await setIsSignedIn(true);
    },
  } as unknown as ReturnType<typeof RealClerkLegacy.useSignIn>;
}

// useSignUpLegacy Wrapper
export function useSignUpLegacy() {
  if (!isMockMode) {
    return RealClerkLegacy.useSignUp();
  }
   
  const { setIsSignedIn, setUserEmail } = useContext(MockAuthContext);

  const signUpMock = {
    status: "needs_verification",
    password: async (params: { emailAddress: string; password?: string }) => {
      await setUserEmail(params.emailAddress);
      return { error: null };
    },
    verifications: {
      sendEmailCode: async () => {
        return { error: null };
      },
      verifyEmailCode: async (params: { code: string }) => {
        signUpMock.status = "complete";
        return { error: null };
      },
    },
    finalize: async (params: { navigate: () => void }) => {
      await setIsSignedIn(true);
      params.navigate();
      return { error: null };
    },
    create: async (params: any) => {
      return { error: null };
    },
    createdSessionId: "mock-session-123",
  };

  return {
    signUp: signUpMock,
  } as unknown as ReturnType<typeof RealClerkLegacy.useSignUp>;
}

// useOAuth Wrapper
export function useOAuth(params: { strategy: "oauth_google" | "oauth_facebook" | "oauth_apple" }) {
  if (!isMockMode) {
    return RealClerk.useOAuth(params);
  }
   
  const { setIsSignedIn, setUserEmail } = useContext(MockAuthContext);
  return {
    startOAuthFlow: async () => {
      await setUserEmail("social-learner@example.com");
      await setIsSignedIn(true);
      return {
        createdSessionId: "mock-session-oauth",
        setActive: async (setActiveParams: { session: string }) => {
          await setIsSignedIn(true);
        },
      };
    },
  } as unknown as ReturnType<typeof RealClerk.useOAuth>;
}

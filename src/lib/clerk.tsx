/* eslint-disable react-hooks/rules-of-hooks */
import * as RealClerk from "@clerk/expo";
import * as RealClerkLegacy from "@clerk/expo/legacy";
import { tokenCache as realTokenCache } from "@clerk/expo/token-cache";
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Determine if we should use Mock Auth
export const isMockMode =
  process.env.EXPO_PUBLIC_USE_MOCK_AUTH === "true" ||
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
          firstName: (userEmail || "learner@example.com").split("@")[0] || "Learner",
          fullName: (userEmail || "learner@example.com").split("@")[0] || "Learner",
          imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          emailAddresses: [{ emailAddress: userEmail || "learner@example.com" }],
        }
      : null,
  } as unknown as ReturnType<typeof RealClerk.useUser>;
}

// useSignIn Wrapper
export function useSignIn() {
  if (!isMockMode) {
    const { signIn, setActive, isLoaded, ...rest } = RealClerk.useSignIn() as any;
    const state = { current: signIn };
    const wrappedSignIn = signIn ? new Proxy(signIn, {
      get(target, prop, receiver) {
        if (prop === 'finalize') {
          return async (params: { navigate: () => void }) => {
            if (setActive && state.current.createdSessionId) {
              await setActive({ session: state.current.createdSessionId });
            }
            params.navigate();
            return { error: null };
          };
        }
        if (prop === 'emailCode') {
          return {
            sendCode: async (params: { emailAddress: string }) => {
              try {
                const res1 = await state.current.create({
                  identifier: params.emailAddress,
                });
                if (res1 && res1.error) {
                  return { error: res1.error };
                }
                state.current = res1;
                const res2 = await state.current.prepareFirstFactor({
                  strategy: 'email_code',
                  emailAddress: params.emailAddress,
                });
                if (res2 && res2.error) {
                  return { error: res2.error };
                }
                state.current = res2;
                return { error: null };
              } catch (err: any) {
                return { error: err };
              }
            },
            verifyCode: async (params: { code: string }) => {
              try {
                const res = await state.current.attemptFirstFactor({
                  strategy: 'email_code',
                  code: params.code,
                });
                if (res && res.error) {
                  return { error: res.error };
                }
                state.current = res;
                return { error: null, result: res };
              } catch (err: any) {
                return { error: err };
              }
            }
          };
        }
        const value = Reflect.get(state.current, prop, receiver);
        if (typeof value === 'function') {
          return value.bind(state.current);
        }
        return value;
      }
    }) : signIn;
    return {
      signIn: wrappedSignIn,
      setActive,
      isLoaded,
      ...rest
    } as unknown as ReturnType<typeof RealClerk.useSignIn>;
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
    create: async (params: { identifier: string; strategy?: string; password?: string }) => {
      await setUserEmail(params.identifier);
      if (params.strategy === "email_code") {
        signInMock.status = "needs_first_factor";
        return { status: "needs_first_factor", error: null };
      }
      signInMock.status = "complete";
      return { error: null, status: "complete" };
    },
    prepareFirstFactor: async (params: { strategy: string; emailAddress?: string }) => {
      signInMock.status = "needs_first_factor";
      return { status: "needs_first_factor", error: null };
    },
    attemptFirstFactor: async (params: { strategy: string; code: string }) => {
      if (params.code === "123456") {
        signInMock.status = "complete";
        return { status: "complete", createdSessionId: "mock-session-123" };
      }
      throw {
        errors: [{ longMessage: "Incorrect code. Please try again." }],
      };
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
    const { signUp, setActive, isLoaded, ...rest } = RealClerk.useSignUp() as any;
    const state = { current: signUp };
    const wrappedSignUp = signUp ? new Proxy(signUp, {
      get(target, prop, receiver) {
        if (prop === 'password') {
          return async (params: { emailAddress: string; password: string }) => {
            try {
              const res = await state.current.create({
                emailAddress: params.emailAddress,
                password: params.password,
              });
              if (res && res.error) {
                return { error: res.error };
              }
              state.current = res;
              return { error: null };
            } catch (err: any) {
              return { error: err };
            }
          };
        }
        if (prop === 'finalize') {
          return async (params: { navigate: () => void }) => {
            if (setActive && state.current.createdSessionId) {
              await setActive({ session: state.current.createdSessionId });
            }
            params.navigate();
            return { error: null };
          };
        }
        if (prop === 'verifications') {
          return {
            // Prepare (send) the email OTP
            sendEmailCode: async () => {
              try {
                const res = await state.current.prepareEmailAddressVerification({ strategy: 'email_code' });
                if (res && res.error) {
                  return { error: res.error };
                }
                state.current = res;
                return { error: null };
              } catch (err: any) {
                return { error: err };
              }
            },
            // Verify the OTP the user typed
            verifyEmailCode: async (params: { code: string }) => {
              try {
                const res = await state.current.attemptEmailAddressVerification({ code: params.code });
                if (res && res.error) {
                  return { error: res.error };
                }
                state.current = res;
                return { error: null, result: res };
              } catch (err: any) {
                return { error: err };
              }
            }
          };
        }
        const value = Reflect.get(state.current, prop, receiver);
        if (typeof value === 'function') {
          return value.bind(state.current);
        }
        return value;
      }
    }) : signUp;
    return {
      signUp: wrappedSignUp,
      setActive,
      isLoaded,
      ...rest
    } as unknown as ReturnType<typeof RealClerk.useSignUp>;
  }
   
  const { setIsSignedIn, setUserEmail } = useContext(MockAuthContext);

  const signUpMock = {
    status: "needs_verification",
    // Legacy mock method (kept for backward compat)
    password: async (params: { emailAddress: string; password?: string }) => {
      await setUserEmail(params.emailAddress);
      signUpMock.status = "needs_verification";
      return { error: null };
    },
    // Real Clerk API: called by signup.tsx
    create: async (params: { emailAddress?: string; password?: string }) => {
      if (params.emailAddress) await setUserEmail(params.emailAddress);
      signUpMock.status = "needs_verification";
      return { status: "needs_verification", error: null };
    },
    // Real Clerk API: sends OTP to email (mock — just returns success)
    prepareEmailAddressVerification: async (params: { strategy: string }) => {
      console.log("[MOCK] OTP would be sent to email. Use code: 123456");
      return { error: null };
    },
    // Real Clerk API: verifies the OTP code entered by user
    attemptEmailAddressVerification: async (params: { code: string }) => {
      if (params.code === "123456") {
        signUpMock.status = "complete";
        return { status: "complete", createdSessionId: "mock-session-123" };
      }
      throw {
        errors: [{ longMessage: "Incorrect code. Please try again." }],
      };
    },
    // Legacy verifications proxy support
    verifications: {
      sendEmailCode: async () => {
        return { error: null };
      },
      verifyEmailCode: async (params: { code: string }) => {
        if (params.code === "123456") {
          signUpMock.status = "complete";
          return { error: null };
        }
        return { error: { message: "Invalid OTP. Please try again." } };
      },
    },
    finalize: async (params: { navigate: () => void }) => {
      await setIsSignedIn(true);
      params.navigate();
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
    const { signIn, setActive, ...rest } = RealClerkLegacy.useSignIn() as any;
    const wrappedSignIn = signIn ? new Proxy(signIn, {
      get(target, prop, receiver) {
        if (prop === 'finalize') {
          return async (params: { navigate: () => void }) => {
            if (setActive && target.createdSessionId) {
              await setActive({ session: target.createdSessionId });
            }
            params.navigate();
            return { error: null };
          };
        }
        if (prop === 'emailCode') {
          return {
            sendCode: async (params: { emailAddress: string }) => {
              try {
                await target.create({
                  identifier: params.emailAddress,
                });
                await target.prepareFirstFactor({
                  strategy: 'email_code',
                  emailAddress: params.emailAddress,
                });
                return { error: null };
              } catch (err: any) {
                return { error: err };
              }
            },
            verifyCode: async (params: { code: string }) => {
              try {
                const result = await target.attemptFirstFactor({
                  strategy: 'email_code',
                  code: params.code,
                });
                return { error: null, result };
              } catch (err: any) {
                return { error: err };
              }
            }
          };
        }
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return value;
      }
    }) : signIn;
    return {
      signIn: wrappedSignIn,
      setActive,
      ...rest
    } as unknown as ReturnType<typeof RealClerkLegacy.useSignIn>;
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
    create: async (params: { identifier: string; strategy?: string; password?: string }) => {
      await setUserEmail(params.identifier);
      if (params.strategy === "email_code") {
        signInMock.status = "needs_first_factor";
        return { status: "needs_first_factor", error: null };
      }
      signInMock.status = "complete";
      return { error: null, status: "complete" };
    },
    prepareFirstFactor: async (params: { strategy: string; emailAddress?: string }) => {
      signInMock.status = "needs_first_factor";
      return { status: "needs_first_factor", error: null };
    },
    attemptFirstFactor: async (params: { strategy: string; code: string }) => {
      if (params.code === "123456") {
        signInMock.status = "complete";
        return { status: "complete", createdSessionId: "mock-session-123" };
      }
      throw {
        errors: [{ longMessage: "Incorrect code. Please try again." }],
      };
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
    const { signUp, setActive, ...rest } = RealClerkLegacy.useSignUp() as any;
    const wrappedSignUp = signUp ? new Proxy(signUp, {
      get(target, prop, receiver) {
        if (prop === 'password') {
          return async (params: { emailAddress: string; password: string }) => {
            try {
              await target.create({
                emailAddress: params.emailAddress,
                password: params.password,
              });
              return { error: null };
            } catch (err: any) {
              return { error: err };
            }
          };
        }
        if (prop === 'finalize') {
          return async (params: { navigate: () => void }) => {
            if (setActive && target.createdSessionId) {
              await setActive({ session: target.createdSessionId });
            }
            params.navigate();
            return { error: null };
          };
        }
        if (prop === 'verifications') {
          return {
            sendEmailCode: async () => {
              try {
                await target.prepareEmailAddressVerification({ strategy: 'email_code' });
                return { error: null };
              } catch (err: any) {
                return { error: err };
              }
            },
            verifyEmailCode: async (params: { code: string }) => {
              try {
                const result = await target.attemptEmailAddressVerification({ code: params.code });
                return { error: null, result };
              } catch (err: any) {
                return { error: err };
              }
            }
          };
        }
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return value;
      }
    }) : signUp;
    return {
      signUp: wrappedSignUp,
      setActive,
      ...rest
    } as unknown as ReturnType<typeof RealClerkLegacy.useSignUp>;
  }
   
  const { setIsSignedIn, setUserEmail } = useContext(MockAuthContext);

  const signUpMock = {
    status: "needs_verification",
    password: async (params: { emailAddress: string; password?: string }) => {
      await setUserEmail(params.emailAddress);
      signUpMock.status = "needs_verification";
      return { error: null };
    },
    verifications: {
      sendEmailCode: async () => {
        return { error: null };
      },
      verifyEmailCode: async (params: { code: string }) => {
        if (params.code === "123456") {
          signUpMock.status = "complete";
          return { error: null };
        }
        return { error: { message: "Invalid OTP. Please try again." } };
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

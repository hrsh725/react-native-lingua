import { images } from "@/constants/images";
import { useSignUp, useSignIn, isMockMode } from "@/lib/clerk";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function VerifyOtp() {
  const router = useRouter();
  const { email, flow } = useLocalSearchParams<{ email: string; flow?: "signup" | "signin" }>();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp() as any;
  const { signIn, isLoaded: isSignInLoaded } = useSignIn() as any;

  const isLoaded = flow === "signin" ? isSignInLoaded : isSignUpLoaded;

  const [otpText, setOtpText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Countdown timer
  const [timer, setTimer] = useState(60);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleVerify = useCallback(
    async (otpCode: string) => {
      if (!isLoaded || verifying) return;
      setVerifying(true);
      setVerificationError("");

      try {
        if (flow === "signin") {
          // Attempt email sign-in verification using the 6-digit OTP
          const result = await signIn.attemptFirstFactor({
            strategy: "email_code",
            code: otpCode,
          });

          if (result.status === "complete") {
            await signIn.finalize({
              navigate: () => {
                router.replace("/");
              },
            });
          } else {
            setVerificationError("Verification incomplete. Please try again.");
            setOtpText("");
            inputRef.current?.focus();
          }
        } else {
          // Attempt email address verification using the 6-digit OTP
          const result = await signUp.attemptEmailAddressVerification({
            code: otpCode,
          });

          if (result.status === "complete") {
            // Account verified — set the session active and navigate home
            await AsyncStorage.setItem("just_signed_up", "true");
            await signUp.finalize({
              navigate: () => {
                router.replace("/");
              },
            });
          } else {
            // Some extra step needed (rare)
            setVerificationError("Verification incomplete. Please try again.");
            setOtpText("");
            inputRef.current?.focus();
          }
        }
      } catch (err: any) {
        console.error("Verification error:", JSON.stringify(err, null, 2));
        const message =
          err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          err?.message ||
          "Invalid OTP. Please try again.";
        setVerificationError(message);
        setOtpText("");
        inputRef.current?.focus();
      } finally {
        setVerifying(false);
      }
    },
    [isLoaded, flow, signIn, signUp, verifying, router]
  );

  // Auto verify when all 6 digits are filled
  useEffect(() => {
    if (otpText.length === 6) {
      const t = setTimeout(() => {
        handleVerify(otpText);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [otpText, handleVerify]);

  const handleResend = async () => {
    if (!isLoaded || timer > 0 || resending) return;
    setResending(true);
    setVerificationError("");

    try {
      if (flow === "signin") {
        await signIn.create({
          identifier: email,
        });
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddress: email,
        });
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
      setTimer(60);
      setOtpText("");
      inputRef.current?.focus();
    } catch (err: any) {
      console.error("Resend error:", JSON.stringify(err, null, 2));
      setVerificationError(
        err?.errors?.[0]?.longMessage ||
          err?.message ||
          "Failed to resend verification code"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingVertical: 24, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6 max-w-[420px] mx-auto w-full justify-between"
        >
          <View>
            {/* Back Button */}
            <TouchableOpacity
              className="mb-6 w-10 h-10 items-start justify-center"
              onPress={() => router.back()}
            >
              <View style={styles.backArrow} />
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-6">
              <Text className="font-poppins-bold text-[32px] leading-[38px] text-text-primary">
                Verify Email
              </Text>
              <Text className="mt-2 text-[16px] text-text-secondary">
                We sent a 6-digit code to{"\n"}
                <Text className="font-poppins-semibold text-text-primary">
                  {email || "your email"}
                </Text>
              </Text>
            </View>

            {/* Mascot Illustration */}
            <View className="mb-8 items-center h-[130px]">
              <Image
                source={images.mascotAuth}
                style={{ width: 220, height: 130 }}
                resizeMode="contain"
              />
            </View>

            {/* 6-digit OTP Input Boxes */}
            <View className="relative">
              {/* Invisible real TextInput */}
              <TextInput
                ref={inputRef}
                value={otpText}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, "").slice(0, 6);
                  setOtpText(cleaned);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                textContentType="oneTimeCode"
                maxLength={6}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  zIndex: 1,
                }}
                caretHidden={true}
                editable={!verifying}
              />
              
              {/* Display boxes */}
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
                className="flex-row justify-center gap-2 mb-6"
              >
                {Array(6).fill(0).map((_, i) => {
                  const digit = otpText[i] || "";
                  const isBoxFocused = isFocused && (otpText.length === i || (otpText.length === 6 && i === 5));
                  return (
                    <View
                      key={i}
                      pointerEvents="none"
                      style={[
                        styles.input,
                        {
                          borderColor: verificationError
                            ? "#ef4444"
                            : isBoxFocused
                            ? "#6c4ef5"
                            : "#E5E7EB",
                        },
                      ]}
                    >
                      <Text style={styles.inputText}>
                        {digit}
                      </Text>
                    </View>
                  );
                })}
              </TouchableOpacity>
            </View>

            {/* Mock Mode Banner */}
            {isMockMode && (
              <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                <Text className="text-amber-850 font-poppins text-[14px] text-center leading-relaxed">
                  ✨ <Text className="font-poppins-semibold">Mock Mode</Text> is active. Use the verification code <Text className="font-poppins-bold text-amber-950 bg-amber-250/70 px-1.5 py-0.5 rounded-md">123456</Text> to verify your account.
                </Text>
              </View>
            )}

            {/* Developer Notice for Real Test Key */}
            {!isMockMode && !!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_") && (
              <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <Text className="text-blue-850 font-poppins text-[13px] text-center leading-relaxed">
                  💡 If you are not receiving the OTP in your email, you can enable Mock Authentication by adding <Text className="font-mono text-blue-900 bg-blue-100/60 px-1 rounded-md">EXPO_PUBLIC_USE_MOCK_AUTH=true</Text> to your <Text className="font-mono text-blue-900 bg-blue-100/60 px-1 rounded-md">.env</Text> file.
                </Text>
              </View>
            )}

            {/* Error Message */}
            {verificationError ? (
              <Text className="text-red-500 font-poppins text-[14px] text-center mb-6">
                {verificationError}
              </Text>
            ) : null}

            {/* Verification Status */}
            {verifying && (
              <Text className="text-text-secondary font-poppins text-[14px] text-center mb-6">
                Verifying...
              </Text>
            )}
          </View>

          {/* Resend OTP */}
          <View className="mb-8 items-center">
            {timer > 0 ? (
              <Text className="text-text-secondary font-poppins text-[15px]">
                Resend code in{" "}
                <Text className="font-poppins-semibold text-text-primary">
                  {timer}s
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text className="text-lingua-deep-purple font-poppins-semibold text-[15px]">
                  {resending ? "Sending..." : "Resend Verification Code"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#0D132B",
    transform: [{ rotate: "45deg" }],
    marginLeft: 4,
  },
  input: {
    flex: 1,
    maxWidth: 44,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: "#f6f7fb",
    justifyContent: "center",
    alignItems: "center",
  },
  inputText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0d132b",
    textAlign: "center",
  },
});

import "../../lib/polyfills";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "@/components/SymbolView";

// Safe dynamic SDK access to satisfy Rules of Hooks and prevent bundling crashes
const getSDK = () => {
    try {
        return require("@stream-io/video-react-native-sdk");
    } catch (e) {
        return null;
    }
};

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useLanguageStore } from "@/store/languageStore";
import { lessons } from "@/data/lessons";
import { images } from "@/constants/images";

// Helper to provide extended details (phrases, teacher, translations) for lessons
interface CallPhrase {
  id: string;
  text: string;
  translation: string;
  pronunciation: string;
  context: string;
}

interface TeacherContext {
  name: string;
  avatarUrl: string;
  scenario: string;
  initialMessage: string;
  phrases: CallPhrase[];
}

const getExtendedLessonData = (lessonId: string, languageId: string): TeacherContext => {
  const lesson = lessons.find((l) => l.id === lessonId);
  const langId = languageId || "es";

  const defaultTeachers: Record<string, { name: string; avatarUrl: string; scenario: string; initialMessage: string }> = {
    es: { name: "Sofía", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", scenario: "Practice ordering food & greetings at a local café.", initialMessage: "¡Hola! Bienvenidos. ¿Qué te pongo hoy?" },
    fr: { name: "Chloé", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", scenario: "Order croissants and coffee in standard French.", initialMessage: "Bonjour ! Bienvenue. Qu'est-ce que je vous sers ?" },
    ja: { name: "Kenji", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", scenario: "Learn to order green tea in Kyoto style.", initialMessage: "いらっしゃいませ！ご注文はお決まりですか？" },
    ko: { name: "Minjun", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", scenario: "Order an iced americano at a Seoul café.", initialMessage: "어서 오세요! 어떤 걸로 주문하시겠어요?" },
    de: { name: "Emma", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", scenario: "Order pretzels and local beverages in Munich.", initialMessage: "Hallo! Willkommen. Was möchtest du bestellen?" },
    default: { name: "Alex", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", scenario: "Practice everyday conversation scenarios.", initialMessage: "Hello! Welcome. How can I help you today?" },
  };

  const activeTeacher = defaultTeachers[langId] || defaultTeachers.default;
  const teacherName = lesson?.aiPrompt?.teacherName || activeTeacher.name;
  const avatarUrl = lesson?.aiPrompt?.avatarUrl || activeTeacher.avatarUrl;
  const initialMessage = lesson?.aiPrompt?.initialMessage || activeTeacher.initialMessage;
  const scenario = lesson?.aiPrompt?.scenarioDescription || activeTeacher.scenario;

  const defaultPhrases: Record<string, CallPhrase[]> = {
    es: [
      { id: "es-1", text: "¡Hola! Buenas tardes.", translation: "Hello! Good afternoon.", pronunciation: "OH-lah BWEH-nas TAR-dehs", context: "Polite greeting in the afternoon" },
      { id: "es-2", text: "Quiero un café con leche, por favor.", translation: "I want a coffee with milk, please.", pronunciation: "KYEH-ro oon kah-FEH kon LEH-cheh por fah-VOR", context: "Ordering coffee at a shop" },
      { id: "es-3", text: "La cuenta, por favor.", translation: "The bill, please.", pronunciation: "lah KWEHN-tah por fah-VOR", context: "Asking for the check politely" },
      { id: "es-4", text: "Muchas gracias, ¡adiós!", translation: "Thank you very much, goodbye!", pronunciation: "MOO-chahs GRAH-syahs ah-DYOHS", context: "Leaving the shop" },
    ],
    fr: [
        { id: "fr-1", text: "Bonjour, s'il vous plaît.", translation: "Hello, please.", pronunciation: "bohn-ZHOOR seel voo pleh", context: "Standard polite greeting" },
    ],
    ja: [
        { id: "ja-1", text: "こんにちは、お茶をお願いします。", translation: "Hello, green tea please.", pronunciation: "Konnichiwa, o-cha o onegai shimasu.", context: "Greeting and ordering tea" },
    ],
    ko: [
        { id: "ko-1", text: "안녕하세요! 커피 주세요.", translation: "Hello! Coffee, please.", pronunciation: "Annyeonghaseyo! Keopi juseyo.", context: "Greeting and ordering" },
    ],
    de: [
        { id: "de-1", text: "Hallo! Guten Tag.", translation: "Hello! Good day.", pronunciation: "Hallo! Goot-en Tahg.", context: "Standard german greeting" },
    ],
    default: [
      { id: "def-1", text: "Hello! How are you doing today?", translation: "Hello! How are you doing today?", pronunciation: "Hello! How are you doing today?", context: "General greeting" },
    ],
  };

  const phrases = (lesson?.phrases || lesson?.vocabList?.map(v => ({
      id: v.id,
      text: v.word,
      translation: v.translation,
      pronunciation: v.pronunciation || v.word,
      context: v.exampleSentence || `Vocabulary: ${v.word}`,
  })) || defaultPhrases[langId] || defaultPhrases.default) as CallPhrase[];

  return { name: teacherName, avatarUrl, scenario, initialMessage, phrases };
};

export default function AudioLessonScreen() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;
  return <AudioLessonContent />;
}

function AudioLessonContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedLanguageId, completeLesson } = useLanguageStore();

  // Rule of Hooks compliant SDK access
  const sdk = useMemo(() => getSDK(), []);
  const client = sdk?.useStreamVideoClient ? sdk.useStreamVideoClient() : null;
  const StreamCall = sdk?.StreamCall;

  const activeLanguageId = selectedLanguageId || "es";
  const lesson = lessons.find((l) => l.id === id);
  const teacherContext = getExtendedLessonData(id || "", activeLanguageId);

  const [call, setCall] = useState<any>(null);
  const [agentSessionId, setAgentSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "failed" | "ended">("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [speakingLevel, setSpeakingLevel] = useState<"Excellent" | "Great" | "Good" | "—">("Excellent");
  const [pronunciationLevel, setPronunciationLevel] = useState<"Excellent" | "Great" | "Good" | "—">("Great");
  const [grammarLevel, setGrammarLevel] = useState<"Excellent" | "Great" | "Good" | "—">("Good");
  const [isSimulatingSpeech, setIsSimulatingSpeech] = useState(false);
  const [simulationTextOverride, setSimulationTextOverride] = useState<string | null>(null);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);

  const statusScale = useSharedValue(1);
  const wave1 = useSharedValue(1);
  const wave2 = useSharedValue(1);
  const wave3 = useSharedValue(1);
  const micRipple = useSharedValue(1);

  const triggerAudioPlay = useCallback(() => {
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    setTimeout(() => setIsAudioPlaying(false), 2200);
  }, [isAudioPlaying]);

  const toggleMic = useCallback(() => setIsMuted((prev) => !prev), []);

  const handleSimulateSpeech = useCallback(() => {
    if (isMuted || isSimulatingSpeech) return;
    setIsSimulatingSpeech(true);
    setSimulationTextOverride("🎙️ Listening to your response...");
    setTimeout(() => {
      setSimulationTextOverride("🧠 Analyzing pronunciation...");
      setTimeout(() => {
        const levels: ("Excellent" | "Great" | "Good")[] = ["Excellent", "Great", "Good"];
        setSpeakingLevel(levels[Math.floor(Math.random() * levels.length)]);
        setPronunciationLevel(levels[Math.floor(Math.random() * levels.length)]);
        setGrammarLevel(levels[Math.floor(Math.random() * levels.length)]);
        setIsSimulatingSpeech(false);
        setSimulationTextOverride("🎉 Excellent Pronunciation! Waving back.");
        setTimeout(() => {
          setSimulationTextOverride(null);
          if (currentPhraseIndex < teacherContext.phrases.length - 1) {
            setCurrentPhraseIndex((prev) => prev + 1);
            triggerAudioPlay();
          } else {
            setSimulationTextOverride("✨ Phrase complete! Tap End Call to finish.");
            setTimeout(() => setSimulationTextOverride(null), 3000);
          }
        }, 2000);
      }, 1500);
    }, 1500);
  }, [isMuted, isSimulatingSpeech, currentPhraseIndex, teacherContext.phrases.length, triggerAudioPlay]);

  const animatedStatusDotStyle = useAnimatedStyle(() => ({ transform: [{ scale: statusScale.value }] }));
  const animatedWave1 = useAnimatedStyle(() => ({ transform: [{ scale: wave1.value }], opacity: isAudioPlaying ? 0.35 : 0 }));
  const animatedWave2 = useAnimatedStyle(() => ({ transform: [{ scale: wave2.value }], opacity: isAudioPlaying ? 0.25 : 0 }));
  const animatedWave3 = useAnimatedStyle(() => ({ transform: [{ scale: wave3.value }], opacity: isAudioPlaying ? 0.15 : 0 }));
  const animatedMicRipple = useAnimatedStyle(() => ({ transform: [{ scale: micRipple.value }], opacity: isSimulatingSpeech && !isMuted ? 1 - (micRipple.value - 1) / 0.8 : 0 }));

  const handleEndCall = useCallback(async () => {
    if (call) {
      if (agentSessionId) {
        await fetch("/api/agent/stop", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId: call.id, sessionId: agentSessionId }),
        }).catch(() => {});
      }
      await call.leave();
    }
    setStatus("ended");
    setShowCompletionOverlay(true);
  }, [call, agentSessionId]);

  const handleFinishLesson = useCallback(() => {
    if (lesson) completeLesson(lesson.id);
    setShowCompletionOverlay(false);
    router.replace("/(tabs)/learn");
  }, [lesson, completeLesson, router]);

  const playAudioSimulation = useCallback(() => triggerAudioPlay(), [triggerAudioPlay]);
  const handleTabNavigation = useCallback((tabRoute: string) => router.replace(tabRoute as any), [router]);

  // Unified call initialization
  useEffect(() => {
    if (!client || !lesson || call) return;

    let isMounted = true;
    let _callInstance: any = null;

    const initCall = async () => {
      try {
        setStatus("connecting");
        const callId = `lesson-${lesson.id}-${Math.random().toString(36).substring(7)}`;
        const callType = "audio_room";
        _callInstance = client.call(callType, callId);

        await _callInstance.join({ create: true, ring: false, notify: false });

        if (!isMounted) {
            _callInstance.leave().catch(() => {});
            return;
        }

        // Try to enable microphone but don't crash if it fails (fix for Web without mic)
        try {
            if (_callInstance.microphone) {
                await _callInstance.microphone.enable();
            }
        } catch (micErr) {
            console.warn("[Stream] Microphone access failed or denied. Proceeding in listen-only mode.", micErr);
        }

        if (isMounted) setCall(_callInstance);

        const response = await fetch("/api/agent/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callId, callType,
            lessonData: {
              lesson: lesson.title,
              language: activeLanguageId,
              goals: lesson.description,
              vocabulary: lesson.vocabList?.map(v => v.word) || [],
              phrases: teacherContext.phrases.map(p => p.text),
              teacherName: teacherContext.name,
              teacherPrompt: `You are ${teacherContext.name}. ${teacherContext.scenario} ${teacherContext.initialMessage}`,
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setAgentSessionId(data.session_id);
            setStatus("connected");
          }
        } else {
          throw new Error("Agent start failed");
        }
      } catch (err) {
        console.error("Call initialization failed:", err);
        if (isMounted) setStatus("failed");
      }
    };

    initCall();

    return () => {
        isMounted = false;
        if (_callInstance) {
            _callInstance.leave().catch(() => {});
        }
    };
  }, [client, lesson]); // Minimize dependencies to prevent 429 rate limit loops

  useEffect(() => {
    if (status === "connecting") statusScale.value = withRepeat(withTiming(1.3, { duration: 800 }), -1, true);
    else statusScale.value = withTiming(1);
  }, [status]);

  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (isAudioPlaying) {
      wave1.value = withRepeat(withTiming(1.6, { duration: 400 }), -1, true);
      wave2.value = withRepeat(withTiming(1.4, { duration: 500 }), -1, true);
      wave3.value = withRepeat(withTiming(1.5, { duration: 450 }), -1, true);
    } else {
      wave1.value = withTiming(1); wave2.value = withTiming(1); wave3.value = withTiming(1);
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    if (isSimulatingSpeech && !isMuted) micRipple.value = withRepeat(withTiming(1.8, { duration: 1000 }), -1, false);
    else micRipple.value = withTiming(1);
  }, [isSimulatingSpeech, isMuted]);

  useEffect(() => {
    if (status === "connected" && !isAudioPlaying && !isMuted && !isSimulatingSpeech && !simulationTextOverride) {
      const timer = setTimeout(() => handleSimulateSpeech(), 800);
      return () => clearTimeout(timer);
    }
  }, [status, isAudioPlaying, isMuted, isSimulatingSpeech, simulationTextOverride, handleSimulateSpeech]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!lesson) return null;

  const [hasResumedAudio, setHasResumedAudio] = useState(false);

  const uiContent = (
    <View style={{ flex: 1 }}>
      <AudioLessonUI
        status={status} callDuration={callDuration} lesson={lesson} teacherContext={teacherContext}
        isMuted={isMuted} toggleMic={toggleMic} isCameraOn={isCameraOn} setIsCameraOn={setIsCameraOn}
        showSubtitles={showSubtitles} setShowSubtitles={setShowSubtitles} isAudioPlaying={isAudioPlaying}
        triggerAudioPlay={triggerAudioPlay} currentPhraseIndex={currentPhraseIndex} setCurrentPhraseIndex={setCurrentPhraseIndex}
        simulationTextOverride={simulationTextOverride} speakingLevel={speakingLevel} pronunciationLevel={pronunciationLevel}
        grammarLevel={grammarLevel} isSimulatingSpeech={isSimulatingSpeech} showCompletionOverlay={showCompletionOverlay}
        handleEndCall={handleEndCall} handleFinishLesson={handleFinishLesson} playAudioSimulation={playAudioSimulation}
        handleTabNavigation={handleTabNavigation} animatedStatusDotStyle={animatedStatusDotStyle}
        animatedWave1={animatedWave1} animatedWave2={animatedWave2} animatedWave3={animatedWave3}
        animatedMicRipple={animatedMicRipple} formatTime={formatTime}
      />

      {Platform.OS === 'web' && status === 'connected' && !hasResumedAudio && (
        <TouchableOpacity
          onPress={() => {
            setHasResumedAudio(true);
            if (typeof window !== 'undefined' && (window as any).AudioContext) {
                const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
                ctx.resume();
            }
          }}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(91, 59, 246, 0.95)',
            zIndex: 10000,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <View className="bg-white p-8 rounded-[32px] items-center shadow-xl">
            <Text className="text-[48px] mb-4">🔊</Text>
            <Text className="font-poppins-bold text-[22px] text-center text-[#0D132B] mb-2">Ready to listen?</Text>
            <Text className="font-poppins-medium text-[15px] text-center text-[#6B7280] mb-8">Tap to start the audio and meet your teacher!</Text>
            <View className="bg-[#5B3BF6] px-10 py-4 rounded-2xl">
              <Text className="font-poppins-bold text-white text-[16px]">Start Lesson</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  if (call && StreamCall) {
    return <StreamCall call={call}>{uiContent}</StreamCall>;
  }

  return uiContent;
}

function AudioLessonUI({
  status, callDuration, lesson, teacherContext, isMuted, toggleMic, isCameraOn, setIsCameraOn,
  showSubtitles, setShowSubtitles, isAudioPlaying, triggerAudioPlay, currentPhraseIndex, setCurrentPhraseIndex,
  simulationTextOverride, speakingLevel, pronunciationLevel, grammarLevel, isSimulatingSpeech,
  showCompletionOverlay, handleEndCall, handleFinishLesson, playAudioSimulation, handleTabNavigation,
  animatedStatusDotStyle, animatedWave1, animatedWave2, animatedWave3, animatedMicRipple, formatTime,
}: any) {
  const router = useRouter();
  const currentPhrase = teacherContext.phrases[currentPhraseIndex] || teacherContext.phrases[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View className="flex-row items-center justify-between px-6 pt-4 pb-3 bg-white border-b border-neutral-100/30">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1 justify-center items-center">
              <SymbolView name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }} size={22} tintColor="#0D132B" />
            </TouchableOpacity>
            <View className="gap-0.5">
              <Text className="font-poppins-bold text-[18px] text-[#0D132B]">AI Teacher</Text>
              <View className="flex-row items-center gap-1.5">
                <Animated.View style={[styles.statusDot, { backgroundColor: status === "connected" ? "#21C16B" : status === "failed" ? "#EF4444" : "#FF8A00" }, animatedStatusDotStyle]} />
                <Text className="font-poppins-medium text-[13px] text-[#6B7280]">{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
              </View>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => setIsCameraOn(!isCameraOn)} activeOpacity={0.8} className="w-10 h-10 rounded-full border border-neutral-100 bg-white items-center justify-center">
              <SymbolView name={{ ios: isCameraOn ? "video.fill" : "video.slash.fill", android: isCameraOn ? "videocam" : "videocam_off", web: isCameraOn ? "videocam" : "videocam_off" }} size={16} tintColor="#0D132B" />
            </TouchableOpacity>
            <View className="w-10 h-10 rounded-full border border-neutral-100 bg-white items-center justify-center">
              <Text className="font-poppins-bold text-[14px] text-[#FF8A00]">12</Text>
            </View>
            <View className="w-10 h-10 rounded-full border border-neutral-100 bg-white items-center justify-center">
              <SymbolView name={{ ios: "person.crop.circle.fill", android: "account_circle", web: "account_circle" }} size={18} tintColor="#0D132B" />
            </View>
          </View>
        </View>

        <View className="flex-1 px-6 pt-3 pb-4 justify-between bg-[#F9FAFC]">
          <View className="flex-1 relative overflow-hidden rounded-[28px] bg-[#EAE8F7] shadow-sm">
            <Image source={{ uri: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80" }} style={StyleSheet.absoluteFill} blurRadius={Platform.OS === "web" ? 15 : 12} />
            <View style={StyleSheet.absoluteFill} className="bg-[#FAF8F5]/50" />
            <View className="flex-1 justify-end items-center relative overflow-hidden">
              <Image source={images.mascotWelcome} style={{ width: 220, height: 220, marginTop: "auto", marginBottom: 10 }} resizeMode="contain" />
            </View>
            <View className="absolute top-4 right-4 w-[76px] h-[104px] rounded-[16px] overflow-hidden border-2 border-white bg-neutral-800 shadow-sm shadow-black/10">
              {isCameraOn ? <Image source={{ uri: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80" }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : <View className="flex-1 items-center justify-center bg-neutral-800"><SymbolView name={{ ios: "video.slash.fill", android: "videocam_off", web: "videocam_off" }} size={18} tintColor="#D4D4D4" /></View>}
            </View>
            {isAudioPlaying && <View className="absolute top-4 left-4 flex-row items-center gap-1 bg-white/80 px-2.5 py-1.5 rounded-full border border-white/90"><Animated.View style={[styles.visualizerBar, { height: 12 }, animatedWave1]} /><Animated.View style={[styles.visualizerBar, { height: 18 }, animatedWave2]} /><Animated.View style={[styles.visualizerBar, { height: 10 }, animatedWave3]} /></View>}
            <View className="absolute bottom-6 left-4 right-4 bg-white rounded-[20px] p-4.5 shadow-md border border-neutral-100 flex-row items-center justify-between">
              <View className="flex-1 pr-3 gap-0.5">
                <Text className="font-poppins-bold text-[17px] text-[#0D132B] leading-tight">{simulationTextOverride ? simulationTextOverride : currentPhrase.text}</Text>
                {showSubtitles && !simulationTextOverride && (
                  <View className="mt-1 border-t border-neutral-50 pt-1">
                    <Text className="font-poppins-medium text-[12.5px] text-[#5B3BF6] leading-tight">{currentPhrase.pronunciation}</Text>
                    <Text className="font-poppins-regular text-[12.5px] text-[#6B7280] leading-tight mt-0.5">{currentPhrase.translation}</Text>
                  </View>
                )}
              </View>
              {!simulationTextOverride && <TouchableOpacity onPress={playAudioSimulation} activeOpacity={0.8} className="w-10 h-10 rounded-full bg-[#FAF9FF] border border-[#ECE9FC] items-center justify-center"><SymbolView name={{ ios: isAudioPlaying ? "speaker.wave.3.fill" : "speaker.wave.2", android: isAudioPlaying ? "volume_up" : "volume_down", web: isAudioPlaying ? "volume_up" : "volume_down" }} size={16} tintColor="#5B3BF6" /></TouchableOpacity>}
              <View style={styles.bubbleTail} className="absolute -bottom-2 right-12 w-4 h-4 bg-white" />
            </View>
          </View>

          <View className="flex-row justify-around items-center px-4 my-4">
            <View className="items-center gap-1.5">
              <TouchableOpacity onPress={() => setIsCameraOn(!isCameraOn)} activeOpacity={0.8} className={`w-[54px] h-[54px] rounded-full items-center justify-center shadow-xs border ${isCameraOn ? "bg-white border-neutral-100" : "bg-neutral-100 border-transparent"}`}><SymbolView name={{ ios: isCameraOn ? "video.fill" : "video.slash.fill", android: isCameraOn ? "videocam" : "videocam_off", web: isCameraOn ? "videocam" : "videocam_off" }} size={20} tintColor={isCameraOn ? "#0D132B" : "#8E94A8"} /></TouchableOpacity>
              <Text className="font-poppins-semibold text-[11px] text-[#8E94A8]">Camera</Text>
            </View>
            <View className="items-center gap-1.5">
              <View className="relative items-center justify-center">
                {isSimulatingSpeech && !isMuted && <Animated.View style={[styles.micRippleOverlayControls, animatedMicRipple]} />}
                <TouchableOpacity onPress={toggleMic} activeOpacity={0.8} className={`w-[54px] h-[54px] rounded-full items-center justify-center shadow-xs border ${isSimulatingSpeech && !isMuted ? "bg-[#5B3BF6] border-transparent" : !isMuted ? "bg-white border-neutral-100" : "bg-red-50 border-red-200"}`}><SymbolView name={{ ios: !isMuted ? "mic.fill" : "mic.slash.fill", android: !isMuted ? "mic" : "mic_off", web: !isMuted ? "mic" : "mic_off" }} size={20} tintColor={isSimulatingSpeech && !isMuted ? "#FFFFFF" : !isMuted ? "#0D132B" : "#EF4444"} /></TouchableOpacity>
              </View>
              <Text className="font-poppins-semibold text-[11px] text-[#8E94A8]">Mic</Text>
            </View>
            <View className="items-center gap-1.5">
              <TouchableOpacity onPress={() => setShowSubtitles(!showSubtitles)} activeOpacity={0.8} className={`w-[54px] h-[54px] rounded-full items-center justify-center shadow-xs border ${showSubtitles ? "bg-white border-neutral-100" : "bg-neutral-100 border-transparent"}`}><SymbolView name={{ ios: "character.duallanguage" as any, android: "translate", web: "translate" }} size={20} tintColor={showSubtitles ? "#0D132B" : "#8E94A8"} /></TouchableOpacity>
              <Text className="font-poppins-semibold text-[11px] text-[#8E94A8]">Subtitles</Text>
            </View>
            <View className="items-center gap-1.5">
              <TouchableOpacity onPress={handleEndCall} activeOpacity={0.85} className="w-[54px] h-[54px] rounded-full bg-[#EF4444] items-center justify-center shadow-md shadow-red-500/20"><SymbolView name={{ ios: "phone.down.fill", android: "call_end", web: "call_end" }} size={20} tintColor="#FFFFFF" /></TouchableOpacity>
              <Text className="font-poppins-semibold text-[11px] text-[#8E94A8]">End Call</Text>
            </View>
          </View>

          <View className="bg-white border border-neutral-100 rounded-[22px] p-4.5 flex-row justify-between shadow-xs mb-2">
            <View className="flex-1 items-center gap-1 border-r border-neutral-100"><Text className="font-poppins-semibold text-[12px] text-[#6B7280]">Speaking</Text><Text style={{ color: speakingLevel === "Excellent" ? "#21C16B" : speakingLevel === "Great" ? "#4D8BFF" : speakingLevel === "Good" ? "#9070FF" : "#8E94A8" }} className="font-poppins-bold text-[15px]">{speakingLevel}</Text></View>
            <View className="flex-1 items-center gap-1 border-r border-neutral-100"><Text className="font-poppins-semibold text-[12px] text-[#6B7280]">Pronunciation</Text><Text style={{ color: pronunciationLevel === "Excellent" ? "#21C16B" : pronunciationLevel === "Great" ? "#4D8BFF" : pronunciationLevel === "Good" ? "#9070FF" : "#8E94A8" }} className="font-poppins-bold text-[15px]">{pronunciationLevel}</Text></View>
            <View className="flex-1 items-center gap-1"><Text className="font-poppins-semibold text-[12px] text-[#6B7280]">Grammar</Text><Text style={{ color: grammarLevel === "Excellent" ? "#21C16B" : grammarLevel === "Great" ? "#4D8BFF" : grammarLevel === "Good" ? "#9070FF" : "#8E94A8" }} className="font-poppins-bold text-[15px]">{grammarLevel}</Text></View>
          </View>
        </View>

        <View style={styles.tabBar} className="border-t border-[#F3F4F6] bg-white flex-row justify-around items-center">
          <TouchableOpacity onPress={() => handleTabNavigation("/(tabs)")} className="items-center gap-1 py-1.5 flex-1"><SymbolView name={{ ios: "house", android: "home", web: "home" }} size={20} tintColor="#9CA3AF" /><Text className="font-poppins-medium text-[10px] text-[#9CA3AF]">Home</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabNavigation("/(tabs)/learn")} className="items-center gap-1 py-1.5 flex-1 relative"><SymbolView name={{ ios: "book.fill", android: "menu_book", web: "menu_book" }} size={20} tintColor="#5B3BF6" /><Text className="font-poppins-bold text-[10px] text-[#5B3BF6]">Learn</Text><View className="absolute bottom-1 w-6 h-0.5 bg-[#5B3BF6] rounded-full" /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabNavigation("/(tabs)/ai-teacher")} className="items-center gap-1 py-1.5 flex-1"><SymbolView name={{ ios: "cpu", android: "smart_toy", web: "smart_toy" }} size={20} tintColor="#9CA3AF" /><Text className="font-poppins-medium text-[10px] text-[#9CA3AF]">Teacher</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabNavigation("/(tabs)/chat")} className="items-center gap-1 py-1.5 flex-1"><SymbolView name={{ ios: "bubble.left", android: "chat_bubble", web: "chat_bubble" }} size={20} tintColor="#9CA3AF" /><Text className="font-poppins-medium text-[10px] text-[#9CA3AF]">Chat</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabNavigation("/(tabs)/profile")} className="items-center gap-1 py-1.5 flex-1"><SymbolView name={{ ios: "person", android: "person", web: "person" }} size={20} tintColor="#9CA3AF" /><Text className="font-poppins-medium text-[10px] text-[#9CA3AF]">Profile</Text></TouchableOpacity>
        </View>

        {showCompletionOverlay && (
          <View style={StyleSheet.absoluteFill} className="bg-black/60 items-center justify-center p-6 z-50">
            <View className="bg-white rounded-[28px] p-6 w-full max-w-[340px] items-center gap-4.5 shadow-xl border border-neutral-100">
              <Text className="text-[64px]">🎉</Text>
              <View className="items-center gap-1">
                <Text className="font-poppins-bold text-[24px] text-[#0D132B] text-center leading-tight">Lesson Complete!</Text>
                <Text className="font-poppins-medium text-[13.5px] text-[#6B7280] text-center">You successfully finished the AI Teacher audio session for:</Text>
                <Text className="font-poppins-bold text-[14.5px] text-[#5B3BF6] text-center mt-0.5">{lesson.title}</Text>
              </View>
              <View className="w-full bg-[#F6F7FB] rounded-2xl p-4 gap-2.5">
                <View className="flex-row justify-between items-center"><Text className="font-poppins-semibold text-[13px] text-[#6B7280]">Call Duration</Text><Text className="font-poppins-bold text-[14px] text-[#0D132B]">{formatTime(callDuration)}</Text></View>
                <View className="flex-row justify-between items-center border-t border-neutral-200/50 pt-2.5"><Text className="font-poppins-semibold text-[13px] text-[#6B7280]">XP Earned</Text><Text className="font-poppins-bold text-[14px] text-[#FF8A00]">+{lesson.xp} XP 🔥</Text></View>
              </View>
              <TouchableOpacity onPress={handleFinishLesson} activeOpacity={0.86} className="w-full h-13 bg-[#21C16B] rounded-[16px] items-center justify-center shadow-sm"><Text className="font-poppins-bold text-[15px] text-white">Continue</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, maxWidth: 420, width: "100%", alignSelf: "center", backgroundColor: "#FFFFFF" },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  bubbleTail: { transform: [{ rotate: "45deg" }], borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: "#F3F4F6" },
  visualizerBar: { width: 3.5, borderRadius: 2, backgroundColor: "#5B3BF6" },
  micRippleOverlayControls: { position: "absolute", width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(91, 59, 246, 0.2)" },
  tabBar: { height: 66 },
});

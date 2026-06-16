import React, { useEffect, useState } from "react";
import { Platform, View, Text } from "react-native";
import { useAuth, useUser } from "@/lib/clerk";
import { createStreamClient } from "@/lib/stream";

export function StreamProvider({ children }: { children: React.ReactNode }) {
  const [streamSDK, setStreamSDK] = useState<any>(null);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    try {
        const sdk = require("@stream-io/video-react-native-sdk");
        setStreamSDK(sdk);
    } catch (e) {
        console.warn("[StreamProvider] Failed to load SDK", e);
    }
  }, []);

  const auth = useAuth() || { isLoaded: false, isSignedIn: false, userId: null };
  const { isSignedIn, userId } = auth;

  const userRes = useUser();
  const user = userRes?.user;

  useEffect(() => {
    if (isSignedIn && userId && user) {
      let isMounted = true;

      const initClient = async () => {
        try {
          const streamClient = await createStreamClient(userId, user.fullName || userId);
          if (isMounted) {
            setClient(streamClient);
          }
        } catch (error) {
          console.error("[StreamProvider] Failed to initialize client:", error);
        }
      };

      initClient();

      return () => {
        isMounted = false;
        if (client) {
          client.disconnectUser();
        }
      };
    }
  }, [isSignedIn, userId, user]);

  const StreamVideo = streamSDK?.StreamVideo;

  if (!StreamVideo || !client) {
    return <>{children}</>;
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
}

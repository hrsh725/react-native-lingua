import { Platform } from "react-native";

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

export const createStreamClient = async (userId: string, userName: string) => {
  const user = {
    id: userId,
    name: userName,
  };

  // Fetch token from our Expo API route
  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Token API Error:", text);
    throw new Error(`Failed to fetch token: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Token API returned non-JSON response:", text);
    throw new Error("Token API returned invalid response format (HTML instead of JSON). This usually means the API route was not found.");
  }

  const { token } = await response.json();

  // Dynamic require to avoid top-level crashes on Web during evaluation
  const { StreamVideoClient } = require("@stream-io/video-react-native-sdk");

  const client = StreamVideoClient.getOrCreateInstance({
    apiKey,
    user,
    token,
  });

  return client;
};

import { StreamVideoClient } from "@stream-io/node-sdk";

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;
const AGENT_SERVER_URL = process.env.AGENT_SERVER_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const { callId, callType, lessonData } = await request.json();

    if (!callId || !callType || !lessonData) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = new StreamVideoClient(apiKey, apiSecret);

    // 1. Update the call with custom data and ensure agent has permissions
    // We give the agent 'admin' role so it can 'goLive' and publish audio/video.
    await client.video.getOrCreateCall({
      type: callType,
      id: callId,
      data: {
        members: [
          { user_id: "ai-teacher", role: "admin" },
        ],
        custom: {
          lesson: lessonData.lesson,
          language: lessonData.language,
          goals: lessonData.goals,
          vocabulary: lessonData.vocabulary,
          phrases: lessonData.phrases,
          teacherName: lessonData.teacherName,
          teacherPrompt: lessonData.teacherPrompt,
        },
      },
    });

    // 2. Proxy the request to the Vision Agent server to start a session
    const agentResponse = await fetch(`${AGENT_SERVER_URL}/calls/${callId}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        call_type: callType,
      }),
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error("Agent server error:", errorText);
      return Response.json({ error: "Failed to start agent session" }, { status: agentResponse.status });
    }

    const data = await agentResponse.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error starting agent:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

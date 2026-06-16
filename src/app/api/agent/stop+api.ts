const AGENT_SERVER_URL = process.env.AGENT_SERVER_URL || "http://localhost:8000";

export async function DELETE(request: Request) {
  try {
    const { callId, sessionId } = await request.json();

    if (!callId || !sessionId) {
      return Response.json({ error: "Missing callId or sessionId" }, { status: 400 });
    }

    // Proxy the request to the Vision Agent server to stop the session
    const agentResponse = await fetch(`${AGENT_SERVER_URL}/calls/${callId}/sessions/${sessionId}`, {
      method: "DELETE",
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error("Agent server error:", errorText);
      return Response.json({ error: "Failed to stop agent session" }, { status: agentResponse.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error stopping agent:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

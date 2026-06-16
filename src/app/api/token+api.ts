import { connect } from 'getstream';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      return Response.json({ error: "Missing API keys" }, { status: 500 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    // Using the extremely stable 'getstream' package for token generation.
    // This produces a valid JWT that works across Chat, Video, and Feeds.
    const client = connect(apiKey, apiSecret);

    // In getstream package, the method is createUserToken
    const token = client.createUserToken(userId);

    return Response.json({ token });
  } catch (error: any) {
    console.error("Error generating Stream token:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

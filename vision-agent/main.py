import os
import asyncio
from dotenv import load_dotenv
from vision_agents.core import Agent, Runner, AgentLauncher, User
from vision_agents.core.edge.call import Call
from vision_agents.plugins import openai, getstream

# Load environment variables
# Reuse STREAM_API_KEY/STREAM_API_SECRET from the parent .env
parent_env = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(parent_env)
# Load local .env for OPENAI_API_KEY and other agent-specific settings
load_dotenv()

async def create_agent(**kwargs) -> Agent:
    """
    Creates and configures the AI Language Teacher agent.
    """

    # Verify required environment variables
    openai_key = os.environ.get("OPENAI_API_KEY")
    stream_key = os.environ.get("STREAM_API_KEY")
    stream_secret = os.environ.get("STREAM_API_SECRET")

    if not all([openai_key, stream_key, stream_secret]):
        print("Warning: Missing required API keys in environment.")

    # 1. Configure the OpenAI Realtime model
    llm = openai.Realtime(
        api_key=openai_key,
        model="gpt-4o-realtime-preview",
    )

    # 2. Configure Stream Edge transport
    edge = getstream.Edge(
        api_key=stream_key,
        api_secret=stream_secret,
    )

    # 3. Initialize the Agent with a teacher identity and instructions
    agent = Agent(
        edge=edge,
        llm=llm,
        agent_user=User(id="ai-teacher", name="AI Teacher"),
        instructions=(
            "You are a warm, energetic, and deeply encouraging human language teacher. "
            "You aren't a robot; you're a passionate tutor who loves seeing students succeed. "
            "Your tone is bright, patient, and full of positive reinforcement. "
            "Speak mostly in English to guide the student. Introduce target-language words slowly, one at a time, "
            "always providing a clear English translation. Use short, natural sentences with contractions like "
            "'I'm' or 'we'll' to feel more conversational. "
            "Listen carefully to what the student says. If they struggle, give them a gentle hint and ask them to try again. "
            "If they succeed, celebrate with high energy! Adapt your next explanation based on their response. "
            "Keep every reply strictly to one or two conversational sentences. "
            "Stay 100% focused on the current lesson's goal, vocabulary, and phrases. Never drift off-topic."
        )
    )

    return agent

async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs):
    """
    Lifecycle method called when the agent joins a call.
    """
    print(f"Agent joining call: {call_type}/{call_id}")

    # 1. Get call details to read custom data
    try:
        call_details = await agent.edge.get_call(call_type, call_id)
        custom_data = call_details.get("call", {}).get("custom", {})

        lesson = custom_data.get("lesson", "Language Practice")
        language = custom_data.get("language", "English")
        teacher_name = custom_data.get("teacherName", "your teacher")
        teacher_prompt = custom_data.get("teacherPrompt", agent.instructions)
        vocabulary = custom_data.get("vocabulary", [])
        phrases = custom_data.get("phrases", [])

        # Update agent instructions with lesson context
        context_instructions = (
            f"{teacher_prompt}\n\n"
            f"Lesson Context:\n"
            f"- Topic: {lesson}\n"
            f"- Language: {language}\n"
            f"- Specific Words: {', '.join(vocabulary) if vocabulary else 'None'}\n"
            f"- Target Phrases: {', '.join(phrases) if phrases else 'None'}\n\n"
            "STRICT RULES:\n"
            "1. Only teach the Specific Words and Target Phrases listed above.\n"
            "2. Always translate target-language words into English immediately.\n"
            "3. Use a warm, human, high-energy tone with contractions.\n"
            "4. Keep replies to 1-2 conversational sentences.\n"
            "5. If the student repeats a word correctly, give energetic praise and move to the next item."
        )
        agent.instructions = context_instructions
    except Exception as e:
        print(f"Warning: Could not fetch call custom data: {e}")
        lesson = "Language Practice"

    # 2. Join the call session using the call type and id
    # Construct the call object using the agent's transport
    call = Call(type=call_type, id=call_id)

    async with agent.join(call) as session:
        # Greet the student using the teacher's identity
        await session.say(f"Hi! I'm {teacher_name}, and I'm so excited to practice {language} with you today! We're focusing on {lesson}. Ready to get started?")

        # Keep the agent running until the call ends
        await agent.finish()

if __name__ == "__main__":
    # Create the launcher with our factory and lifecycle methods
    launcher = AgentLauncher(create_agent=create_agent, join_call=join_call)

    # Start the CLI (supports 'run' for local dev and 'serve' for production)
    Runner(launcher).cli()

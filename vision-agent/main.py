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
            "You are a professional and encouraging AI language teacher. "
            "You always speak English to provide instructions, explanations, and corrections. "
            "Your goal is to help the user practice and learn their selected language. "
            "Provide helpful feedback on their pronunciation and grammar. "
            "Keep the conversation engaging and educational."
        )
    )

    return agent

async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs):
    """
    Lifecycle method called when the agent joins a call.
    """
    # Construct the call object
    call = Call(type=call_type, id=call_id)

    # Join the call session
    async with agent.join(call) as session:
        # Greet the student
        await session.say("Hello! I am your AI language teacher. Ready to practice?")

        # Keep the agent running until the call ends
        await agent.finish()

if __name__ == "__main__":
    # Create the launcher with our factory and lifecycle methods
    launcher = AgentLauncher(create_agent=create_agent, join_call=join_call)

    # Start the CLI (supports 'run' for local dev and 'serve' for production)
    Runner(launcher).cli()

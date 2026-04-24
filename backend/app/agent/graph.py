"""LangGraph pipeline wiring tools into a sequential processing graph."""

import logging

from langchain_core.language_models import BaseChatModel
from langgraph.graph import END, StateGraph

from app.agent.state import AgentState
from app.agent.tools import (
    analyze_transcript,
    extract_topics,
    generate_report,
    generate_timestamps,
)
from app.services.youtube import fetch_transcript, fetch_transcript_with_timestamps

logger = logging.getLogger(__name__)

STAGES = [
    "Fetching transcript",
    "Analyzing content",
    "Extracting topics",
    "Generating timestamps",
    "Generating report",
]


def _init_stages() -> list[dict]:
    """Create initial stage list with all stages pending."""
    return [{"name": name, "status": "pending"} for name in STAGES]


def _update_stage(stages: list[dict], name: str, status: str) -> list[dict]:
    """Return a new stages list with the specified stage updated."""
    return [{**s, "status": status} if s["name"] == name else s for s in stages]


def build_graph(llm: BaseChatModel) -> StateGraph:
    """Build the LangGraph processing pipeline.

    Args:
        llm: The LLM instance for agent tools.

    Returns:
        A compiled StateGraph ready for invocation.
    """

    async def fetch_transcript_node(state: AgentState) -> dict:
        """Fetch the video transcript and timestamped segments."""
        stage_name = STAGES[0]
        stages = _update_stage(state["stages"], stage_name, "running")

        try:
            max_len = state.get("max_transcript_length", 50000)
            transcript = fetch_transcript(state["video_id"], max_length=max_len)
            segments = fetch_transcript_with_timestamps(
                state["video_id"], max_length=max_len
            )

            stages = _update_stage(stages, stage_name, "completed")
            return {
                "transcript": transcript,
                "transcript_segments": segments,
                "stages": stages,
                "current_stage": STAGES[1],
            }
        except ValueError as e:
            stages = _update_stage(stages, stage_name, "failed")
            return {"error": str(e), "stages": stages}
        except Exception as e:
            logger.error("Failed to fetch transcript: %s", e)
            stages = _update_stage(stages, stage_name, "failed")
            return {"error": f"Failed to fetch transcript: {e}", "stages": stages}

    async def analyze_node(state: AgentState) -> dict:
        """Run transcript analysis."""
        stage_name = STAGES[1]
        stages = _update_stage(state["stages"], stage_name, "running")

        try:
            analysis = await analyze_transcript(state["transcript"], llm)
            stages = _update_stage(stages, stage_name, "completed")
            return {
                "analysis": analysis,
                "stages": stages,
                "current_stage": STAGES[2],
            }
        except Exception as e:
            logger.error("Analysis failed: %s", e)
            stages = _update_stage(stages, stage_name, "failed")
            return {"error": f"Analysis failed: {e}", "stages": stages}

    async def extract_topics_node(state: AgentState) -> dict:
        """Extract topics from transcript."""
        stage_name = STAGES[2]
        stages = _update_stage(state["stages"], stage_name, "running")

        try:
            topics = await extract_topics(state["transcript"], state["analysis"], llm)
            stages = _update_stage(stages, stage_name, "completed")
            return {
                "topics": topics,
                "stages": stages,
                "current_stage": STAGES[3],
            }
        except Exception as e:
            logger.error("Topic extraction failed: %s", e)
            stages = _update_stage(stages, stage_name, "failed")
            return {"error": f"Topic extraction failed: {e}", "stages": stages}

    async def generate_timestamps_node(state: AgentState) -> dict:
        """Generate timestamp mappings."""
        stage_name = STAGES[3]
        stages = _update_stage(state["stages"], stage_name, "running")

        try:
            timestamps = await generate_timestamps(
                state.get("transcript_segments", []), state["topics"], llm
            )
            stages = _update_stage(stages, stage_name, "completed")
            return {
                "timestamps": timestamps,
                "stages": stages,
                "current_stage": STAGES[4],
            }
        except Exception as e:
            logger.error("Timestamp generation failed: %s", e)
            stages = _update_stage(stages, stage_name, "failed")
            return {"error": f"Timestamp generation failed: {e}", "stages": stages}

    async def generate_report_node(state: AgentState) -> dict:
        """Generate the final markdown report."""
        stage_name = STAGES[4]
        stages = _update_stage(state["stages"], stage_name, "running")

        try:
            report = await generate_report(
                state["analysis"],
                state["topics"],
                state["timestamps"],
                state["url"],
                llm,
            )
            stages = _update_stage(stages, stage_name, "completed")
            return {"report": report, "stages": stages}
        except Exception as e:
            logger.error("Report generation failed: %s", e)
            stages = _update_stage(stages, stage_name, "failed")
            return {"error": f"Report generation failed: {e}", "stages": stages}

    def should_continue(state: AgentState) -> str:
        """Check if pipeline should continue or stop on error."""
        if state.get("error"):
            return END
        return "continue"

    graph = StateGraph(AgentState)

    graph.add_node("fetch_transcript", fetch_transcript_node)
    graph.add_node("analyze", analyze_node)
    graph.add_node("extract_topics", extract_topics_node)
    graph.add_node("generate_timestamps", generate_timestamps_node)
    graph.add_node("generate_report", generate_report_node)

    graph.set_entry_point("fetch_transcript")

    graph.add_conditional_edges(
        "fetch_transcript", should_continue, {"continue": "analyze", END: END}
    )
    graph.add_conditional_edges(
        "analyze", should_continue, {"continue": "extract_topics", END: END}
    )
    graph.add_conditional_edges(
        "extract_topics", should_continue, {"continue": "generate_timestamps", END: END}
    )
    graph.add_conditional_edges(
        "generate_timestamps",
        should_continue,
        {"continue": "generate_report", END: END},
    )
    graph.add_edge("generate_report", END)

    return graph.compile()


async def run_pipeline(
    url: str,
    video_id: str,
    llm: BaseChatModel,
    max_transcript_length: int = 50000,
) -> AgentState:
    """Run the full summarization pipeline.

    Args:
        url: The original YouTube URL.
        video_id: Extracted YouTube video ID.
        llm: The LLM instance.
        max_transcript_length: Max transcript character length.

    Returns:
        The final agent state with report or error.
    """
    graph = build_graph(llm)
    initial_state: AgentState = {
        "url": url,
        "video_id": video_id,
        "max_transcript_length": max_transcript_length,
        "stages": _init_stages(),
        "current_stage": STAGES[0],
    }

    result = await graph.ainvoke(initial_state)
    return result

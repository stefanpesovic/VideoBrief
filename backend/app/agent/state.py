"""LangGraph agent state definition."""

from typing import TypedDict


class StageState(TypedDict):
    """State for a single processing stage."""

    name: str
    status: str  # pending | running | completed | failed


class AgentState(TypedDict, total=False):
    """Full state flowing through the LangGraph pipeline."""

    # Input
    url: str
    video_id: str
    max_transcript_length: int

    # Transcript data
    transcript: str
    transcript_segments: list[dict]

    # LLM outputs
    analysis: str
    topics: str
    timestamps: str
    report: str

    # Stage tracking
    stages: list[StageState]
    current_stage: str

    # Error handling
    error: str

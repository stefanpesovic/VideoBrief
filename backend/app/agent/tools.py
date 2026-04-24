"""LangGraph agent tools for transcript analysis."""

import logging

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage

logger = logging.getLogger(__name__)


async def analyze_transcript(transcript: str, llm: BaseChatModel) -> str:
    """Extract key themes, sentiment, and structure from the transcript.

    Args:
        transcript: The full transcript text.
        llm: The LLM instance to use.

    Returns:
        Analysis text with themes, sentiment, and structure.
    """
    logger.info("Analyzing transcript (%d chars)", len(transcript))
    messages = [
        SystemMessage(
            content=(
                "You are a video content analyst. Analyze the following transcript and provide:\n"
                "1. **Key Themes**: The main themes and ideas discussed\n"
                "2. **Sentiment**: Overall tone (educational, entertaining, persuasive, etc.)\n"
                "3. **Structure**: How the content is organized (intro, main points, conclusion)\n"
                "4. **Target Audience**: Who this content is for\n\n"
                "Be concise and structured in your response."
            )
        ),
        HumanMessage(content=f"Transcript:\n{transcript}"),
    ]
    response = await llm.ainvoke(messages)
    return response.content


async def extract_topics(transcript: str, analysis: str, llm: BaseChatModel) -> str:
    """Identify and categorize main topics from the transcript.

    Args:
        transcript: The full transcript text.
        analysis: Prior analysis from analyze_transcript.
        llm: The LLM instance to use.

    Returns:
        Structured list of topics with descriptions.
    """
    logger.info("Extracting topics")
    messages = [
        SystemMessage(
            content=(
                "You are a content categorization expert. Based on the transcript and prior analysis, "
                "identify the main topics discussed. For each topic provide:\n"
                "1. **Topic Name**: A clear, concise name\n"
                "2. **Description**: Brief description of what was discussed\n"
                "3. **Key Points**: 2-3 bullet points of the most important takeaways\n\n"
                "List topics in the order they appear in the video."
            )
        ),
        HumanMessage(
            content=f"Prior Analysis:\n{analysis}\n\nTranscript:\n{transcript}"
        ),
    ]
    response = await llm.ainvoke(messages)
    return response.content


async def generate_timestamps(
    transcript_segments: list[dict], topics: str, llm: BaseChatModel
) -> str:
    """Map topics to approximate timestamps from transcript segments.

    Args:
        transcript_segments: List of dicts with 'text', 'start', 'duration'.
        topics: Extracted topics from extract_topics.
        llm: The LLM instance to use.

    Returns:
        Formatted timestamp mapping.
    """
    logger.info("Generating timestamps for %d segments", len(transcript_segments))
    segments_text = "\n".join(
        f"[{_format_time(seg['start'])}] {seg['text']}"
        for seg in transcript_segments[:200]
    )
    messages = [
        SystemMessage(
            content=(
                "You are a video timestamp expert. Given the timestamped transcript segments "
                "and identified topics, create a timestamp guide.\n\n"
                "Format each entry as:\n"
                "- **[MM:SS]** Topic or section name\n\n"
                "Include timestamps for: intro, each major topic transition, key moments, and conclusion. "
                "Use the actual timestamps from the transcript segments."
            )
        ),
        HumanMessage(
            content=f"Topics:\n{topics}\n\nTimestamped Transcript:\n{segments_text}"
        ),
    ]
    response = await llm.ainvoke(messages)
    return response.content


async def generate_report(
    analysis: str,
    topics: str,
    timestamps: str,
    video_url: str,
    llm: BaseChatModel,
) -> str:
    """Produce the final markdown summary report.

    Args:
        analysis: Analysis from analyze_transcript.
        topics: Topics from extract_topics.
        timestamps: Timestamps from generate_timestamps.
        video_url: Original YouTube video URL.
        llm: The LLM instance to use.

    Returns:
        Complete markdown report.
    """
    logger.info("Generating final report")
    messages = [
        SystemMessage(
            content=(
                "You are a professional content summarizer. Create a comprehensive, well-formatted "
                "markdown report for a YouTube video. The report should include:\n\n"
                "# Video Summary\n\n"
                "## Overview\n"
                "A 2-3 sentence executive summary.\n\n"
                "## Key Themes\n"
                "The main themes with brief explanations.\n\n"
                "## Topics Covered\n"
                "Detailed breakdown of each topic.\n\n"
                "## Timestamps\n"
                "Clickable timestamp guide.\n\n"
                "## Key Takeaways\n"
                "Top 3-5 actionable takeaways.\n\n"
                "Use clear markdown formatting with headers, bullet points, and bold text. "
                "Make timestamp links in the format [MM:SS](video_url&t=seconds)."
            )
        ),
        HumanMessage(
            content=(
                f"Video URL: {video_url}\n\n"
                f"Analysis:\n{analysis}\n\n"
                f"Topics:\n{topics}\n\n"
                f"Timestamps:\n{timestamps}"
            )
        ),
    ]
    response = await llm.ainvoke(messages)
    return response.content


def _format_time(seconds: float) -> str:
    """Format seconds into MM:SS string."""
    mins = int(seconds) // 60
    secs = int(seconds) % 60
    return f"{mins:02d}:{secs:02d}"

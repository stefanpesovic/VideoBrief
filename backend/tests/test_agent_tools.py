"""Tests for agent tools with mocked Groq LLM calls."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.agent.tools import (
    _format_time,
    analyze_transcript,
    extract_topics,
    generate_report,
    generate_timestamps,
)


@pytest.fixture
def mock_llm():
    """Create a mock LLM that returns predictable responses."""
    llm = AsyncMock()
    return llm


def _make_response(content: str):
    """Create a mock LLM response with .content attribute."""
    resp = MagicMock()
    resp.content = content
    return resp


class TestAnalyzeTranscript:
    """Tests for analyze_transcript tool."""

    @pytest.mark.asyncio
    async def test_returns_analysis(self, mock_llm):
        mock_llm.ainvoke.return_value = _make_response(
            "**Key Themes**: Technology\n**Sentiment**: Educational"
        )

        result = await analyze_transcript("Hello world transcript", mock_llm)

        assert "Key Themes" in result
        assert "Educational" in result
        mock_llm.ainvoke.assert_called_once()

    @pytest.mark.asyncio
    async def test_passes_transcript_in_message(self, mock_llm):
        mock_llm.ainvoke.return_value = _make_response("analysis")

        await analyze_transcript("specific transcript content here", mock_llm)

        call_args = mock_llm.ainvoke.call_args[0][0]
        assert any(
            "specific transcript content here" in msg.content for msg in call_args
        )

    @pytest.mark.asyncio
    async def test_includes_system_prompt(self, mock_llm):
        mock_llm.ainvoke.return_value = _make_response("analysis")

        await analyze_transcript("test", mock_llm)

        call_args = mock_llm.ainvoke.call_args[0][0]
        system_msg = call_args[0]
        assert "Key Themes" in system_msg.content


class TestExtractTopics:
    """Tests for extract_topics tool."""

    @pytest.mark.asyncio
    async def test_returns_topics(self, mock_llm):
        mock_llm.ainvoke.return_value = _make_response(
            "## Topic 1: Intro\nDescription of intro\n## Topic 2: Main\nDescription of main"
        )

        result = await extract_topics("transcript", "prior analysis", mock_llm)

        assert "Topic 1" in result
        assert "Topic 2" in result

    @pytest.mark.asyncio
    async def test_includes_prior_analysis(self, mock_llm):
        mock_llm.ainvoke.return_value = _make_response("topics")

        await extract_topics("transcript text", "my prior analysis", mock_llm)

        call_args = mock_llm.ainvoke.call_args[0][0]
        human_msg = call_args[1]
        assert "my prior analysis" in human_msg.content
        assert "transcript text" in human_msg.content


class TestGenerateTimestamps:
    """Tests for generate_timestamps tool."""

    @pytest.fixture
    def sample_segments(self):
        return [
            {"text": "Welcome to the video", "start": 0.0, "duration": 5.0},
            {"text": "Today we discuss AI", "start": 5.0, "duration": 4.0},
            {"text": "Let's dive into the topic", "start": 60.0, "duration": 3.0},
            {"text": "In conclusion", "start": 300.0, "duration": 5.0},
        ]

    @pytest.mark.asyncio
    async def test_returns_timestamps(self, mock_llm, sample_segments):
        mock_llm.ainvoke.return_value = _make_response(
            "- **[00:00]** Introduction\n- **[01:00]** AI Discussion\n- **[05:00]** Conclusion"
        )

        result = await generate_timestamps(sample_segments, "topics", mock_llm)

        assert "00:00" in result
        assert "01:00" in result

    @pytest.mark.asyncio
    async def test_formats_segments_with_timestamps(self, mock_llm, sample_segments):
        mock_llm.ainvoke.return_value = _make_response("timestamps")

        await generate_timestamps(sample_segments, "topics", mock_llm)

        call_args = mock_llm.ainvoke.call_args[0][0]
        human_msg = call_args[1]
        assert "[00:00]" in human_msg.content
        assert "[01:00]" in human_msg.content
        assert "[05:00]" in human_msg.content

    @pytest.mark.asyncio
    async def test_handles_empty_segments(self, mock_llm):
        mock_llm.ainvoke.return_value = _make_response("no timestamps")

        result = await generate_timestamps([], "topics", mock_llm)

        assert result == "no timestamps"


class TestGenerateReport:
    """Tests for generate_report tool."""

    @pytest.mark.asyncio
    async def test_returns_markdown_report(self, mock_llm):
        mock_llm.ainvoke.return_value = _make_response(
            "# Video Summary\n\n## Overview\nThis video covers AI."
        )

        result = await generate_report(
            "analysis",
            "topics",
            "timestamps",
            "https://youtube.com/watch?v=abc123",
            mock_llm,
        )

        assert "# Video Summary" in result
        assert "Overview" in result

    @pytest.mark.asyncio
    async def test_includes_all_inputs(self, mock_llm):
        mock_llm.ainvoke.return_value = _make_response("report")

        await generate_report(
            "my analysis",
            "my topics",
            "my timestamps",
            "https://youtube.com/watch?v=test123",
            mock_llm,
        )

        call_args = mock_llm.ainvoke.call_args[0][0]
        human_msg = call_args[1]
        assert "my analysis" in human_msg.content
        assert "my topics" in human_msg.content
        assert "my timestamps" in human_msg.content
        assert "https://youtube.com/watch?v=test123" in human_msg.content

    @pytest.mark.asyncio
    async def test_includes_video_url(self, mock_llm):
        mock_llm.ainvoke.return_value = _make_response("report")

        await generate_report(
            "a",
            "t",
            "ts",
            "https://youtube.com/watch?v=xyz789",
            mock_llm,
        )

        call_args = mock_llm.ainvoke.call_args[0][0]
        human_msg = call_args[1]
        assert "xyz789" in human_msg.content


class TestFormatTime:
    """Tests for _format_time helper."""

    def test_zero_seconds(self):
        assert _format_time(0.0) == "00:00"

    def test_seconds_only(self):
        assert _format_time(45.0) == "00:45"

    def test_minutes_and_seconds(self):
        assert _format_time(125.0) == "02:05"

    def test_large_value(self):
        assert _format_time(3661.0) == "61:01"

    def test_float_truncation(self):
        assert _format_time(90.7) == "01:30"

"""Tests for LangGraph pipeline with fully mocked dependencies."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.agent.graph import STAGES, _init_stages, _update_stage, run_pipeline


def _mock_llm_response(content: str):
    """Create a mock LLM response."""
    resp = MagicMock()
    resp.content = content
    return resp


@pytest.fixture
def mock_llm():
    """Create a mock LLM with predictable responses."""
    llm = AsyncMock()
    llm.ainvoke.side_effect = [
        _mock_llm_response("Analysis: themes and sentiment"),
        _mock_llm_response("Topics: topic1, topic2"),
        _mock_llm_response("Timestamps: [00:00] Intro"),
        _mock_llm_response("# Video Summary\nFull report here"),
    ]
    return llm


def _mock_snippet(text, start=0.0, duration=5.0):
    """Create a mock transcript snippet."""
    snippet = MagicMock()
    snippet.text = text
    snippet.start = start
    snippet.duration = duration
    return snippet


class TestInitStages:
    """Tests for _init_stages helper."""

    def test_creates_all_stages(self):
        stages = _init_stages()
        assert len(stages) == 5

    def test_all_stages_pending(self):
        stages = _init_stages()
        assert all(s["status"] == "pending" for s in stages)

    def test_stage_names_match(self):
        stages = _init_stages()
        names = [s["name"] for s in stages]
        assert names == STAGES


class TestUpdateStage:
    """Tests for _update_stage helper."""

    def test_updates_target_stage(self):
        stages = _init_stages()
        updated = _update_stage(stages, STAGES[0], "running")
        assert updated[0]["status"] == "running"

    def test_does_not_mutate_original(self):
        stages = _init_stages()
        _update_stage(stages, STAGES[0], "running")
        assert stages[0]["status"] == "pending"

    def test_leaves_other_stages_unchanged(self):
        stages = _init_stages()
        updated = _update_stage(stages, STAGES[0], "completed")
        assert all(s["status"] == "pending" for s in updated[1:])


class TestRunPipeline:
    """Tests for full pipeline execution with mocks."""

    @patch("app.agent.graph.fetch_transcript_with_timestamps")
    @patch("app.agent.graph.fetch_transcript")
    @pytest.mark.asyncio
    async def test_successful_pipeline(self, mock_fetch, mock_fetch_ts, mock_llm):
        mock_fetch.return_value = "Hello this is the transcript"
        mock_fetch_ts.return_value = [
            {"text": "Hello", "start": 0.0, "duration": 2.0},
            {"text": "this is", "start": 2.0, "duration": 3.0},
        ]

        result = await run_pipeline(
            url="https://youtube.com/watch?v=abc123",
            video_id="abc123",
            llm=mock_llm,
        )

        assert result.get("error") is None
        assert result["report"] == "# Video Summary\nFull report here"
        assert result["analysis"] == "Analysis: themes and sentiment"
        assert result["topics"] == "Topics: topic1, topic2"
        assert result["timestamps"] == "Timestamps: [00:00] Intro"

    @patch("app.agent.graph.fetch_transcript_with_timestamps")
    @patch("app.agent.graph.fetch_transcript")
    @pytest.mark.asyncio
    async def test_all_stages_completed(self, mock_fetch, mock_fetch_ts, mock_llm):
        mock_fetch.return_value = "transcript"
        mock_fetch_ts.return_value = []

        result = await run_pipeline(
            url="https://youtube.com/watch?v=abc123",
            video_id="abc123",
            llm=mock_llm,
        )

        assert all(s["status"] == "completed" for s in result["stages"])

    @patch("app.agent.graph.fetch_transcript_with_timestamps")
    @patch("app.agent.graph.fetch_transcript")
    @pytest.mark.asyncio
    async def test_transcript_error_stops_pipeline(
        self, mock_fetch, mock_fetch_ts, mock_llm
    ):
        mock_fetch.side_effect = ValueError("No transcript available")

        result = await run_pipeline(
            url="https://youtube.com/watch?v=abc123",
            video_id="abc123",
            llm=mock_llm,
        )

        assert "No transcript available" in result["error"]
        assert result["stages"][0]["status"] == "failed"
        assert result.get("report") is None
        mock_llm.ainvoke.assert_not_called()

    @patch("app.agent.graph.fetch_transcript_with_timestamps")
    @patch("app.agent.graph.fetch_transcript")
    @pytest.mark.asyncio
    async def test_llm_error_stops_pipeline(self, mock_fetch, mock_fetch_ts):
        mock_fetch.return_value = "transcript"
        mock_fetch_ts.return_value = []

        failing_llm = AsyncMock()
        failing_llm.ainvoke.side_effect = Exception("Rate limit exceeded")

        result = await run_pipeline(
            url="https://youtube.com/watch?v=abc123",
            video_id="abc123",
            llm=failing_llm,
        )

        assert "failed" in result["error"].lower() or "Rate limit" in result["error"]
        assert result.get("report") is None

    @patch("app.agent.graph.fetch_transcript_with_timestamps")
    @patch("app.agent.graph.fetch_transcript")
    @pytest.mark.asyncio
    async def test_pipeline_passes_max_transcript_length(
        self, mock_fetch, mock_fetch_ts, mock_llm
    ):
        mock_fetch.return_value = "transcript"
        mock_fetch_ts.return_value = []

        await run_pipeline(
            url="https://youtube.com/watch?v=abc123",
            video_id="abc123",
            llm=mock_llm,
            max_transcript_length=10000,
        )

        mock_fetch.assert_called_once_with("abc123", max_length=10000)

    @patch("app.agent.graph.fetch_transcript_with_timestamps")
    @patch("app.agent.graph.fetch_transcript")
    @pytest.mark.asyncio
    async def test_llm_called_four_times(self, mock_fetch, mock_fetch_ts, mock_llm):
        mock_fetch.return_value = "transcript"
        mock_fetch_ts.return_value = []

        await run_pipeline(
            url="https://youtube.com/watch?v=abc123",
            video_id="abc123",
            llm=mock_llm,
        )

        assert mock_llm.ainvoke.call_count == 4

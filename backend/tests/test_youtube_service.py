"""Tests for YouTube URL parsing and transcript fetching."""

from unittest.mock import MagicMock, patch

import pytest

from app.services.youtube import (
    extract_video_id,
    fetch_transcript,
    is_valid_youtube_url,
)


class TestExtractVideoId:
    """Tests for extract_video_id with all YouTube URL variants."""

    def test_standard_watch_url(self):
        assert (
            extract_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            == "dQw4w9WgXcQ"
        )

    def test_watch_url_with_extra_params(self):
        assert (
            extract_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120")
            == "dQw4w9WgXcQ"
        )

    def test_watch_url_v_not_first_param(self):
        assert (
            extract_video_id(
                "https://www.youtube.com/watch?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf&v=dQw4w9WgXcQ"
            )
            == "dQw4w9WgXcQ"
        )

    def test_short_url(self):
        assert extract_video_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"

    def test_short_url_with_params(self):
        assert extract_video_id("https://youtu.be/dQw4w9WgXcQ?t=120") == "dQw4w9WgXcQ"

    def test_embed_url(self):
        assert (
            extract_video_id("https://www.youtube.com/embed/dQw4w9WgXcQ")
            == "dQw4w9WgXcQ"
        )

    def test_v_url(self):
        assert (
            extract_video_id("https://www.youtube.com/v/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
        )

    def test_shorts_url(self):
        assert (
            extract_video_id("https://www.youtube.com/shorts/dQw4w9WgXcQ")
            == "dQw4w9WgXcQ"
        )

    def test_live_url(self):
        assert (
            extract_video_id("https://www.youtube.com/live/dQw4w9WgXcQ")
            == "dQw4w9WgXcQ"
        )

    def test_no_protocol(self):
        assert extract_video_id("youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"

    def test_http_protocol(self):
        assert (
            extract_video_id("http://www.youtube.com/watch?v=dQw4w9WgXcQ")
            == "dQw4w9WgXcQ"
        )

    def test_no_www(self):
        assert (
            extract_video_id("https://youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"
        )

    def test_invalid_url_returns_none(self):
        assert extract_video_id("https://example.com") is None

    def test_empty_string_returns_none(self):
        assert extract_video_id("") is None

    def test_random_text_returns_none(self):
        assert extract_video_id("not a url at all") is None

    def test_youtube_url_without_video_id(self):
        assert extract_video_id("https://www.youtube.com/") is None

    def test_whitespace_trimmed(self):
        assert extract_video_id("  https://youtu.be/dQw4w9WgXcQ  ") == "dQw4w9WgXcQ"

    def test_video_id_with_hyphens_and_underscores(self):
        assert extract_video_id("https://youtu.be/a-b_c1D2E3F") == "a-b_c1D2E3F"


class TestIsValidYoutubeUrl:
    """Tests for is_valid_youtube_url."""

    def test_valid_url(self):
        assert (
            is_valid_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ") is True
        )

    def test_invalid_url(self):
        assert is_valid_youtube_url("https://example.com") is False


def _make_snippet(text, start, duration):
    """Create a mock transcript snippet with attribute access."""
    snippet = MagicMock()
    snippet.text = text
    snippet.start = start
    snippet.duration = duration
    return snippet


def _make_fetched(snippets):
    """Create a mock FetchedTranscript with a snippets list."""
    fetched = MagicMock()
    fetched.snippets = snippets
    return fetched


class TestFetchTranscript:
    """Tests for fetch_transcript with mocked YouTube API."""

    @patch("app.services.youtube.YouTubeTranscriptApi.fetch")
    def test_successful_fetch(self, mock_fetch):
        mock_fetch.return_value = _make_fetched(
            [
                _make_snippet("Hello world", 0.0, 1.5),
                _make_snippet("this is a test", 1.5, 2.0),
            ]
        )

        result = fetch_transcript("dQw4w9WgXcQ")

        assert result == "Hello world this is a test"
        mock_fetch.assert_called_once_with("dQw4w9WgXcQ", languages=["en"])

    @patch("app.services.youtube.YouTubeTranscriptApi.fetch")
    def test_transcript_truncation(self, mock_fetch):
        mock_fetch.return_value = _make_fetched(
            [
                _make_snippet("a" * 100, 0.0, 5.0),
            ]
        )

        result = fetch_transcript("dQw4w9WgXcQ", max_length=50)

        assert len(result) == 50

    @patch("app.services.youtube.YouTubeTranscriptApi.fetch")
    def test_no_transcript_raises_value_error(self, mock_fetch):
        mock_fetch.side_effect = Exception("No transcript available")

        with pytest.raises(ValueError, match="No transcript available"):
            fetch_transcript("dQw4w9WgXcQ")

    @patch("app.services.youtube.YouTubeTranscriptApi.fetch")
    def test_subtitles_disabled_raises_value_error(self, mock_fetch):
        mock_fetch.side_effect = Exception("Subtitles are disabled for this video")

        with pytest.raises(ValueError, match="No transcript available"):
            fetch_transcript("dQw4w9WgXcQ")

    @patch("app.services.youtube.YouTubeTranscriptApi.fetch")
    def test_unexpected_error_propagates(self, mock_fetch):
        mock_fetch.side_effect = ConnectionError("Network error")

        with pytest.raises(ConnectionError):
            fetch_transcript("dQw4w9WgXcQ")

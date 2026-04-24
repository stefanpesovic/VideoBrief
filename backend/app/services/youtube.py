"""YouTube URL parsing and transcript fetching."""

import logging
import re

from youtube_transcript_api import YouTubeTranscriptApi

logger = logging.getLogger(__name__)

YOUTUBE_URL_PATTERNS = [
    re.compile(r"(?:https?://)?(?:www\.)?youtube\.com/watch\?.*v=([a-zA-Z0-9_-]{11})"),
    re.compile(r"(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{11})"),
    re.compile(r"(?:https?://)?(?:www\.)?youtube\.com/v/([a-zA-Z0-9_-]{11})"),
    re.compile(r"(?:https?://)?(?:www\.)?youtube\.com/shorts/([a-zA-Z0-9_-]{11})"),
    re.compile(r"(?:https?://)?youtu\.be/([a-zA-Z0-9_-]{11})"),
    re.compile(r"(?:https?://)?(?:www\.)?youtube\.com/live/([a-zA-Z0-9_-]{11})"),
]


def extract_video_id(url: str) -> str | None:
    """Extract YouTube video ID from various URL formats.

    Args:
        url: A YouTube URL string.

    Returns:
        The 11-character video ID, or None if the URL is not a valid YouTube URL.
    """
    url = url.strip()
    for pattern in YOUTUBE_URL_PATTERNS:
        match = pattern.search(url)
        if match:
            return match.group(1)
    return None


def is_valid_youtube_url(url: str) -> bool:
    """Check if a string is a valid YouTube URL."""
    return extract_video_id(url) is not None


def fetch_transcript(video_id: str, max_length: int = 50000) -> str:
    """Fetch the transcript for a YouTube video.

    Args:
        video_id: The YouTube video ID.
        max_length: Maximum character length for the transcript.

    Returns:
        The transcript text as a single string.

    Raises:
        ValueError: If no transcript is available.
        Exception: For other transcript fetching errors.
    """
    logger.info("Fetching transcript for video: %s", video_id)
    try:
        api = YouTubeTranscriptApi()
        fetched = api.fetch(video_id, languages=["en"])
        full_text = " ".join(snippet.text for snippet in fetched.snippets)

        if len(full_text) > max_length:
            logger.warning(
                "Transcript truncated from %d to %d chars", len(full_text), max_length
            )
            full_text = full_text[:max_length]

        return full_text
    except Exception as e:
        error_msg = str(e).lower()
        if (
            "no transcript" in error_msg
            or "subtitles" in error_msg
            or "disabled" in error_msg
        ):
            raise ValueError(
                "No transcript available for this video. "
                "Try a video with captions enabled."
            ) from e
        raise


def fetch_transcript_with_timestamps(
    video_id: str, max_length: int = 50000
) -> list[dict]:
    """Fetch the transcript with timestamps for a YouTube video.

    Args:
        video_id: The YouTube video ID.
        max_length: Maximum character length for the transcript.

    Returns:
        List of dicts with 'text', 'start', and 'duration' keys.

    Raises:
        ValueError: If no transcript is available.
    """
    logger.info("Fetching timestamped transcript for video: %s", video_id)
    try:
        api = YouTubeTranscriptApi()
        fetched = api.fetch(video_id, languages=["en"])
        segments = []
        total_chars = 0

        for snippet in fetched.snippets:
            if total_chars + len(snippet.text) > max_length:
                break
            segments.append(
                {
                    "text": snippet.text,
                    "start": snippet.start,
                    "duration": snippet.duration,
                }
            )
            total_chars += len(snippet.text)

        return segments
    except Exception as e:
        error_msg = str(e).lower()
        if (
            "no transcript" in error_msg
            or "subtitles" in error_msg
            or "disabled" in error_msg
        ):
            raise ValueError(
                "No transcript available for this video. "
                "Try a video with captions enabled."
            ) from e
        raise

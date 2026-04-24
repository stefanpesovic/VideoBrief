"""Summarize endpoint for YouTube video analysis."""

import asyncio
import logging

from fastapi import APIRouter, HTTPException

from app.agent.graph import run_pipeline
from app.models import StageInfo, SummarizeRequest, SummarizeResponse, VideoMetadata
from app.services.youtube import extract_video_id

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest) -> SummarizeResponse:
    """Summarize a YouTube video given its URL.

    Args:
        request: Request body containing the YouTube URL.

    Returns:
        SummarizeResponse with markdown report or error details.

    Raises:
        HTTPException: For invalid URLs (422), missing transcripts (404),
            rate limits (429), or timeouts (504).
    """
    from app import main as app_main

    settings = app_main.get_app_settings()
    llm = app_main.get_app_llm()

    video_id = extract_video_id(request.url)
    if not video_id:
        raise HTTPException(
            status_code=422,
            detail="Invalid YouTube URL. Please provide a valid YouTube video link.",
        )

    try:
        result = await asyncio.wait_for(
            run_pipeline(
                url=request.url,
                video_id=video_id,
                llm=llm,
                max_transcript_length=settings.MAX_TRANSCRIPT_LENGTH,
            ),
            timeout=settings.AGENT_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="The video is too long or complex. Try a shorter one.",
        )
    except Exception as e:
        error_msg = str(e).lower()
        if "rate" in error_msg and "limit" in error_msg:
            raise HTTPException(
                status_code=429,
                detail="I'm processing too many requests right now, please wait.",
                headers={"Retry-After": "30"},
            )
        logger.error("Pipeline error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again.",
        )

    if result.get("error"):
        error_msg = result["error"]
        if "no transcript" in error_msg.lower():
            raise HTTPException(
                status_code=404,
                detail="No transcript available for this video. Try a video with captions enabled.",
            )
        raise HTTPException(status_code=500, detail=error_msg)

    stages = [
        StageInfo(name=s["name"], status=s["status"]) for s in result.get("stages", [])
    ]

    return SummarizeResponse(
        status="success",
        markdown_report=result.get("report"),
        stages=stages,
        metadata=VideoMetadata(
            video_id=video_id,
            url=request.url,
        ),
    )

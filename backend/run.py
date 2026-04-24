"""Entry point for running the FastAPI server."""

import os

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:get_app", host="0.0.0.0", port=port, reload=True, factory=True)

import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { isValidYoutubeUrl } from "../utils/youtube";

const URLInput = forwardRef(function URLInput({ onSubmit, isLoading }, ref) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useImperativeHandle(ref, () => ({
    setUrl(newUrl) {
      setUrl(newUrl);
      setError("");
    },
    getUrl() {
      return url;
    },
  }));

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a YouTube URL");
      return;
    }
    if (!isValidYoutubeUrl(trimmed)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="glass p-2 flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 ml-2 shrink-0">
          <svg
            className="w-6 h-6 text-red-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          placeholder="Paste a YouTube URL..."
          disabled={isLoading}
          className="flex-1 bg-transparent text-white text-lg placeholder-gray-500 outline-none py-3 px-2 disabled:opacity-50"
          aria-label="YouTube URL"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 shrink-0"
        >
          {isLoading ? "Briefing..." : "Brief it"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-red-400 text-sm text-center" role="alert">
          {error}
        </p>
      )}
    </form>
  );
});

export default URLInput;

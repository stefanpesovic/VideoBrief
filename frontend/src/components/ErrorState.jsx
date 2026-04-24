import { motion } from "framer-motion";
import { SAMPLES } from "./SampleVideos";

function getErrorDisplay(error) {
  const lower = (error || "").toLowerCase();
  if (lower.includes("transcript") || lower.includes("caption")) {
    return {
      emoji: "\uD83C\uDFAC",
      headline: "No transcript available",
      subtext:
        "This video doesn't have captions enabled. Try a video with subtitles — tutorials, TED talks, and podcasts usually work well.",
    };
  }
  if (lower.includes("timeout") || lower.includes("too long")) {
    return {
      emoji: "\u23F1\uFE0F",
      headline: "Video too long or complex",
      subtext:
        "The AI agent ran out of time processing this video. Try a shorter video (under 30 minutes works best).",
    };
  }
  if (lower.includes("connect") || lower.includes("network")) {
    return {
      emoji: "\uD83D\uDD0C",
      headline: "Connection failed",
      subtext:
        "Could not reach the server. Check your internet connection and try again.",
    };
  }
  return {
    emoji: "\u26A0\uFE0F",
    headline: "Something went wrong",
    subtext: error || "An unexpected error occurred. Please try again.",
  };
}

export default function ErrorState({ error, onRetry, onSelectSample }) {
  const { emoji, headline, subtext } = getErrorDisplay(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 max-w-2xl mx-auto text-center"
    >
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{headline}</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{subtext}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors duration-200 mb-6"
        >
          Try again
        </button>
      )}

      {onSelectSample && (
        <div className="border-t border-white/10 pt-5 mt-2">
          <p className="text-gray-500 text-sm mb-3">
            Or try one of these instead
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.url}
                onClick={() => onSelectSample(sample.url)}
                className="glass glass-hover px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-all duration-200"
                aria-label={`Try: ${sample.label}`}
              >
                <span className="mr-1">{sample.emoji}</span>
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

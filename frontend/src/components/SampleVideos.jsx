import { motion } from "framer-motion";

const SAMPLES = [
  {
    label: "TED Talk on Grit",
    emoji: "\uD83C\uDF93",
    url: "https://www.youtube.com/watch?v=H14bBuluwB8",
  },
  {
    label: "Python in 100 Seconds",
    emoji: "\uD83D\uDCBB",
    url: "https://www.youtube.com/watch?v=x7X9w_GIm1s",
  },
  {
    label: "Productivity Podcast Clip",
    emoji: "\uD83C\uDF99\uFE0F",
    url: "https://www.youtube.com/watch?v=bOxW5RqhuqM",
  },
];

export default function SampleVideos({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-center mt-4"
    >
      <p className="text-gray-500 text-sm mb-3">or try one of these</p>
      <div className="flex flex-wrap justify-center gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample.url}
            onClick={() => onSelect(sample.url)}
            className="glass glass-hover px-4 py-2 text-sm text-gray-300 hover:text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-200"
            aria-label={`Try: ${sample.label}`}
          >
            <span className="mr-1.5">{sample.emoji}</span>
            Try: {sample.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export { SAMPLES };

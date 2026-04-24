import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function VideoPreview({ url }) {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!url) {
      setMeta(null);
      return;
    }

    let cancelled = false;

    async function fetchMeta() {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        );
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) setMeta(data);
      } catch {
        if (!cancelled) setMeta(null);
      }
    }

    fetchMeta();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!meta) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 flex items-center gap-4 max-w-2xl mx-auto mt-4"
    >
      <div className="relative shrink-0 rounded-lg overflow-hidden w-[120px] h-[68px] bg-gray-800">
        <img
          src={meta.thumbnail_url}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="w-6 h-6 text-white/80" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-white text-sm font-medium truncate">
          {meta.title}
        </h4>
        <p className="text-gray-500 text-xs truncate mt-0.5">
          {meta.author_name}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">
            Ready to analyze
          </span>
        </div>
      </div>
    </motion.div>
  );
}

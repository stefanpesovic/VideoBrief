import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";

const STORAGE_KEY = "videobrief_banner_dismissed";

export default function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  function handleDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // sessionStorage unavailable
    }
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="glass border-violet-500/30 p-4 flex items-start gap-3 max-w-3xl mx-auto">
            <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 flex-1">
              Portfolio demo project — works with most YouTube videos that have
              captions (tutorials, TED talks, podcasts). Music videos and
              region-locked content may not work. Powered by Groq's free tier.
            </p>
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-white transition-colors shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

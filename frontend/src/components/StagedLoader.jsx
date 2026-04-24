import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Circle, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: { icon: Circle, color: "text-gray-600" },
  running: { icon: Loader2, color: "text-violet-400" },
  completed: { icon: Check, color: "text-emerald-400" },
  failed: { icon: XCircle, color: "text-red-400" },
};

function StageItem({ stage }) {
  const isRunning = stage.status === "running";
  const isCompleted = stage.status === "completed";
  const config = STATUS_CONFIG[stage.status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-300 ${
        isRunning ? "glass glow-pulse" : ""
      } ${isCompleted ? "opacity-60" : ""}`}
    >
      <span className={`${config.color} shrink-0`}>
        <Icon
          className={`w-5 h-5 ${isRunning ? "animate-spin" : ""}`}
        />
      </span>
      <span
        className={`flex-1 text-sm ${
          isRunning
            ? "text-white font-medium"
            : isCompleted
              ? "text-gray-400"
              : "text-gray-500"
        }`}
      >
        {stage.name}
      </span>
      {stage.progress != null && (
        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stage.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
      {isCompleted && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        />
      )}
    </motion.li>
  );
}

export default function StagedLoader({ stages }) {
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const totalCount = stages.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="glass p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Shimmer progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 shimmer-bar"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      <AnimatePresence mode="popLayout">
        <ul className="space-y-1">
          {stages.map((stage) => (
            <StageItem key={stage.name} stage={stage} />
          ))}
        </ul>
      </AnimatePresence>

      <div className="mt-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
        <span>Agent is thinking</span>
        <span className="dot-animation" />
      </div>
    </div>
  );
}

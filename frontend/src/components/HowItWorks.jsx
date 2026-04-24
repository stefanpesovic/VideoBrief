import { motion } from "framer-motion";
import { Link, Cpu, FileText } from "lucide-react";

const STEPS = [
  {
    icon: Link,
    title: "Paste URL",
    description: "Any YouTube video with captions",
  },
  {
    icon: Cpu,
    title: "AI Agent Analyzes",
    description: "LangGraph orchestrates 5 specialized tools",
  },
  {
    icon: FileText,
    title: "Get Your Summary",
    description: "Copy, download, or share",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-8 max-w-3xl mx-auto">
      <h2 className="text-center text-gray-500 text-sm font-medium uppercase tracking-wider mb-8">
        How it works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Connecting line (desktop only) */}
        <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-violet-500/50 via-violet-400/30 to-violet-500/50 origin-left"
          />
        </div>

        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="text-center relative"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center border-violet-500/20">
              <step.icon className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-white font-semibold mb-1">{step.title}</h3>
            <p className="text-gray-500 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

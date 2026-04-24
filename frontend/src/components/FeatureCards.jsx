import { motion } from "framer-motion";
import { Target, Clock, Download } from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Smart Content Detection",
    description:
      "AI agent identifies tutorials, interviews, news, or educational content — adapts the report structure accordingly.",
  },
  {
    icon: Clock,
    title: "Clickable Timestamps",
    description:
      "Jump directly to key moments. Every timestamp links back to the exact second in the video.",
  },
  {
    icon: Download,
    title: "Copy & Download",
    description:
      "Export your summary as markdown. Share, save, or paste anywhere.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function FeatureCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto py-8">
      {FEATURES.map((feature, i) => (
        <motion.div
          key={feature.title}
          custom={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={cardVariants}
          className="group"
        >
          <div className="gradient-border rounded-2xl h-full">
            <div className="glass rounded-2xl p-6 h-full transition-transform duration-300 group-hover:-translate-y-1">
              <feature.icon className="w-8 h-8 text-violet-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </section>
  );
}

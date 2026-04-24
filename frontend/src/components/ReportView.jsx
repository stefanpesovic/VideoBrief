import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const TIMESTAMP_REGEX = /\[(\d{1,2}:\d{2})\]/;

function isTimestampLink(href) {
  return href && (href.includes("&t=") || href.includes("?t="));
}

const components = {
  h1: ({ children }) => (
    <h1 className="text-2xl md:text-3xl font-bold text-white mt-8 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl md:text-2xl font-semibold text-violet-300 mt-6 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-300 leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-2 mb-4 ml-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-300 flex gap-2">
      <span className="text-violet-400 shrink-0">&#x2022;</span>
      <span>{children}</span>
    </li>
  ),
  a: ({ href, children }) => {
    const text = typeof children === "string" ? children : "";
    if (isTimestampLink(href) || TIMESTAMP_REGEX.test(text)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded-full text-sm font-mono hover:bg-violet-600/50 transition-colors"
        >
          {children}
        </a>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet-400 hover:text-violet-300 underline transition-colors"
      >
        {children}
      </a>
    );
  },
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-white/10 text-violet-300 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className={`${className} block`} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="glass p-4 overflow-x-auto mb-4 text-sm">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-violet-500 pl-4 italic text-gray-400 mb-4">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
};

export default function ReportView({ markdown }) {
  if (!markdown) return null;

  return (
    <div className="glass p-6 md:p-8 max-w-3xl mx-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

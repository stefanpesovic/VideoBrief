import { getThumbnailUrl } from "../utils/youtube";

export default function VideoMetadata({ metadata }) {
  if (!metadata) return null;

  return (
    <div className="glass p-4 flex items-center gap-4 max-w-2xl mx-auto">
      <img
        src={getThumbnailUrl(metadata.video_id)}
        alt="Video thumbnail"
        className="w-24 h-auto rounded-lg shrink-0"
      />
      <div className="min-w-0">
        {metadata.title && (
          <h3 className="text-white font-medium truncate">{metadata.title}</h3>
        )}
        <a
          href={metadata.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 text-sm hover:text-violet-300 truncate block"
        >
          {metadata.url}
        </a>
      </div>
    </div>
  );
}

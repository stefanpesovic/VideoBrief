export default function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-500">
      <div className="text-6xl mb-4">
        <svg
          className="w-16 h-16 mx-auto text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </div>
      <p className="text-lg">Paste a YouTube URL to get started</p>
      <p className="text-sm mt-1 text-gray-600">
        Works with any video that has captions enabled
      </p>
    </div>
  );
}

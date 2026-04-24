import { useRef, useCallback } from "react";
import Hero from "./components/Hero";
import WelcomeBanner from "./components/WelcomeBanner";
import FeatureCards from "./components/FeatureCards";
import HowItWorks from "./components/HowItWorks";
import URLInput from "./components/URLInput";
import VideoPreview from "./components/VideoPreview";
import SampleVideos from "./components/SampleVideos";
import StagedLoader from "./components/StagedLoader";
import ReportView from "./components/ReportView";
import ReportActions from "./components/ReportActions";
import VideoMetadata from "./components/VideoMetadata";
import ErrorState from "./components/ErrorState";
import useSummarize from "./hooks/useSummarize";
import { isValidYoutubeUrl } from "./utils/youtube";

export default function App() {
  const { status, stages, report, metadata, error, summarize, reset } =
    useSummarize();
  const urlInputRef = useRef(null);

  const handleSampleSelect = useCallback(
    (url) => {
      if (urlInputRef.current) {
        urlInputRef.current.setUrl(url);
      }
      summarize(url);
    },
    [summarize]
  );

  const currentUrl = urlInputRef.current?.getUrl?.() || "";
  const showPreview =
    status === "idle" && currentUrl && isValidYoutubeUrl(currentUrl);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950/20 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <WelcomeBanner />
        <Hero />

        {status === "idle" && (
          <>
            <FeatureCards />
            <HowItWorks />
          </>
        )}

        <div className="mb-4">
          <URLInput
            ref={urlInputRef}
            onSubmit={summarize}
            isLoading={status === "processing"}
          />
        </div>

        {showPreview && <VideoPreview url={currentUrl} />}

        {status === "idle" && (
          <SampleVideos onSelect={handleSampleSelect} />
        )}

        {status === "processing" && (
          <div className="space-y-6 mt-6">
            {metadata && <VideoMetadata metadata={metadata} />}
            <StagedLoader stages={stages} />
          </div>
        )}

        {status === "error" && (
          <div className="mt-6">
            <ErrorState
              error={error}
              onRetry={reset}
              onSelectSample={handleSampleSelect}
            />
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 mt-6">
            {metadata && <VideoMetadata metadata={metadata} />}
            <ReportActions
              markdown={report}
              videoUrl={metadata?.url}
              videoTitle={metadata?.title}
            />
            <ReportView markdown={report} />
          </div>
        )}
      </div>
    </div>
  );
}

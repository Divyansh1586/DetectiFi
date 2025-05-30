import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const WebcamStreamer = ({ 
  apiBaseUrl,
  isWebcamActive, 
  onStartWebcam, 
  onStopWebcam, 
  isLoading, 
  filesSelectedCount // To disable start if files are pending processing
}) => {
  const webcamFeedRef = useRef(null);

  const handleStart = () => {
    if (filesSelectedCount > 0) {
      toast.info("Please clear selected files or process them before starting the webcam.");
      return;
    }
    onStartWebcam();
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-md">
      <h2 className="font-semibold text-xl mb-4 text-gray-700">Live Webcam Feed</h2>
      <div className="flex gap-4 mb-4">
        <Button 
          onClick={handleStart} 
          disabled={isLoading || isWebcamActive || filesSelectedCount > 0}
          className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
        >
          {isLoading && !isWebcamActive ? "Starting..." : "Start Webcam"}
        </Button>
        <Button 
          onClick={onStopWebcam} 
          disabled={isLoading || !isWebcamActive} // isLoading here refers to main processing, maybe a separate webcamLoading state?
          className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
        >
          {/* Consider a specific isLoadingWebcam if stopping takes time */}
          Stop Webcam
        </Button>
      </div>
      {isWebcamActive && (
        <div className="mt-4 border border-gray-300 rounded overflow-hidden bg-black aspect-video">
          <img 
              ref={webcamFeedRef} 
              src={`${apiBaseUrl}/process/webcam-start?t=${new Date().getTime()}`}
              alt="Webcam Feed - If blank, ensure FastAPI is running and webcam is accessible to it."
              className="w-full h-full object-contain"
              onError={(e) => { 
                  e.target.alt = "Error loading webcam feed. Check FastAPI server and webcam connection.";
                  toast.error("Webcam feed error. FastAPI might not be streaming or webcam isn't accessible.");
                  // Consider auto-stopping or providing a manual stop option even on error
                  // onStopWebcam(); // This might be too aggressive if it's a temporary glitch
              }}
          />
        </div>
      )}
      {!isWebcamActive && (
          <p className="text-sm text-gray-500 mt-2">
            Webcam is currently off. 
            {filesSelectedCount > 0 ? "Clear file selection or process files to enable webcam." : "Click \"Start Webcam\" to begin streaming."}
          </p>
      )}
    </div>
  );
};

export default WebcamStreamer; 
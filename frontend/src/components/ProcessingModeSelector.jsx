import React from 'react';
import { Button } from "@/components/ui/button";

const ProcessingModeSelector = ({ currentMode, onModeChange }) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h2 className="font-semibold text-xl mb-3 text-gray-700">Select Processing Type</h2>
      <div className="flex gap-4">
        <Button 
          onClick={() => onModeChange("image")} 
          variant={currentMode === "image" ? "default" : "outline"}
          className={currentMode === "image" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
        >
          Process Images
        </Button>
        <Button 
          onClick={() => onModeChange("video")} 
          variant={currentMode === "video" ? "default" : "outline"}
          className={currentMode === "video" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
        >
          Process Video
        </Button>
      </div>
    </div>
  );
};

export default ProcessingModeSelector; 
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const AnalysisDisplay = ({ 
  currentDisplayOutput,
  onAnalyzeWithGemini,
  onSaveAnalysis,
  hasFastApiOutput, // boolean: currentFastApiOutput !== null
  isLoading, // General loading (e.g., FastAPI processing)
  isAnalyzingWithGemini,
  isSaving,
  isWebcamActive
}) => {
  return (
    <div className="p-6 border rounded-lg bg-white shadow-md min-h-[300px] flex-grow flex flex-col">
      <h2 className="font-semibold text-xl mb-4 text-gray-700">Current Analysis Output</h2>
      <ScrollArea className="flex-grow mb-4 bg-gray-50 p-4 rounded-md min-h-[200px]">
          <pre className="text-gray-700 whitespace-pre-wrap text-sm ">{currentDisplayOutput}</pre>
      </ScrollArea>
      <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-gray-200">
        <Button 
          onClick={onAnalyzeWithGemini} 
          disabled={!hasFastApiOutput || isLoading || isAnalyzingWithGemini || isWebcamActive}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex-1"
        >
          {isAnalyzingWithGemini ? "Analyzing with AI..." : "Analyze with AI Assistant"}
        </Button>
        <Button 
          onClick={onSaveAnalysis} 
          disabled={!hasFastApiOutput || isLoading || isSaving || isWebcamActive}
          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 flex-1"
        >
          {isSaving ? "Saving..." : "Save Current Analysis"}
        </Button>
      </div>
    </div>
  );
};

export default AnalysisDisplay; 
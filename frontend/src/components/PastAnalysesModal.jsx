import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const PastAnalysesModal = ({ 
  isOpen, 
  onClose, 
  pastResults, 
  onDeleteAnalysis 
}) => {

  const renderYoloDetections = (detections) => {
    if (!detections || detections.length === 0) return null;
    return (
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-dark-border">
        <p className="text-sm font-semibold text-gray-700 dark:text-dark-text">Detected Objects ({detections.length}):</p>
        <ScrollArea className="max-h-32 mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <ul className="list-disc list-inside pl-4 text-xs text-gray-600 dark:text-dark-text-secondary">
            {detections.map((det, idx) => (
              <li key={idx}>{`${det.class} (${det.confidence.toFixed(2)}) at [${det.box_xyxy.map(c=>Math.round(c)).join(",")}]`}</li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    );
  };

  const renderClipClassification = (clipData) => {
    if (!clipData || !clipData.predicted_class) return null;
    return (
       <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
        <strong className="font-semibold text-gray-700 dark:text-dark-text">CLIP:</strong> {clipData.predicted_class} (Confidence: {clipData.crime_confidence?.toFixed(2) || 'N/A'})
      </p>
    );
  }

  const renderGeminiAnalysis = (geminiText) => {
    if (!geminiText) return null;
    return (
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
        <p className="text-sm font-semibold text-blue-600 dark:text-dark-primary">AI Assistant Analysis:</p>
        <ScrollArea className="max-h-40 mt-1">
          <pre className="text-xs text-gray-600 dark:text-dark-text-secondary whitespace-pre-wrap bg-blue-50 dark:bg-gray-700 p-3 rounded">
            {geminiText}
          </pre>
        </ScrollArea>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full h-[80vh] flex flex-col bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text border-gray-200 dark:border-dark-border shadow-2xl rounded-lg">
        <DialogHeader className="border-b dark:border-dark-border pb-4">
          <DialogTitle className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-dark-text">Previously Saved Analyses</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-2 md:pr-4 py-1">
          {pastResults && pastResults.length > 0 ? (
            <ul className="space-y-4 py-4">
              {pastResults.map((result) => (
                <li key={result._id} className="p-4 border dark:border-dark-border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-lg text-accent-red dark:text-dark-primary">
                        {(result.analysisType || 'Analysis').toUpperCase()}: {result.originalFilename || 'Webcam Snapshot'}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                    <Button 
                      variant="destructive"
                      size="sm" 
                      onClick={() => onDeleteAnalysis(result._id)}
                      className="bg-red-600 hover:bg-red-700 dark:bg-accent-red dark:hover:bg-red-500 text-white dark:text-dark-text transition-all duration-300"
                    >
                      Delete
                    </Button>
                  </div>
                  {result.resultSummary && 
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1 mb-2">
                        <strong className="font-semibold text-gray-700 dark:text-dark-text">Summary:</strong> {result.resultSummary}
                    </p>
                  }
                  
                  {renderYoloDetections(result.fastApiData?.yolo_detections || result.fastApiData?.yolo_detections_on_extracted_frames)}
                  {renderClipClassification(result.fastApiData?.clip_crime_classification || result.fastApiData?.clip_crime_classification_summary)}
                  {renderGeminiAnalysis(result.geminiAnalysisText)}

                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-gray-600 dark:text-dark-text-secondary text-center py-10 text-lg">No past results found.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Process and save some analyses to see them here.</p>
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="border-t dark:border-dark-border pt-4">
          <DialogClose asChild>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="dark:bg-dark-surface dark:text-dark-text dark:border-dark-border dark:hover:bg-gray-700 transition-colors duration-300"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PastAnalysesModal; 
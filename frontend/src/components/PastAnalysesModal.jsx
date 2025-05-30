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
    if (!detections || detections.length === 0) return null; // Or <p>No YOLO detections.</p>
    return (
      <div className="mt-2">
        <p className="text-sm font-semibold text-gray-700">Detected Objects ({detections.length}):</p>
        <ScrollArea className="max-h-32 mt-1">
          <ul className="list-disc list-inside pl-4 text-xs text-gray-600">
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
       <p className="text-sm text-gray-600 mt-1">
        <strong className="font-semibold">CLIP:</strong> {clipData.predicted_class} ({clipData.crime_confidence?.toFixed(2) || 'N/A'})
      </p>
    );
  }

  const renderGeminiAnalysis = (geminiText) => {
    if (!geminiText) return null;
    return (
      <div className="mt-2 pt-2 border-t border-gray-200">
        <p className="text-sm font-semibold text-blue-600">AI Assistant Analysis:</p>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-blue-50 p-2 rounded mt-1">
          {geminiText}
        </pre>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Previously Saved Analyses</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6">
          {pastResults.length > 0 ? (
            <ul className="space-y-4 py-4">
              {pastResults.map((result) => (
                <li key={result._id} className="p-4 border rounded-md bg-gray-50 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-lg text-red-700">
                        {result.analysisType.toUpperCase()}: {result.originalFilename || 'Webcam Snapshot'}
                      </h3>
                      <p className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => onDeleteAnalysis(result._id)}>Delete</Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1"><strong className="font-semibold">Summary:</strong> {result.resultSummary}</p>
                  
                  {renderYoloDetections(result.yoloDetections)}
                  {renderClipClassification(result.clipClassification)}
                  {renderGeminiAnalysis(result.geminiAnalysisText)}

                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center py-10">No past results found. Process and save some analyses to see them here.</p>
          )}
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PastAnalysesModal; 
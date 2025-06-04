import { useCallback, useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import profile from "../assets/profile.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getToken } from "@/lib/auth";
import axios from "axios";

// Import new components
import UserProfile from "./UserProfile";
import ProcessingModeSelector from "./ProcessingModeSelector";
import FileUploadArea from "./FileUploadArea";
import WebcamStreamer from "./WebcamStreamer";
import AnalysisDisplay from "./AnalysisDisplay";
import PastAnalysesModal from "./PastAnalysesModal";
import DarkModeToggle from "./DarkModeToggle";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ; // Backend API

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [pastAnalysisResults, setPastAnalysisResults] = useState([]); // Renamed for clarity
  const [currentFastApiOutput, setCurrentFastApiOutput] = useState(null); // Store raw FastAPI output for current processing
  const [currentGeminiOutput, setCurrentGeminiOutput] = useState(null); // Store Gemini output for current processing
  const [currentDisplayOutput, setCurrentDisplayOutput] = useState("No analysis performed yet."); // User-facing combined display
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [processingType, setProcessingType] = useState("image"); // 'image' or 'video'
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzingWithGemini, setIsAnalyzingWithGemini] = useState(false);
  const [showPastResultsModal, setShowPastResultsModal] = useState(false);

  const webcamFeedRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      console.log("User from localStorage:", storedUser);
      setUser(storedUser);
    }
    fetchPastResults();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (isWebcamActive) {
        handleStopWebcam();
      }
    };
  }, [navigate]);

  const fetchPastResults = async () => {
    try {
      const { data } = await axiosInstance.get('/results');
      setPastAnalysisResults(data);
    } catch (error) {
      console.error("Error fetching past results:", error);
      toast.error("Could not load past analysis results.");
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setCurrentFastApiOutput(null);
    setCurrentGeminiOutput(null);
    setCurrentDisplayOutput("New files selected. Process to see analysis.");
    const newFiles = acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
    if (processingType === "video") setFiles(newFiles.length > 0 ? [newFiles[0]] : []);
    else setFiles(newFiles);
  }, [processingType]);

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    if (files.length - 1 === 0) {
      setCurrentFastApiOutput(null);
      setCurrentGeminiOutput(null);
      setCurrentDisplayOutput("No analysis performed yet.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: processingType === "image" ? { "image/*": [] } : { "video/*": [] },
    multiple: processingType === "image",
  });

  const formatFastApiOutputForDisplay = (data) => {
    if (!data) return "No FastAPI data available.";
    let outputLines = [];

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.error) {
          outputLines.push(`File: ${item.filename}`);
          outputLines.push(`Error: ${item.error}`);
        } else {
          outputLines.push(`File: ${item.filename}`);
          if (item.yolo_detections && item.yolo_detections.length > 0) {
            outputLines.push(`YOLO Detections (${item.yolo_detections.length}):`);
            item.yolo_detections.forEach(det => {
              outputLines.push(`  - Class: ${det.class}, Confidence: ${det.confidence.toFixed(3)}, Box: [${det.box_xyxy.map(c => Math.round(c)).join(", ")}]`);
            });
          } else { outputLines.push("YOLO Detections: None"); }
          if (item.clip_crime_classification) {
            outputLines.push(`CLIP Classification: ${item.clip_crime_classification.predicted_class || 'N/A'} (Confidence: ${item.clip_crime_classification.crime_confidence?.toFixed(2) || 'N/A'})`);
          } else { outputLines.push("CLIP Classification: N/A"); }
        }
        outputLines.push("------------------------------------");
      });
      if (outputLines.length > 0) outputLines.pop(); // Remove last separator
    } else {
      outputLines.push(`File: ${data.filename || 'N/A'}`);
      if (data.yolo_detections_on_extracted_frames && data.yolo_detections_on_extracted_frames.length > 0) {
        outputLines.push(`YOLO Detections on Video Frames (${data.yolo_detections_on_extracted_frames.length}): First few frames shown...`);
        data.yolo_detections_on_extracted_frames.slice(0,3).forEach(frame_det => {
          outputLines.push(`  Frame: ${frame_det.frame_path}`);
          if(frame_det.yolo_objects && frame_det.yolo_objects.length > 0){
            frame_det.yolo_objects.forEach(obj => { outputLines.push(`    - Class: ${obj.class}, Conf: ${obj.confidence.toFixed(3)}, Box: [${obj.box_xyxy.map(c => Math.round(c)).join(", ")}]`); });
          } else { outputLines.push(`    No objects detected in this frame.`); }
        });
      } else if (data.yolo_detections && data.yolo_detections.length > 0) {
        outputLines.push(`YOLO Detections (${data.yolo_detections.length}):`);
        data.yolo_detections.forEach(det => { outputLines.push(`  - Class: ${det.class}, Conf: ${det.confidence.toFixed(3)}, Box: [${det.box_xyxy.map(c => Math.round(c)).join(", ")}]`); });
      } else { outputLines.push("YOLO Detections: None"); }
      if (data.clip_crime_classification_summary) {
        outputLines.push(`CLIP Summary: ${data.clip_crime_classification_summary.predicted_class || 'N/A'} (Conf: ${data.clip_crime_classification_summary.crime_confidence?.toFixed(2) || 'N/A'})`);
      } else if (data.clip_crime_classification) {
        outputLines.push(`CLIP Classification: ${data.clip_crime_classification.predicted_class || 'N/A'} (Conf: ${data.clip_crime_classification.crime_confidence?.toFixed(2) || 'N/A'})`);
      } else { outputLines.push("CLIP Classification: N/A"); }
    }
    return outputLines.join("\n").trim();
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error(`Please select an ${processingType} file first.`);
      return;
    }
    setIsLoading(true);
    setCurrentFastApiOutput(null);
    setCurrentGeminiOutput(null);
    setCurrentDisplayOutput(`Processing ${processingType} with FastAPI...`);

    const formData = new FormData();
    if (processingType === "image") files.forEach(file => formData.append("files", file));
    else formData.append("file", files[0]);

    const endpoint = processingType === "image" ? "/process/images" : "/process/video";

    try {
      const { data } = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setCurrentFastApiOutput(data.analysisData);
      let display = formatFastApiOutputForDisplay(data.analysisData);
      setCurrentDisplayOutput(display);
      toast.success(`${processingType.charAt(0).toUpperCase() + processingType.slice(1)} processed by FastAPI!`);
      fetchPastResults();
      setFiles([]);
    } catch (err) {
      console.error(err);
      setCurrentDisplayOutput(`Error during FastAPI processing: ${err.message}`);
      toast.error(err.message || `Processing ${processingType} failed.`);
    }
    setIsLoading(false);
  };

  const handleAnalyzeWithGemini = async () => {
    if (!currentFastApiOutput) {
      toast.error("No FastAPI analysis data available to send to Gemini. Process a file first.");
      return;
    }
    setIsAnalyzingWithGemini(true);
    setCurrentGeminiOutput(null);
    let existingDisplay = formatFastApiOutputForDisplay(currentFastApiOutput);
    setCurrentDisplayOutput(existingDisplay + "\n\nAnalyzing with AI Assistant (Gemini)...");

    try {
      const payload = {
        dataToAnalyze: currentFastApiOutput,
        analysisType: processingType,
        originalFilename: files.length > 0 ? (Array.isArray(currentFastApiOutput) ? currentFastApiOutput.map(f=>f.filename).join(", ") : currentFastApiOutput.filename) : "N/A",
      };
      
      const { data } = await axiosInstance.post('/analyze-with-gemini', payload);

      setCurrentGeminiOutput(data.geminiAnalysisText);
      setCurrentDisplayOutput(existingDisplay + `\n\n--- AI Assistant Analysis ---\n${data.geminiAnalysisText}`);
      toast.success("Analysis with AI Assistant successful!");
    } catch (err) {
      console.error(err);
      setCurrentDisplayOutput(existingDisplay + `\n\nError during AI Assistant analysis: ${err.message}`);
      toast.error(err.message || "AI Assistant analysis failed.");
    }
    setIsAnalyzingWithGemini(false);
  };

  const handleSaveAnalysis = async () => {
    if (!currentFastApiOutput) {
      toast.error("No analysis data to save. Process a file first.");
      return;
    }
    setIsSaving(true);
    try {
      let payload;
      if (Array.isArray(currentFastApiOutput)) {
        let allSaved = true;
        for (const singleImageResult of currentFastApiOutput) {
          payload = {
            analysisType: "image", // Explicitly image for array items
            originalFilename: singleImageResult.filename,
            fastApiData: singleImageResult,
            geminiAnalysisText: currentGeminiOutput,
          };
          
          await axiosInstance.post('/results', payload);
        }
        toast.success("All image analyses saved successfully!");
      } else {
        payload = {
          analysisType: processingType,
          originalFilename: currentFastApiOutput.filename || (files.length > 0 ? files[0].name : "N/A"),
          fastApiData: currentFastApiOutput,
          geminiAnalysisText: currentGeminiOutput,
        };
        
        await axiosInstance.post('/results', payload);
        toast.success("Analysis saved successfully!");
      }

      fetchPastResults();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save analysis.");
    }
    setIsSaving(false);
  };

  const handleDeleteAnalysis = async (resultId) => {
    console.log("Deleting analysis:", resultId);
    if (!window.confirm("Are you sure you want to delete this analysis?")) return;
    try {
      await axiosInstance.delete(`/results/${resultId}`);
      toast.success("Analysis deleted successfully!");
      fetchPastResults();
      if (showPastResultsModal) {
        const updatedResults = pastAnalysisResults.filter(r => r._id !== resultId);
        setPastAnalysisResults(updatedResults);
        if (updatedResults.length === 0) setShowPastResultsModal(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete analysis.");
    }
  };

  const handleStartWebcam = async () => {
    if (isWebcamActive || files.length > 0) {
      if(files.length > 0) toast.info("Clear file selection before starting webcam.");
      return;
    }
    setIsLoading(true);
    try {
      setIsWebcamActive(true);
      setCurrentDisplayOutput("Webcam feed started. Ensure FastAPI is running.");
      toast.success("Webcam stream initiated!");
    } catch (error) {
      setCurrentDisplayOutput(`Error starting webcam: ${error.message}`);
      toast.error(`Failed to start webcam: ${error.message}`);
      setIsWebcamActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopWebcam = async () => {
    if (!isWebcamActive) return;
    try {
      await axiosInstance.get('/process/webcam-stop');
      toast.success("Webcam stream stopped!");
    } catch (error) {
      console.error("Error stopping webcam:", error);
      toast.error(error.message || "Failed to stop webcam properly.");
    } finally {
      setIsWebcamActive(false);
      if (webcamFeedRef.current) webcamFeedRef.current.src = "";
      setCurrentDisplayOutput("Webcam feed stopped.");
    }
  };

  const renderDetectedObjects = (detections) => {
    if (!detections || detections.length === 0) return <p className="text-sm text-gray-500"></p>;
    return (
      <ul className="list-disc list-inside pl-4 mt-1 text-sm text-gray-600">
        {detections.slice(0, 5).map((det, index) => (
          <li key={index}>{`${det.class} (${det.confidence.toFixed(2)})`}</li>
        ))}
        {detections.length > 5 && <li>...and {detections.length - 5} more.</li>}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-background p-4 md:p-8 transition-colors duration-300 pt-20">
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300 animate-fade-in-up">
          Crime Analysis Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Button 
            variant="outline"
            onClick={() => setShowPastResultsModal(true)} 
            disabled={isLoading || isWebcamActive}
            className="dark:bg-dark-surface dark:text-dark-text dark:border-dark-border dark:hover:bg-gray-700 transition-all duration-300"
          >
            View Past Results
          </Button>
          {user && (
            <div className="relative" ref={dropdownRef}>
              <img
                src={user.picture || profile}
                alt="Profile"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full cursor-pointer border-2 border-gray-300 dark:border-dark-border hover:border-accent-red dark:hover:border-dark-primary transition-all duration-300"
                onClick={() => setDropdownOpen((prev) => !prev)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface border dark:border-dark-border rounded shadow-lg py-2 z-50 animate-fade-in-up">
                  <div className="px-4 py-3 text-sm text-gray-800 dark:text-dark-text border-b dark:border-dark-border">
                    Logged in as: <strong className="dark:text-dark-primary">{user.name || user.email || "User"}</strong>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-accent-red hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors duration-150"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <section className="animate-slide-in-left">
          <div className="mb-6 p-4 bg-white dark:bg-dark-surface rounded-lg shadow-lg dark:shadow-gray-900 transition-colors duration-300">
            <h2 className="font-semibold text-xl mb-3 text-gray-700 dark:text-dark-text">
              Select Processing Type
            </h2>
            <div className="flex gap-4">
              <Button 
                onClick={() => { setProcessingType("image"); setFiles([]); setCurrentFastApiOutput(null); setCurrentGeminiOutput(null); setCurrentDisplayOutput("Select files to process."); }}
                variant={processingType === "image" ? "default" : "outline"}
                className={`${processingType === "image" ? "bg-red-600 hover:bg-red-700 dark:bg-dark-primary dark:hover:bg-teal-400 text-white dark:text-dark-background" : "dark:text-dark-text dark:border-dark-border dark:hover:bg-gray-700"} transition-all duration-300`}
              >
                Process Images
              </Button>
              <Button 
                onClick={() => { setProcessingType("video"); setFiles([]); setCurrentFastApiOutput(null); setCurrentGeminiOutput(null); setCurrentDisplayOutput("Select files to process."); }}
                variant={processingType === "video" ? "default" : "outline"}
                className={`${processingType === "video" ? "bg-red-600 hover:bg-red-700 dark:bg-dark-primary dark:hover:bg-teal-400 text-white dark:text-dark-background" : "dark:text-dark-text dark:border-dark-border dark:hover:bg-gray-700"} transition-all duration-300`}
              >
                Process Video
              </Button>
            </div>
          </div>

          <div className="p-6 border dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface shadow-lg dark:shadow-gray-900 mb-6 transition-colors duration-300">
            <h2 className="font-semibold text-xl mb-4 text-gray-700 dark:text-dark-text">
              Upload {processingType === "image" ? "Images" : "Video"}
            </h2>
            <div
              {...getRootProps({
                className: `border-dashed border-2 p-6 text-center cursor-pointer rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:border-accent-red dark:hover:border-dark-primary transition-colors duration-150 ${isDragActive ? 'border-accent-red dark:border-dark-primary bg-red-50 dark:bg-teal-700' : 'border-gray-300 dark:border-dark-border'}`
              })}
            >
              <input {...getInputProps()} />
              <p className="text-gray-600 dark:text-dark-text-secondary">
                {isDragActive ? 
                  `Drop the ${processingType} here ...` : 
                  `Drag 'n' drop ${processingType === 'image' ? 'some image files' : 'a video file'} here, or click to select`
                }
              </p>
              {processingType === "image" && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Multiple images are allowed.</p>}
              {processingType === "video" && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Only a single video file is allowed.</p>}
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 dark:text-dark-text mb-2">Selected file(s):</h3>
                <div className="flex flex-wrap gap-4">
                  {files.map((file, index) => (
                    <div key={file.name + index} className="relative group animate-fade-in-up">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.preview}
                          alt={`preview ${file.name}`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-dark-border shadow-md transition-transform duration-300 group-hover:scale-105"
                          onLoad={() => URL.revokeObjectURL(file.preview)}
                        />
                      ) : (
                        <div className="w-24 h-24 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-dark-border p-2 shadow-md transition-transform duration-300 group-hover:scale-105">
                          <span className="text-xs text-gray-600 dark:text-dark-text-secondary truncate w-full text-center">{file.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      )}
                      <button
                        className="absolute -top-2 -right-2 bg-accent-red text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md hover:bg-red-700 dark:bg-dark-primary dark:text-dark-background dark:hover:bg-teal-400"
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button
              onClick={handleProcess}
              disabled={isLoading || files.length === 0 || isWebcamActive}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 dark:bg-dark-primary dark:hover:bg-teal-400 text-white dark:text-dark-background px-6 py-3 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {isLoading ? `Processing ${processingType}...` : `Process ${processingType.charAt(0).toUpperCase() + processingType.slice(1)} with FastAPI`}
            </Button>
          </div>
         
          <div className="p-6 border dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface shadow-lg dark:shadow-gray-900 transition-colors duration-300">
            <h2 className="font-semibold text-xl mb-4 text-gray-700 dark:text-dark-text">Live Webcam Feed</h2>
            <div className="flex gap-4 mb-4">
              <Button 
                onClick={handleStartWebcam} 
                disabled={isLoading || isWebcamActive || files.length > 0}
                className="bg-green-500 hover:bg-green-600 dark:bg-accent-teal dark:hover:bg-teal-400 text-white dark:text-dark-background disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {isLoading && !isWebcamActive ? "Starting..." : "Start Webcam"}
              </Button>
              <Button 
                onClick={handleStopWebcam} 
                disabled={isLoading || !isWebcamActive}
                className="bg-red-500 hover:bg-red-600 dark:bg-accent-red dark:hover:bg-red-700 text-white disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {isLoading && isWebcamActive ? "Stopping..." : "Stop Webcam"}
              </Button>
            </div>
            {isWebcamActive && (
              <div className="mt-4 border border-gray-300 dark:border-dark-border rounded overflow-hidden bg-black aspect-video shadow-inner animate-subtle-pulse">
                <img 
                    ref={webcamFeedRef} 
                    src={`${API_BASE_URL}/process/webcam-start?t=${new Date().getTime()}`}
                    alt="Webcam Feed - If blank, ensure FastAPI is running and webcam is accessible to it."
                    className="w-full h-full object-contain"
                    onError={(e) => { 
                        e.target.alt = "Error loading webcam feed. Check FastAPI server and webcam connection.";
                        toast.error("Webcam feed error. FastAPI might not be streaming or webcam isn't accessible.");
                    }}
                />
              </div>
            )}
             {!isWebcamActive && webcamFeedRef.current?.src && (
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-2">Webcam was active. Start again to view.</p>
            )}
            {!isWebcamActive && !webcamFeedRef.current?.src && (
                 <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-2">Webcam is currently off. Click "Start Webcam" to begin streaming.</p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-6 md:gap-8 animate-slide-in-left animation-delay-200">
          <div className="p-6 border dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface shadow-lg dark:shadow-gray-900 min-h-[300px] flex-grow flex flex-col transition-colors duration-300">
            <h2 className="font-semibold text-xl mb-4 text-gray-700 dark:text-dark-text">Current Analysis Output</h2>
            <ScrollArea className="flex-grow mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-md min-h-[200px] border dark:border-dark-border transition-colors duration-300">
                <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm ">{currentDisplayOutput}</pre>
            </ScrollArea>
            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
              <Button 
                onClick={handleAnalyzeWithGemini} 
                disabled={!currentFastApiOutput || isLoading || isAnalyzingWithGemini || isWebcamActive}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-accent-blue dark:hover:bg-blue-500 text-white dark:text-dark-text disabled:opacity-50 flex-1 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {isAnalyzingWithGemini ? "Analyzing with AI..." : "Analyze with AI Assistant"}
              </Button>
              <Button 
                onClick={handleSaveAnalysis} 
                disabled={!currentFastApiOutput || isLoading || isSaving || isWebcamActive}
                className="bg-green-600 hover:bg-green-700 dark:bg-accent-teal dark:hover:bg-teal-500 text-white dark:text-dark-text disabled:opacity-50 flex-1 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {isSaving ? "Saving..." : "Save Current Analysis"}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PastAnalysesModal 
        isOpen={showPastResultsModal}
        onClose={() => setShowPastResultsModal(false)}
        pastResults={pastAnalysisResults}
        onDeleteAnalysis={handleDeleteAnalysis}
      />
    </div>
  );
};

export default Dashboard;

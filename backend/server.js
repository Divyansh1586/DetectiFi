const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const connectDB = require("./config/db");
const AnalysisResult = require("./models/AnalysisResult");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
connectDB();

const app = express();

// CORS & Headers
app.use((req, res, next) => {
res.setHeader("Cross-Origin-Opener-Policy", "same-origin"); // ❌ Remove or disable this
res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/protected", require("./routes/protected"));

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI;
let geminiFlashModel;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  geminiFlashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("Gemini AI SDK initialized.");
} else {
  console.warn("GEMINI_API_KEY not found in .env. Gemini features will be disabled.");
}

// --- Modified Endpoints: Process Images/Video (No Auto-Save) ---

app.post("/api/process/images", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ msg: "No files uploaded." });
  }
  const formData = new FormData();
  req.files.forEach((file) => {
    formData.append("files", file.buffer, file.originalname);
  });
  try {
    const fastApiResponse = await axios.post(
      `${FASTAPI_BASE_URL}/process-images/`,
      formData,
      { headers: { ...formData.getHeaders() } }
    );
    // Return FastAPI data directly, no DB saving here
    res.json({ msg: "Files processed by FastAPI.", analysisData: fastApiResponse.data });
  } catch (error) {
    console.error("Error calling FastAPI for image processing:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      msg: "Image processing failed on backend.",
      error: error.response?.data || error.message,
    });
  }
});

app.post("/api/process/video", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No video file uploaded." });
  }
  const formData = new FormData();
  formData.append("file", req.file.buffer, req.file.originalname);
  try {
    const fastApiResponse = await axios.post(
      `${FASTAPI_BASE_URL}/process-video/`,
      formData,
      { headers: { ...formData.getHeaders() } }
    );
    // Return FastAPI data directly, no DB saving here
    res.json({ msg: "Video processed by FastAPI.", analysisData: fastApiResponse.data });
  } catch (error) {
    console.error("Error calling FastAPI for video processing:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      msg: "Video processing failed on backend.",
      error: error.response?.data || error.message,
    });
  }
});

// --- New Endpoint: Analyze with Gemini ---
app.post("/api/analyze-with-gemini", async (req, res) => {
  if (!geminiFlashModel) {
    return res.status(503).json({ msg: "Gemini AI not configured. API key missing?" });
  }
  const { dataToAnalyze, analysisType, originalFilename } = req.body; // dataToAnalyze is expected to be the JSON output from FastAPI

  if (!dataToAnalyze) {
    return res.status(400).json({ msg: "No data provided for Gemini analysis." });
  }

  try {
    // Construct a prompt for Gemini
    // You might want to customize this prompt much more based on the structure of dataToAnalyze
    let prompt = `Analyze the following crime scene analysis data and provide a concise summary and insights.\nType: ${analysisType}\nFilename: ${originalFilename || 'N/A'}\n\nData:\n${JSON.stringify(dataToAnalyze, null, 2)}\n\nFocus on potential threats, evidence, and noteworthy observations.`;
    
    if (analysisType === "image" && dataToAnalyze.yolo_detections) {
      prompt += `\n\nDetected objects in image:\n`;
      dataToAnalyze.yolo_detections.forEach(det => {
        prompt += `- ${det.class} (confidence: ${det.confidence}, box: ${det.box_xyxy.join(', ')})\n`;
      });
    }
    if (dataToAnalyze.clip_crime_classification) {
        prompt += `\nCLIP Crime Classification: ${dataToAnalyze.clip_crime_classification.predicted_class} (confidence: ${dataToAnalyze.clip_crime_classification.crime_confidence || 'N/A'})\n`;
    }

    // TODO: Replace this with your actual Gemini API call if you have a more specific need
    // For now, we use the initialized geminiFlashModel
    const result = await geminiFlashModel.generateContent(prompt);
    const response = result.response;
    const geminiText = response.text();

    res.json({ msg: "Analysis with Gemini successful.", geminiAnalysisText: geminiText });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ msg: "Gemini analysis failed.", error: error.message });
  }
});

// --- New/Modified Endpoints for Results DB operations ---

// Save an analysis result (can include FastAPI output and Gemini output)
app.post("/api/results", async (req, res) => {
  try {
    const { analysisType, resultSummary, yoloDetections, clipClassification, originalFilename, fastApiData, geminiAnalysisText } = req.body;

    if (!analysisType || !fastApiData) { // fastApiData is the core data
        return res.status(400).json({ msg: "Missing required fields for saving result (analysisType, fastApiData)." });
    }

    // Construct a more detailed summary if not provided explicitly
    let summary = resultSummary;
    if (!summary) {
        if (analysisType === 'image') {
            summary = `Image: ${originalFilename || 'N/A'}. YOLO: ${fastApiData.yolo_detections?.length || 0} objects. CLIP: ${fastApiData.clip_crime_classification?.predicted_class || 'N/A'}.`;
        } else if (analysisType === 'video') {
            summary = `Video: ${originalFilename || 'N/A'}. CLIP: ${fastApiData.clip_crime_classification_summary?.predicted_class || 'N/A'}. YOLO frames: ${fastApiData.yolo_detections_on_extracted_frames?.length || 0}.`;
        } else {
            summary = `Processed: ${originalFilename || 'N/A'}`;
        }
        if (geminiAnalysisText) {
            summary += ` Gemini: Analyzed.`;
        }
    }

    const newResult = new AnalysisResult({
      analysisType,
      resultSummary: summary,
      // Use yoloDetections and clipClassification from the top level of fastApiData for consistency
      yoloDetections: fastApiData.yolo_detections || fastApiData.yolo_detections_on_extracted_frames, 
      clipClassification: fastApiData.clip_crime_classification || fastApiData.clip_crime_classification_summary,
      originalFilename,
      geminiAnalysisText, // Save Gemini analysis
      // You might want to store the raw fastApiData as well, or parts of it
      // For now, focusing on structured fields and Gemini text
    });

    await newResult.save();
    res.status(201).json({ msg: "Analysis result saved successfully.", dbData: newResult });
  } catch (error) {
    console.error("Error saving analysis result to DB:", error.message);
    res.status(500).json({ msg: "Failed to save analysis result.", error: error.message });
  }
});

// Get all analysis results from DB
app.get("/api/results", async (req, res) => {
  try {
    const results = await AnalysisResult.find().sort({ timestamp: -1 });
    res.json(results);
  } catch (error) {
    console.error("Error fetching results from DB:", error.message);
    res.status(500).json({ msg: "Failed to fetch results.", error: error.message });
  }
});

// Delete an analysis result
app.delete("/api/results/:id", async (req, res) => {
  try {
    const result = await AnalysisResult.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ msg: "Analysis result not found." });
    }
    res.json({ msg: "Analysis result deleted successfully." });
  } catch (error) {
    console.error("Error deleting result from DB:", error.message);
    res.status(500).json({ msg: "Failed to delete result.", error: error.message });
  }
});

// --- Webcam Endpoints (Unchanged, but note: snapshots from webcam are not auto-saved to DB by these) ---
app.get("/api/process/webcam-start", async (req, res) => {
  try {
    const fastApiResponse = await axios.get(`${FASTAPI_BASE_URL}/start-webcam/`, {
      responseType: 'stream'
    });
    res.setHeader('Content-Type', fastApiResponse.headers['content-type']);
    fastApiResponse.data.pipe(res);
  } catch (error) {
    console.error("Error starting webcam stream:", error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    if (error.response && error.response.data && typeof error.response.data.pipe === 'function') {
        let errorBody = '';
        error.response.data.on('data', chunk => errorBody += chunk);
        error.response.data.on('end', () => {
            try {
                const errorJson = JSON.parse(errorBody);
                res.status(statusCode).json({ msg: "Failed to start webcam stream.", error: errorJson });
            } catch (e) {
                res.status(statusCode).json({ msg: "Failed to start webcam stream.", error: errorBody });
            }
        });
    } else {
        res.status(statusCode).json({
            msg: "Failed to start webcam stream.",
            error: error.response?.data || error.message
        });
    }
  }
});

app.get("/api/process/webcam-stop", async (req, res) => {
  try {
    const fastApiResponse = await axios.get(`${FASTAPI_BASE_URL}/stop-webcam/`);
    res.json(fastApiResponse.data);
  } catch (error) {
    console.error("Error stopping webcam stream:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      msg: "Failed to stop webcam stream.",
      error: error.response?.data || error.message,
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

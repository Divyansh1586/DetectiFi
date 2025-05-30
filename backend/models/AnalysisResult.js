const mongoose = require("mongoose");

const AnalysisResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Optional: link to user if you have user auth
  analysisType: { type: String, enum: ['image', 'video', 'webcam_snapshot'], required: true },
  resultSummary: { type: String, required: true }, // Store a general textual summary
  yoloDetections: { type: mongoose.Schema.Types.Mixed }, // Store structured YOLO results if needed
  clipClassification: { type: mongoose.Schema.Types.Mixed }, // Store structured CLIP results if needed
  originalFilename: { type: String }, // Optional: store original filename for reference
  geminiAnalysisText: { type: String, required: false }, // Added for Gemini Output
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AnalysisResult", AnalysisResultSchema); 
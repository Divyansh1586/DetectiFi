const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios"); // <-- required
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// CORS & Headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/protected", require("./routes/protected"));

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload endpoint with call to FastAPI
app.post("/single", upload.array("images", 12), async (req, res) => {
  console.log(req.files);

  // try {
  //   const response = await axios.get("http://127.0.0.1:8000/single"); // calling FastAPI
  //   const result = response.data; 
  //   console.log(result)// { msg: "Images uploaded" }

  //   res.json({
  //     msg: "Files uploaded successfully!",
  //     files: req.files,
  //     result: result.msg
  //   });
  // } catch (error) {
  //   console.error("Error calling FastAPI:", error.message);
  //   res.status(500).json({
  //     msg: "Upload failed",
  //     error: error.message
  //   });
  // }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

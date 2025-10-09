const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const subjectRoutes = require("./routes/subject");
const questionRoutes = require("./routes/question");
const faceRecognitionRoutes = require("./routes/faceRecognition");
const quizRoutes = require("./routes/quiz");
const leaderboardRoutes = require("./routes/leaderboard");
const practicalRoutes = require("./routes/practical");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { authMiddleware } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com"]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for file uploads (for network JSON files)
const upload = multer({ dest: "uploads/" });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/subjects", authMiddleware, subjectRoutes);
app.use("/api/questions", authMiddleware, questionRoutes);
app.use("/api/face-recognition", faceRecognitionRoutes);
app.use("/api/quiz", authMiddleware, quizRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/practical", practicalRoutes);

// =============================================================================
// NETWORKING ROUTES - Forward to Flask backend
// =============================================================================

app.post("/api/network/upload", (req, res) => {
  const networkData = req.body;

  if (!networkData || !networkData.nodes || !networkData.edges) {
    return res.status(400).json({ error: "Invalid network JSON format" });
  }

  const savePath = path.join(__dirname, "networkData.json");
  fs.writeFile(savePath, JSON.stringify(networkData, null, 2), (err) => {
    if (err) {
      console.error("Error saving network data:", err);
      return res.status(500).json({ error: "Failed to save network data" });
    }
    res.json({ message: "Network data saved successfully" });
  });
});

app.post("/api/network/evaluate", async (req, res) => {
  const { question, config } = req.body;

  if (!config || !config.nodes || !config.edges) {
    return res
      .status(400)
      .json({ error: "Invalid network JSON format inside config" });
  }

  if (!question) {
    return res.status(400).json({ error: "Missing question in request body" });
  }

  try {
    const flaskResponse = await axios.post(
      "http://localhost:5001/evaluate-network",
      { question, config },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json({ status: "success", evaluation: flaskResponse.data });
  } catch (error) {
    console.error("Error forwarding to Flask backend:", error.message);
    res.status(500).json({ error: "Failed to evaluate network" });
  }
});

// GET endpoint to get a generated networking question from Flask backend
app.get("/api/network/generate-question", async (req, res) => {
  try {
    const flaskResponse = await axios.get(
      "http://localhost:5001/generate-network-question"
    );

    res.json({ status: "success", question: flaskResponse.data.question });
  } catch (error) {
    console.error(
      "Error fetching generated question from Flask backend:",
      error.message
    );
    res.status(500).json({ error: "Failed to generate question" });
  }
});

// POST endpoint for uploading JSON file (optional)
app.post("/api/network/upload-file", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = path.join(__dirname, req.file.path);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read uploaded file" });
    }

    try {
      const networkData = JSON.parse(data);

      // Delete temp file
      fs.unlink(filePath, () => {});

      res.json({
        message: "File uploaded and processed successfully",
        networkData,
      });
    } catch (parseErr) {
      return res.status(400).json({ error: "Invalid JSON file" });
    }
  });
});

// =============================================================================
// CODING ROUTES - Forward to Flask backend
// =============================================================================

// Generate coding question
app.get("/api/coding/generate-question", async (req, res) => {
  try {
    const flaskResponse = await axios.get(
      "http://localhost:5001/generate-coding-question"
    );
    res.json({ status: "success", question: flaskResponse.data.question });
  } catch (error) {
    console.error(
      "Error fetching coding question from Flask backend:",
      error.message
    );
    res.status(500).json({ error: "Failed to generate coding question" });
  }
});

// Run and evaluate code
app.post("/api/coding/run", async (req, res) => {
  const { code, language, question } = req.body;

  if (!code || !language || !question) {
    return res.status(400).json({ error: "Missing code, language, or question" });
  }

  try {
    const flaskResponse = await axios.post(
      "http://localhost:5001/run-code",
      { code, language, question },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json({
      status: "success",
      output: flaskResponse.data.output,
      ai_feedback: flaskResponse.data.ai_feedback
    });
  } catch (error) {
    console.error("Error forwarding to Flask backend:", error.message);
    res.status(500).json({ error: "Failed to run code" });
  }
});

// =============================================================================
// SQL ROUTES - Forward to Flask backend
// =============================================================================

// Generate SQL question
app.get("/api/sql/generate-question", async (req, res) => {
  try {
    const flaskResponse = await axios.get(
      "http://localhost:5001/generate-sql-question"
    );
    res.json({ status: "success", data: flaskResponse.data });
  } catch (error) {
    console.error(
      "Error fetching SQL question from Flask backend:",
      error.message
    );
    res.status(500).json({ error: "Failed to generate SQL question" });
  }
});

// Run SQL setup
app.post("/api/sql/run-setup", async (req, res) => {
  const { setup_sql, session_id } = req.body;

  try {
    const flaskResponse = await axios.post(
      "http://localhost:5001/run-setup",
      { setup_sql, session_id },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json({ status: "success", session_id: flaskResponse.data.session_id });
  } catch (error) {
    console.error("Error forwarding to Flask backend:", error.message);
    res.status(500).json({ error: "Failed to run SQL setup" });
  }
});

// Get table data
app.post("/api/sql/get-table", async (req, res) => {
  const { session_id, table_name } = req.body;

  try {
    const flaskResponse = await axios.post(
      "http://localhost:5001/get-table",
      { session_id, table_name },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json({ status: "success", data: flaskResponse.data });
  } catch (error) {
    console.error("Error forwarding to Flask backend:", error.message);
    res.status(500).json({ error: "Failed to get table data" });
  }
});

// Run SQL query
app.post("/api/sql/run-query", async (req, res) => {
  const { session_id, user_query } = req.body;

  try {
    const flaskResponse = await axios.post(
      "http://localhost:5001/run-query",
      { session_id, user_query },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json({
      status: "success",
      columns: flaskResponse.data.columns,
      rows: flaskResponse.data.rows
    });
  } catch (error) {
    console.error("Error forwarding to Flask backend:", error.message);
    res.status(500).json({ error: "Failed to run SQL query" });
  }
});

// Evaluate SQL query
app.post("/api/sql/evaluate", async (req, res) => {
  const { question, setup_sql, user_query, user_output } = req.body;

  try {
    const flaskResponse = await axios.post(
      "http://localhost:5001/evaluate-sql",
      { question, setup_sql, user_query, user_output },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json({ status: "success", evaluation: flaskResponse.data });
  } catch (error) {
    console.error("Error forwarding to Flask backend:", error.message);
    res.status(500).json({ error: "Failed to evaluate SQL query" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "EduBot API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/edubot"
    );
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 EduBot Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Flask backend: http://localhost:5001`);
    console.log(`💻 Code execution: http://localhost:${PORT}/api/coding/run`);
    console.log(`🌐 Networking: http://localhost:${PORT}/api/network/generate-question`);
    console.log(`🗄️ SQL Practice: http://localhost:${PORT}/api/sql/generate-question`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
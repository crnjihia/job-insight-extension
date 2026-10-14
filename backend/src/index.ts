import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "./middleware/rateLimit";
import auth from "./middleware/auth";
import analyzeRouter from "./routes/analyze";
import companyRouter from "./routes/company";
import salaryRouter from "./routes/salary";
import cvRouter from "./routes/cv";

dotenv.config();

export const app = express();
const PORT = process.env.PORT ?? 4000;

// Process safety handlers for offline mode
process.on("uncaughtException", (err) => {
  console.warn("Uncaught exception handled:", err.message);
});
process.on("unhandledRejection", (reason: any) => {
  console.warn("Unhandled rejection handled:", reason?.message || reason);
});

// Connect to MongoDB with graceful error handling
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/jobinsight";
if (process.env.NODE_ENV !== "test") {
  mongoose.connection.on("error", () => {
    // Suppress unhandled mongoose connection errors in offline mode
  });
  mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.warn("MongoDB connection warning (offline mode enabled):", err.message);
    });
}

// Global middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(rateLimit);
app.use(auth);

// Routes
app.use(["/analyze", "/api/analyze"], analyzeRouter);
app.use(["/company", "/api/company"], companyRouter);
app.use(["/salary", "/api/salary"], salaryRouter);
app.use(["/cv", "/api/cv"], cvRouter);

// Health check
app.get("/", (_, res) => res.json({ status: "ok", service: "Job Insight Backend API" }));
app.get("/health", (_, res) => res.json({ status: "healthy" }));

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Job Insight backend listening on http://localhost:${PORT}`);
  });
}

export default app;

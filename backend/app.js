import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userNotificationRoutes from "./routes/userNotificationRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import homeContentRoutes from "./routes/homeContentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
});

app.use(limiter);

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

// Health Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    project: "LakshyaPath API",
  });
});

// auth Routes
app.use("/api/auth", authRoutes);

// Exam Routes
app.use("/api/exams", examRoutes);

// Subject Routes
app.use("/api/subjects", subjectRoutes);

// Topic Routes
app.use("/api/topics", topicRoutes);

// Question Routes
app.use("/api/questions", questionRoutes);

// Test Routes
app.use("/api/tests", testRoutes);

// Attempt Routes
app.use("/api/attempts", attemptRoutes);

// Progress Routes
app.use("/api/progress", progressRoutes);

//Notification Routes
app.use("/api/notifications", notificationRoutes);

//User Notification Routes
app.use("/api/user-notifications", userNotificationRoutes);

//Payment Routes
app.use("/api/payments", paymentRoutes);

//Subscription Routes
app.use("/api/subscriptions", subscriptionRoutes);

//Plan Routes
app.use("/api/plans", planRoutes);

// Home Content Routes
app.use("/api/home-content", homeContentRoutes);

// Admin management routes
app.use("/api/admin", adminRoutes);

//404 Handler
app.use(notFound);

//Global Error Handler
app.use(errorHandler);

export default app;
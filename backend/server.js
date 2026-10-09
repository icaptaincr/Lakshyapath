import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { verifyEmailTransporter } from "./services/emailService.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Verify email transporter
    await verifyEmailTransporter();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
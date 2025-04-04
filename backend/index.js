import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import cors from "cors";
import moment from "moment-timezone";
import { connectionDB } from "./src/utils/database.utils.js";
import { userRouter } from "./src/routes/user.routes.js";
import { sendGreetings } from "./src/utils/Greetings.utils.js";
import roleRouter from "./src/routes/role.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Allow frontend access
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectionDB();

// Debug Incoming Requests
app.use((req, res, next) => {
  console.log(`📌 ${req.method} ${req.url}`);
  next();
});

// API Routes

app.use("/api/v1/user", userRouter);
app.use("/api/v1/roles", roleRouter);

// Handle Non-Existent Routes
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found", 
    requestedRoute: `${req.method} ${req.originalUrl}` 
  });
});

// Cron Job (Runs Every Minute)
cron.schedule(
  "* * * * *",
  async () => {
    console.log(
      "✅ Cron Job Triggered at:",
      moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    );

    try {
      await sendGreetings();
      console.log("✅ Greetings job executed successfully.");
    } catch (error) {
      console.error("❌ Error in cron job:", error.message);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

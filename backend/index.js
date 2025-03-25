import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import cors from "cors";
import moment from "moment-timezone";
import { connectionDB } from "./src/utils/database.utils.js";
import { adminRouter } from "./src/routes/admin.routes.js";
import { employeeRouter } from "./src/routes/employee.routes.js";
import { sendGreetings } from "./src/utils/Greetings.utils.js";

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
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/employee", employeeRouter);

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

import express, { urlencoded } from "express";
import { connectionDB } from "./src/utils/database.utils.js";
import dotenv from "dotenv";
import cron from "node-cron";
import { adminRouter } from "./src/routes/admin.routes.js";
import { employeeRouter } from "./src/routes/employee.routes.js";
import { sendGreetings } from "./src/utils/Greetings.utils.js";
import moment from 'moment-timezone';
dotenv.config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/employee', employeeRouter)

cron.schedule("* * * * *", async () => {
    console.log("✅ Cron Job Triggered at:", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  
    try {
      await sendGreetings();
      console.log("✅ Greetings job executed successfully.");
    } catch (error) {
      console.error("❌ Error in cron job:", error.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

const port = process.env.PORT || 5100
console.log("hyy vishal")
console.log("Hello Dev");

app.listen(port, (req, res) => {
    console.log(`Server is running on ${port}`);
    
})

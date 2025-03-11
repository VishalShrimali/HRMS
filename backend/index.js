import express, { urlencoded } from "express";
import { connectionDB } from "./src/utils/database.utils.js";
import dotenv from "dotenv";
import { adminRouter } from "./src/routes/admin.routes.js";
dotenv.config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use('/api/v1/admin', adminRouter)

const port = process.env.PORT || 5100

app.listen(port, (req, res) => {
    console.log(`Server is running on ${port}`);
    connectionDB();
})

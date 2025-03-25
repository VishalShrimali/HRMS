import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

 const connectionDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database is connected Successfully on ${conn.connection.host}`);
    }
    catch (error) {
        console.log("Database Error", error);
    }
}

export { connectionDB }
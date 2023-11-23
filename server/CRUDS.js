import express from "express";
import { connectDB } from "./dbConnection.js";

// ----- FOR CRUDS: EXPRESS ROUTER(ENDPOINTS), DB CONNECTION -----

const router = express.Router();
const db = await connectDB();

export default router;

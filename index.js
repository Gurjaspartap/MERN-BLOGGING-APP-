import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { ConnectDb } from "./utils/connectDb.js";
import userRoute from "./routes/userRoutes.js";
import blogRoute from "./routes/blogRoutes.js";
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection
ConnectDb();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Route for testing the server
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// File upload middleware with temp files configuration
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./temp",
  })
);

// Routes
app.use("/api/users", userRoute);
app.use("/api/blogs", blogRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

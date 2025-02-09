require("dotenv").config();
const express = require("express");
const cors = require("cors");

const musicRoute = require("./routes/musicRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());
const allowedOrigins = ["https://fantasy-beats.netlify.app/"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // each ip has a limit of upto 100 requests per 15 minutes
  message: "Too many requests, please try again later",
});

app.use("/api", musicRoute, apiLimiter);

const isProduction = process.env.NODE_ENV === "production";

app.listen(PORT, () => {
  if (!isProduction) {
    console.log(`Server running on port ${PORT}`);
  }
});

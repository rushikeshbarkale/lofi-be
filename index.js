require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

// Route to fetch fantasy/isekai music videos
app.get("/api/music", async (req, res) => {
  try {
    const query = "isekai fantasy music"; // Change keywords as needed
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        videoCategoryId: 10, // Category 10 = Music
        maxResults: 10,
        key: YOUTUBE_API_KEY,
      },
    });

    const videos = response.data.items.map((video) => ({
      title: video.snippet.title,
      videoId: video.id.videoId,
      thumbnail: video.snippet.thumbnails.medium.url,
    }));

    res.json({ videos });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    res.status(500).json({ error: "Failed to fetch music" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

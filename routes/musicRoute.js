const express = require("express");

const router = express.Router();

const {
  fetchMusicVideos,
  clearCache,
  getCacheStats,
} = require("../controllers/musicController");

// Main music route
router.get("/music", fetchMusicVideos);

// Cache management routes
router.post("/cache/clear", clearCache);
router.get("/cache/stats", getCacheStats);

module.exports = router;

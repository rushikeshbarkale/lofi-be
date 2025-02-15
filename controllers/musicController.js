const axios = require("axios");
const NodeCache = require("node-cache");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

//* v1
// const cache = new NodeCache({ stdTTL: 300 }); // Cache expires in 5 minutes

// const fetchMusicVideos = async (req, res) => {
//   try {
//     // Check if cache exists
//     const cachedVideos = cache.get("musicVideos");
//     if (cachedVideos) {
//       console.log("Serving from cache");
//       return res.json({ videos: cachedVideos });
//     }

//     const query = "isekai fantasy music";
//     const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
//       params: {
//         part: "snippet",
//         q: query,
//         type: "video",
//         videoCategoryId: 10, // Music category
//         maxResults: 10,
//         key: YOUTUBE_API_KEY,
//       },
//     });

//     const videos = response.data.items.map((video) => ({
//       title: video.snippet.title,
//       videoId: video.id.videoId,
//       thumbnail: video.snippet.thumbnails.medium.url,
//     }));

//     // Store in cache
//     cache.set("musicVideos", videos);

//     res.json({ videos });
//   } catch (error) {
//     console.error("Error fetching YouTube videos:", error);
//     res.status(500).json({ error: "Failed to fetch music" });
//   }
// };

// module.exports = { fetchMusicVideos };

//* v2
const cache = new NodeCache({
  stdTTL: 1800, // Cache for 30 minutes
  checkperiod: 600,
  useClones: false,
});

const SEARCH_QUERIES = [
  "isekai fantasy lofi music",
  "anime fantasy lofi music",
  "anime lofi mix",
  "fantasy ambient lofi music",
];

const GENSHIN_SEARCH_QUERIES = [
  "genshin impact lofi",
  "genshin impact relaxing ost",
];

const isProduction = process.env.NODE_ENV === "production";

// // Add randomization to the API call
// const fetchFromYoutubeAPI = async (baseQuery, maxResults = 25) => {
//   const randomQuery =
//     SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
//   const finalQuery = baseQuery || randomQuery;

//   //randomization to the request
//   const randomParams = {
//     publishedAfter: new Date(
//       Date.now() - 365 * 24 * 60 * 60 * 1000
//     ).toISOString(),
//     order: ["relevance", "date", "rating"][Math.floor(Math.random() * 3)],
//   };

//   const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
//     params: {
//       part: "snippet",
//       q: finalQuery,
//       type: "video",
//       videoCategoryId: 10, // Music category
//       maxResults,
//       key: YOUTUBE_API_KEY,
//       ...randomParams,
//     },
//   });

//   return response.data.items.map((video) => ({
//     title: video.snippet.title,
//     videoId: video.id.videoId,
//     thumbnail: video.snippet.thumbnails.medium.url,
//     description: video.snippet.description,
//     publishedAt: video.snippet.publishedAt,
//     channelTitle: video.snippet.channelTitle,
//   }));
// };

// // Enhanced main controller function
// const fetchMusicVideos = async (req, res) => {
//   try {
//     const { query, category = "all", page = 1 } = req.query;
//     const pageSize = 10;
//     const cacheKey = `musicVideos_${query || "random"}_${category}_${page}`;

//     // Check cache first
//     const cachedVideos = cache.get(cacheKey);
//     if (cachedVideos) {
//       if (!isProduction) {
//         console.log(`Cache hit for key: ${cacheKey}`);
//       }
//       return res.json({
//         videos: cachedVideos,
//         source: "cache",
//         page: parseInt(page),
//       });
//     }

//     if (!isProduction) {
//       console.log(`Cache miss for key: ${cacheKey}, fetching from YouTube API`);
//     }

//     const videos = await fetchFromYoutubeAPI(query);

//     const shuffledVideos = videos.sort(() => Math.random() - 0.5);

//     // Get the page slice
//     const startIndex = (parseInt(page) - 1) * pageSize;
//     const pageVideos = shuffledVideos.slice(startIndex, startIndex + pageSize);

//     // Store in cache
//     cache.set(cacheKey, pageVideos);

//     res.json({
//       videos: pageVideos,
//       source: "api",
//       page: parseInt(page),
//       hasMore: videos.length > startIndex + pageSize,
//     });
//   } catch (error) {
//     console.error("Error in fetchMusicVideos:", error);

//     if (error.response?.status === 403) {
//       return res.status(403).json({
//         error: "YouTube API quota exceeded",
//         message: "Please try again later",
//       });
//     }

//     if (error.response?.status === 400) {
//       return res.status(400).json({
//         error: "Invalid request",
//         message: "Please check your query parameters",
//       });
//     }

//     res.status(500).json({
//       error: "Internal server error",
//       message: "Failed to fetch music videos",
//     });
//   }
// };

const fetchFromYoutubeAPI = async (
  baseQuery,
  maxResults = 25,
  isGenshin = false
) => {
  const queryList = isGenshin ? GENSHIN_SEARCH_QUERIES : SEARCH_QUERIES;
  const randomQuery = queryList[Math.floor(Math.random() * queryList.length)];
  const finalQuery = baseQuery || randomQuery;

  const randomParams = {
    publishedAfter: new Date(
      Date.now() - 365 * 24 * 60 * 60 * 1000
    ).toISOString(),
    order: ["relevance", "date", "rating"][Math.floor(Math.random() * 3)],
  };

  const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
    params: {
      part: "snippet",
      q: finalQuery,
      type: "video",
      videoCategoryId: 10,
      maxResults,
      key: YOUTUBE_API_KEY,
      ...randomParams,
    },
  });

  return response.data.items.map((video) => ({
    title: video.snippet.title,
    videoId: video.id.videoId,
    thumbnail: video.snippet.thumbnails.medium.url,
    description: video.snippet.description,
    publishedAt: video.snippet.publishedAt,
    channelTitle: video.snippet.channelTitle,
  }));
};

const fetchMusicVideos = async (req, res) => {
  try {
    const { query, category = "all", page = 1, genshin = false } = req.query;
    const pageSize = 10;
    const cacheKey = `musicVideos_${
      query || "random"
    }_${category}_${page}_genshin_${genshin}`;

    const cachedVideos = cache.get(cacheKey);
    if (cachedVideos) {
      if (!isProduction) {
        console.log(`Cache hit for key: ${cacheKey}`);
      }
      return res.json({
        videos: cachedVideos,
        source: "cache",
        page: parseInt(page),
      });
    }

    if (!isProduction) {
      console.log(`Cache miss for key: ${cacheKey}, fetching from YouTube API`);
    }

    const videos = await fetchFromYoutubeAPI(query, 25, genshin === "true");
    const shuffledVideos = videos.sort(() => Math.random() - 0.5);

    const startIndex = (parseInt(page) - 1) * pageSize;
    const pageVideos = shuffledVideos.slice(startIndex, startIndex + pageSize);

    cache.set(cacheKey, pageVideos);

    res.json({
      videos: pageVideos,
      source: "api",
      page: parseInt(page),
      hasMore: videos.length > startIndex + pageSize,
    });
  } catch (error) {
    console.error("Error in fetchMusicVideos:", error);

    if (error.response?.status === 403) {
      return res.status(403).json({
        error: "YouTube API quota exceeded",
        message: "Please try again later",
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Please check your query parameters",
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch music videos",
    });
  }
};

// Cache management functions
const clearCache = (req, res) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    cache.flushAll();
    res.json({ message: "Cache cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cache" });
  }
};

const getCacheStats = (req, res) => {
  try {
    const stats = cache.getStats();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: "Failed to get cache stats" });
  }
};

module.exports = {
  fetchMusicVideos,
  clearCache,
  getCacheStats,
};

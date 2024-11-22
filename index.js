const express = require("express");
const axios = require("axios");

const app = express();

// Middleware to handle CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Route to handle proxied requests
app.get("/*", async (req, res) => {
  const targetUrl = req.params[0]; // Capture everything after "/"

  if (!targetUrl) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  try {
    // Decode URL in case it's encoded
    const decodedUrl = decodeURIComponent(targetUrl);

    // Fetch the content from the target URL
    const response = await axios.get(decodedUrl, {
      headers: {
        "User-Agent": "Node.js Proxy",
      },
    });

    // Forward response headers and data
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Error fetching target URL:", error.message);

    // Handle response errors and return detailed info
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch the target URL",
      details: error.response?.data || error.message,
    });
  }
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));

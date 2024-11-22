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
    // Log the target URL being requested
    console.log("Target URL requested:", targetUrl);

    // Decode URL in case it's encoded
    const decodedUrl = decodeURIComponent(targetUrl);
    console.log("Decoded URL:", decodedUrl); // Log decoded URL

    // Fetch the content from the target URL
    const response = await axios.get(decodedUrl, {
      headers: {
        "User-Agent": "Node.js Proxy", // Ensure the user-agent is set
        "Content-Type": "application/json", // Set content type if needed
      },
    });

    // Forward response headers and data
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.status(response.status).send(response.data);

    console.log("Response from API:", response.status); // Log status code
  } catch (error) {
    console.error("Error fetching target URL:", error.message);

    // Log the error response for debugging
    if (error.response) {
      console.log("API Error Response:", error.response.data);
      console.log("API Error Status:", error.response.status);
    }

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

const express = require("express");
const axios = require("axios");

const app = express();

// Middleware to handle CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Route to handle proxied requests
app.get("/*", async (req, res) => {
  // Capture everything after "/" in the URL path (including query params)
  const targetUrl = req.params[0];

  if (!targetUrl) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  try {
    // Log the target URL being requested
    console.log("Target URL requested:", targetUrl);

    // Fetch the content from the target URL
    console.log("Ready URL:", decodeURIComponent(targetUrl))
    const response = await axios.get(decodeURIComponent(targetUrl), {
      headers: {
        "User-Agent": "Node.js Proxy", // Set user-agent
        "Content-Type": "application/json", // Content type for JSON responses
      },
    });

    // Forward the API response's headers and data
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

    // Return error details to the client
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch the target URL",
      details: error.response?.data || error.message,
    });
  }
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));

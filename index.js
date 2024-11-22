const express = require("express");
const axios = require("axios");

// Initialize the Express app
const app = express();

// Middleware to handle CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Route to handle requests
app.get("/", async (req, res) => {
  const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const target = query.get("target");

  if (!target) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  try {
    // Fetch the content from the target URL
    const response = await axios.get(target, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Node.js Proxy",
        "Accept": "application/json, text/html, */*", // Accept API responses or HTML
      },
    });

    // Set the correct content type for the response
    res.setHeader("Content-Type", response.headers["content-type"]);

    // Send the data back to the client
    res.status(response.status).send(response.data);
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching target URL:", error.message);

    // Return error details
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch the target URL",
      details: error.response?.data || error.message,
    });
  }
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

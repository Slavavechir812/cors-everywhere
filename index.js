const express = require('express');
const axios = require('axios');

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
        "User-Agent": "Node.js Proxy",
      },
    });

    // Set headers for the response to be CORS-friendly
    res.setHeader("Content-Type", response.headers["content-type"]);

    // Send the data back to the client
    res.send(response.data);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Failed to fetch the target URL" });
  }
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

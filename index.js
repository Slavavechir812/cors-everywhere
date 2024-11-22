const express = require("express");
const axios = require("axios");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

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

    // Forward the content type from the target response
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Error fetching target URL:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch the target URL",
      details: error.response?.data || error.message,
    });
  }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));

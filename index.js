const express = require('express');
const axios = require('axios');

const app = express();

// Middleware to handle CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/*', async (req, res) => {
  const full = req.originalUrl.substring(1); 
  // removes the leading "/" and keeps EVERYTHING including ?query

  if (!full) return res.status(400).json({ error: 'Target URL is required' });

  try {
    console.log("Fetching:", full);

    const response = await axios.get(full, {
      headers: { 'User-Agent': 'Node.js Proxy' }
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    res.status(response.status).send(response.data);

  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch the target URL',
      details: error.response?.data || error.message,
    });
  }
});


// Start the server
const PORT = 8080;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));

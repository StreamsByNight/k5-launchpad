import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Allow requests from your local machine AND your future Render URL
app.use(cors());
app.use(express.json());

const CANVAS_DOMAIN = 'stridek12academy.com';

// It is best to put these in Render's "Environment Variables" tab 
// rather than hardcoding, but I have filled them in for your current test.
const CLIENT_ID = process.env.CANVAS_CLIENT_ID || '10000000000033';
const CLIENT_SECRET = process.env.CANVAS_CLIENT_SECRET || 'yBwHwBB9JPVunDXQHRGhTtGZmTRhyxHML8RBBAmaHMZMh4KAYHfk7wmTPyuYvAP2';

// This must match EXACTLY what you put in the Canvas Developer Key settings.
// When you move to Render, you will update this variable in the Render dashboard.
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5173';

app.post('/auth/canvas', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const response = await fetch(`https://${CANVAS_DOMAIN}/login/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI, 
        code: code
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Canvas Error:", data);
      return res.status(400).json(data);
    }

    res.json(data); 
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

// Render will pass a PORT variable automatically. 
// Locally, it will default to 3001.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend Bridge running on port ${PORT}`));

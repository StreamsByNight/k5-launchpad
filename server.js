import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CANVAS_DOMAIN = 'stridek12academy.com';
const CLIENT_ID = '10000000000033';
const CLIENT_SECRET = 'yBwHwBB9JPVunDXQHRGhTtGZmTRhyxHML8RBBAmaHMZMh4KAYHfk7wmTPyuYvAP2'; // KEEP THIS PRIVATE

// This is the "Exchange Office"
app.post('/auth/canvas', async (req, res) => {
  const { code } = req.body;

  try {
    const response = await fetch(`https://${CANVAS_DOMAIN}/login/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: 'http://localhost:5173', // Must match your Canvas dev key setting
        code: code
      })
    });

    const data = await response.json();
    res.json(data); // Sends the Access Token back to your Dashboard
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

app.listen(3001, () => console.log('Backend Bridge running on http://localhost:3001'));

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Helper to find the "dist" folder where Vite puts your built website
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

const CANVAS_DOMAIN = 'stridek12academy.com';
const CLIENT_ID = process.env.CANVAS_CLIENT_ID || '10000000000033';
const CLIENT_SECRET = process.env.CANVAS_CLIENT_SECRET || 'yBwHwBB9JPVunDXQHRGhTtGZmTRhyxHML8RBBAmaHMZMh4KAYHfk7wmTPyuYvAP2';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5173';

// 1. SERVE FRONTEND: Tell Express to serve the static files from the "dist" folder
app.use(express.static(path.join(__dirname, 'dist')));

// 2. AUTH ROUTE: Keep your existing Canvas exchange logic
app.post('/auth/canvas', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided' });

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
    if (data.error) return res.status(400).json(data);
    res.json(data); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

// 3. FALLBACK ROUTE: If someone visits a sub-page, send them to index.html
// This MUST be the last route in the file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Dashboard Server running on port ${PORT}`));

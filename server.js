import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Configuration
const CANVAS_DOMAIN = 'stridek12academy.com';
const CLIENT_ID = process.env.CANVAS_CLIENT_ID || '10000000000033';
const CLIENT_SECRET = process.env.CANVAS_CLIENT_SECRET || 'yBwHwBB9JPVunDXQHRGhTtGZmTRhyxHML8RBBAmaHMZMh4KAYHfk7wmTPyuYvAP2';

// IMPORTANT: This should be your Render URL (e.g., https://k5-launchpad.onrender.com)
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5173';

// 1. SERVE FRONTEND
// This tells Express to look for the 'dist' folder created by 'npm run build'
app.use(express.static(path.join(__dirname, 'dist')));

// 2. API ROUTE: Canvas Token Exchange
app.post('/auth/canvas', async (req, res) => {
  const { code } = req.body;
  console.log("Attempting code exchange for code:", code ? "Received" : "Missing");

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
    
    if (data.error) {
      console.error("Canvas API Error:", data.error_description || data.error);
      return res.status(400).json(data);
    }

    res.json(data); 
  } catch (error) {
    console.error("Server-side Fetch Error:", error);
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

// 3. FALLBACK ROUTE
// If the user refreshes a page or the 'dist' folder is missing, this runs.
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If you see this in Render logs, it means 'npm run build' failed or didn't run.
      console.error("CRITICAL: index.html not found in dist folder!");
      res.status(404).send("Site files are missing. Please check the Render Build Logs.");
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Dashboard Server running on port ${PORT}`);
  console.log(`Redirect URI set to: ${REDIRECT_URI}`);
  console.log(`=================================`);
});

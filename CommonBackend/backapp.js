import express from 'express';
import http from 'http';
import papaparse from 'papaparse';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directories
app.use('/SheetVentes', express.static(path.join(__dirname, '../SheetVentes/Frontend')));
app.use('/SheetCalcul', express.static(path.join(__dirname, '../SheetCalcul/Frontend')));
app.use(express.static(path.join(__dirname)));

// Import routes from other backends
import sheetVentesRoutes from '../SheetVentes/Backend/backapp.js';
import sheetCalculRoutes from '../SheetCalcul/Backend/backapp.js';

// Use routes from other backends
app.use('/SheetVentes', sheetVentesRoutes);
app.use('/SheetCalcul', sheetCalculRoutes);

// Serve the main index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all routes to serve index.html for both sites
app.get('/SheetVentes/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../SheetVentes/Frontend/index.html'));
});

app.get('/SheetCalcul/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../SheetCalcul/Frontend/index.html'));
});

//Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Hub Server running at http://localhost:${PORT}`);
});
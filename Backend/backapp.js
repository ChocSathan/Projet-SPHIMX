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

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../Frontend')));


//Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const localIp = getLocalIpAddress();
  console.log(`Server running at http://${localIp}:${PORT}`);
});

// Route to handle saving data
app.post('/save', (req, res) => {
    const data = req.body.map(row => row.slice(0, 3)); // Only save the first 3 columns
    const header = ['libMenu', 'Non-Membre', 'Membre']; // Define the header row
    const csvData = [header, ...data]; // Include the header row in the data
    const csv = papaparse.unparse(csvData);
    fs.writeFile(path.join(__dirname, 'data.csv'), csv, (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.status(200).json({ message: 'Data saved successfully' });
    });
});

// Route to handle loading data
app.get('/load', (req, res) => {
    fs.readFile(path.join(__dirname, 'data.csv'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file:', err);
            return res.status(500).json({ error: 'Failed to load data' });
        }
        const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
        const rows = parsedData.slice(1).map(row => row.slice(0, 3)); // Only load the first 3 columns
        res.json(rows);
    });
});

// Route to handle creating a backup
app.post('/createBackup', (req, res) => {
    const { backupName, data } = req.body;
    const header = ['libMenu', 'Non-Membre', 'Membre']; // Define the header row
    const csvData = [header, ...data]; // Include the header row in the data
    const csv = papaparse.unparse(csvData);
    const backupPath = path.join(__dirname, 'backups', `${backupName}.csv`);
    
    fs.writeFile(backupPath, csv, (err) => {
        if (err) {
            console.error('Error writing to backup CSV file:', err);
            return res.status(500).json({ error: 'Failed to create backup' });
        }
        res.status(200).json({ message: 'Backup created successfully' });
    });
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Function to get local IP address
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
};

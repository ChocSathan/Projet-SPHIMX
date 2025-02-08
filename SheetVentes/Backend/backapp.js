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

const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

// Serve static files from the frontend directory
router.use(express.static(path.join(__dirname, '../Frontend')));

// Route to handle saving data
router.post('/save', (req, res) => {
    const data = req.body.map(row => {
        row[3] = parseFloat(row[3]).toFixed(2); // Format Prix Non-Membre
        row[4] = parseFloat(row[4]).toFixed(2); // Format Prix Membre
        return row;
    });
    const header = ['libMenu', 'Non-Membre', 'Membre', 'Prix Non-Membre', 'Prix Membre']; // Define the header row
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
router.get('/load', (req, res) => {
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
router.post('/createBackup', (req, res) => {
    const { backupName, data } = req.body;
    const header = ['libMenu', 'Non-Membre', 'Membre', 'Prix Non-Membre', 'Prix Membre']; // Define the header row
    const csvData = [header, ...data]; // Include the header row in the data
    const csv = papaparse.unparse(csvData);

    // Get the current date and time
    const now = new Date();
    const formattedDate = `${now.getFullYear()}:${String(now.getMonth() + 1).padStart(2, '0')}:${String(now.getDate()).padStart(2, '0')}:${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Include the formatted date in the backup name
    const backupPath = path.join(__dirname, 'backups', `${backupName}_${formattedDate}.csv`);
    
    fs.writeFile(backupPath, csv, (err) => {
        if (err) {
            console.error('Error writing to backup CSV file:', err);
            return res.status(500).json({ error: 'Failed to create backup' });
        }
        res.status(200).json({ message: 'Backup created successfully' });
    });
});

// Catch-all route to serve index.html
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.use('/', router);

//Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`SheetVentes Server running at http://localhost:${PORT}`);
});

export default router;
import express from 'express';
import http from 'http';
import papaparse from 'papaparse';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { finished } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../Frontend')));

// Function to calculate the total quantity backup
function totalQBackup(backupName) {
    return new Promise((resolve, reject) => {
        let total = 0;
        fs.readFile(path.join(__dirname, 'data.csv'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading CSV file:', err);
                return reject('Failed to load data');
            }
            const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
            const rows = parsedData.slice(1);
            rows.forEach(row => {
                if (row[0] === backupName) {
                    total += parseInt(row[2]) + parseInt(row[3]);
                }
            });
            let newTotal = total.toString();
            resolve(newTotal);
        });
    });
}

// Function to calculate the total revenues backup
function totalRBackup(backupName) {
    return new Promise((resolve, reject) => {
        let total = 0;
        fs.readFile(path.join(__dirname, 'data.csv'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading CSV file:', err);
                return reject('Failed to load data');
            }
            const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
            const rows = parsedData.slice(1);
            rows.forEach(row => {
                if (row[0] === backupName) {
                    total += parseInt(row[2]) * parseInt(row[4]) + parseInt(row[3]) * parseInt(row[5]);
                }
            });
            let newTotal = total.toString();
            resolve(newTotal);
        });
    });
}

// Route to handle saving data
app.post('/save', (req, res) => {
    const data = [];
    req.body.forEach(row => {
        //data saving
    });
    const header = ['libCSV', 'libMenu', 'Non-Membre', 'Membre', 'Prix Non-Membre', 'Prix Membre'];
    const csvData = [header, ...data];
    const csv = papaparse.unparse(csvData);
    fs.writeFile(path.join(__dirname, 'data.csv'), csv, (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.status(200).json({ message: 'Data saved successfully' });
    });
});

// Route to handle adding a backup
app.post('/add_backup', (req, res) => {
    const { backupName } = req.body;
    if (!backupName) {
        return res.status(400).json({ success: false, message: 'Backup name is required' });
    }

    const backupFilePath = path.join(__dirname, '../../SheetVentes/Backend/backups', `${backupName}.csv`);
    if (!fs.existsSync(backupFilePath)) {
        return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    fs.readFile(backupFilePath, 'utf8', (err, backupData) => {
        if (err) {
            console.error('Error reading backup CSV file:', err);
            return res.status(500).json({ success: false, message: 'Failed to read backup file' });
        }

        const parsedBackupData = papaparse.parse(backupData, { skipEmptyLines: true }).data;
        const rowsToAdd = parsedBackupData.slice(1).map(row => [backupName, ...row].join(',')).join('\n') + '\n';

        fs.appendFile(path.join(__dirname, 'data.csv'), rowsToAdd, (err) => {
            if (err) {
                console.error('Error adding backup to CSV file:', err);
                return res.status(500).json({ success: false, message: 'Failed to add backup' });
            }
            res.status(200).json({ success: true, message: 'Backup added successfully' });
        });
    });
});

// Route to handle removing a backup
app.post('/remove_backup', (req, res) => {
    const { backupName } = req.body;
    if (!backupName) {
        fs.readFile(path.join(__dirname, 'data.csv'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading CSV file:', err);
                return res.status(500).json({ success: false, message: 'Failed to read data file' });
            }

            const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
            const header = parsedData[0];
            const csv = papaparse.unparse([header]) + '\n';

            fs.writeFile(path.join(__dirname, 'data.csv'), csv, (err) => {
                if (err) {
                    console.error('Error removing all backups from CSV file:', err);
                    return res.status(500).json({ success: false, message: 'Failed to remove all backups' });
                }
                res.status(200).json({ success: true, message: 'All backups removed successfully' });
            });
        });
    } else {
        fs.readFile(path.join(__dirname, 'data.csv'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading CSV file:', err);
                return res.status(500).json({ success: false, message: 'Failed to read data file' });
            }

            const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
            const header = parsedData[0];
            const filteredData = parsedData.filter(row => row[0] !== backupName);
            const csv = papaparse.unparse([header, ...filteredData.slice(1)]) + '\n';

            fs.writeFile(path.join(__dirname, 'data.csv'), csv, (err) => {
                if (err) {
                    console.error('Error writing to CSV file:', err);
                    return res.status(500).json({ success: false, message: 'Failed to remove backup' });
                }
                res.status(200).json({ success: true, message: 'Backup removed successfully' });
            });
        });
    }
});

// Route to handle loading data
app.get('/load_quantity', async (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
        const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
        const rows = parsedData.slice(1);
        let currentBackup = null;
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if (row[0] === currentBackup) {
                rows[index] = [row[1], row[2], row[3], (parseInt(row[2]) + parseInt(row[3])).toString()];
            } else {
                currentBackup = row[0];
                let totalBackup = await totalQBackup(row[0]);
                rows[index] = [row[0], row[1], row[2], row[3], (parseInt(row[2]) + parseInt(row[3])).toString(), totalBackup];
            }
        }
        res.json(rows);
    } catch (error) {
        console.error('Error loading quantity data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Route to handle loading data
app.get('/load_revenues', async (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
        const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
        const rows = parsedData.slice(1);
        let currentBackup = null;
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if (row[0] === currentBackup) {
                rows[index] = [row[1], (parseInt(row[2]) * parseInt(row[4])).toString(), (parseInt(row[3]) * parseInt(row[5])).toString(), (parseInt(row[2]) * parseInt(row[4]) + parseInt(row[3]) * parseInt(row[5])).toString()];
            } else {
                currentBackup = row[0];
                let totalBackup = await totalRBackup(row[0]);
                rows[index] = [row[0], row[1], (parseInt(row[2]) * parseInt(row[4])).toString(), (parseInt(row[3]) * parseInt(row[5])).toString(), (parseInt(row[2]) * parseInt(row[4]) + parseInt(row[3]) * parseInt(row[5])).toString(), totalBackup];
            }
        }
        res.json(rows);
    } catch (error) {
        console.error('Error loading revenues data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
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

//Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const localIp = getLocalIpAddress();
  console.log(`Server running at http://${localIp}:${PORT}`);
});
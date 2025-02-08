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
                    if (row[2] === '' || row[3] === '') {
                        console.error('Error reading CSV file: Invalid data');
                        return reject('Failed to load data');
                    } else {
                        total += parseInt(row[2]) + parseInt(row[3]);
                    }
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
                    if (row[2] === '' || row[3] === '' || row[4] === '' || row[5] === '') {
                        console.error('Error reading CSV file: Invalid data');
                        return reject('Failed to load data');
                    } else {
                        total += parseInt(row[2]) * parseFloat(row[4]) + parseInt(row[3]) * parseFloat(row[5]);
                    }
                }
            });
            let newTotal = total.toFixed(2).toString();
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
            const backupName = row[0].split('_').slice(0, -1).join('_'); // Remove the date part
            if (backupName === currentBackup) {
                rows[index] = [row[1], row[2], row[3], (parseInt(row[2]) + parseInt(row[3])).toString()];
            } else {
                currentBackup = backupName;
                let totalBackup = await totalQBackup(row[0]);
                rows[index] = [backupName, row[1], row[2], row[3], (parseInt(row[2]) + parseInt(row[3])).toString(), totalBackup];
            }
        }
        res.json(rows);
    } catch (error) {
        console.error('Error loading quantity data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.get('/load_total_quantity', async (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
        const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
        const rows = parsedData.slice(1);
        let totals = [0, 0, 0];
        rows.forEach(row => {
            if (row[2] === '' ) {
                row[2] = '0';
            } if (row[3] === '') {
                row[3] = '0';
            }
            totals[0] += parseInt(row[2]);
            totals[1] += parseInt(row[3]);
            totals[2] += parseInt(row[2]) + parseInt(row[3]);
        });
        res.json(totals.map(total => total.toString()));
    } catch (error) {
        console.error('Error loading total quantity data:', error);
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
            const backupName = row[0].split('_').slice(0, -1).join('_'); // Remove the date part
            if (backupName === currentBackup) {
                rows[index] = [row[1], (parseInt(row[2]) * parseFloat(row[4])).toFixed(2).toString(), (parseInt(row[3]) * parseFloat(row[5])).toFixed(2).toString(), (parseInt(row[2]) * parseFloat(row[4]) + parseInt(row[3]) * parseFloat(row[5])).toFixed(2).toString()];
            } else {
                currentBackup = backupName;
                let totalBackup = await totalRBackup(row[0]);
                rows[index] = [backupName, row[1], (parseInt(row[2]) * parseFloat(row[4])).toFixed(2).toString(), (parseInt(row[3]) * parseFloat(row[5])).toFixed(2).toString(), (parseInt(row[2]) * parseFloat(row[4]) + parseInt(row[3]) * parseFloat(row[5])).toFixed(2).toString(), totalBackup];
            }
        }
        res.json(rows);
    } catch (error) {
        console.error('Error loading revenues data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.get('/load_total_revenues', async (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
        const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
        const rows = parsedData.slice(1);
        let totals = [0, 0, 0];
        rows.forEach(row => {
            if (row[2] === '' ) {
                row[2] = '0';
            } if (row[3] === '') {
                row[3] = '0';
            } if (row[4] === '') {
                row[4] = '0';
            } if (row[5] === '') {
                row[5] = '0';
            }
            totals[0] += parseInt(row[2]) * parseFloat(row[4]);
            totals[1] += parseInt(row[3]) * parseFloat(row[5]);
            totals[2] += (parseInt(row[2]) * parseFloat(row[4])) + (parseInt(row[3]) * parseFloat(row[5]));
        });
        res.json(totals.map(total => total.toFixed(2).toString()));
    } catch (error) {
        console.error('Error loading total revenues data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.get('/load_backup_options', (req, res) => {
    const backupsDir = path.join(__dirname, '../../SheetVentes/Backend/backups');
    fs.readdir(backupsDir, (err, files) => {
        if (err) {
            console.error('Error reading backups directory:', err);
            return res.status(500).json({ error: 'Failed to load backup options' });
        }
        const backupNames = files.map(file => path.basename(file, '.csv'));
        res.json(backupNames);
    });
});

app.get('/load_remove_backup_options', (req, res) => {
    fs.readFile(path.join(__dirname, 'data.csv'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file:', err);
            return res.status(500).json({ error: 'Failed to load data' });
        }
        const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
        const backupNames = [...new Set(parsedData.slice(1).map(row => row[0]))];
        res.json(backupNames);
    });
});

app.get('/load_benef', async (req, res) => {
    try {
        const cost = parseFloat(req.query.cost) || 0; // Ensure cost is a number
        const data = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
        const parsedData = papaparse.parse(data, { skipEmptyLines: true }).data;
        const rows = parsedData.slice(1);
        let revenuesTotal = 0;
        rows.forEach(row => {
            revenuesTotal += parseInt(row[2]) * parseFloat(row[4]) + parseInt(row[3]) * parseFloat(row[5]);
        });
        const benefTotal = revenuesTotal - cost;
        res.json({
            revenuesTotal: revenuesTotal.toFixed(2).toString(),
            coutTotal: cost.toFixed(2).toString(),
            benefTotal: benefTotal.toFixed(2).toString()
        });
    } catch (error) {
        console.error('Error loading benefit data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

//Start the server
const PORT = process.env.PORT || 3002;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`SheetCalcul Server running at http://localhost:${PORT}`);
});

export default app;
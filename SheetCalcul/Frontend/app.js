function addBackup() {
    const backupName = document.getElementById('inputAddBackup').value;
    if (backupName) {
        fetch('/add_backup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ backupName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                reload();
            } else {
                alert('Failed to add backup: ' + data.message);
            }
        })
        .catch(error => console.error('Error adding backup:', error));
    } else {
        alert('Please enter a backup name');
    }
}

function removeBackup() {
    const backupName = document.getElementById('inputRemoveBackup').value;
-   fetch('/remove_backup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ backupName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            reload();
        } else {
            alert('Failed to remove backup: ' + data.message);
        }
    })
    .catch(error => console.error('Error removing backup:', error));
}

function reload() {
    load_quantity();
    load_revenues();
}

function pressAddBackup() {
    if (event.key === 'Enter') {
        addBackup();
    }
}

function pressRemoveBackup() {
    if (event.key === 'Enter') {
        removeBackup();
    }
}

function load_quantity() {
    fetch('/load_quantity')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#quantité tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            let currentBackupRow = null;
            let rowspanCount = {};
            let currentRowspan = null;
            data.forEach(row => {
                if (row.length === 6) {
                    currentRowspan = row[0];
                    rowspanCount[row[0]] = 1;
                } else {
                    rowspanCount[currentRowspan]++;
                }
            });
            data.forEach((row, rowIndex) => {
                if (row.length === 6) {
                    const backupRow = document.createElement('tr');
                    backupRow.innerHTML = `
                        <td rowspan="${rowspanCount[row[0]]}">${row[0]}</td>
                        <td>${row[1]}</td>
                        <td>${row[2]}</td>
                        <td>${row[3]}</td>
                        <td>${row[4]}</td>
                        <td rowspan="${rowspanCount[row[0]]}">${row[5]}</td>
                    `;
                    tableBody.appendChild(backupRow);
                    currentBackupRow = backupRow;
                } else {
                    const menuRow = document.createElement('tr');
                    menuRow.innerHTML = `
                        <td>${row[0]}</td>
                        <td>${row[1]}</td>
                        <td>${row[2]}</td>
                        <td>${row[3]}</td>
                    `;
                    tableBody.appendChild(menuRow);
                }
            });
        })
        .catch(error => console.error('Error loading quantity data:', error));
};

function load_revenues() {
    fetch('/load_revenues')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#revenues tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            let currentBackupRow = null;
            let rowspanCount = {};
            let currentRowspan = null;
            data.forEach(row => {
                if (row.length === 6) {
                    currentRowspan = row[0];
                    rowspanCount[row[0]] = 1;
                } else {
                    rowspanCount[currentRowspan]++;
                }
            });
            data.forEach((row, rowIndex) => {
                if (row.length === 6) {
                    const backupRow = document.createElement('tr');
                    backupRow.innerHTML = `
                        <td rowspan="${rowspanCount[row[0]]}">${row[0]}</td>
                        <td>${row[1]}</td>
                        <td>${row[2]}€</td>
                        <td>${row[3]}€</td>
                        <td>${row[4]}€</td>
                        <td rowspan="${rowspanCount[row[0]]}">${row[5]}€</td>
                    `;
                    tableBody.appendChild(backupRow);
                    currentBackupRow = backupRow;
                } else {
                    const menuRow = document.createElement('tr');
                    menuRow.innerHTML = `
                        <td>${row[0]}</td>
                        <td>${row[1]}€</td>
                        <td>${row[2]}€</td>
                        <td>${row[3]}€</td>
                    `;
                    tableBody.appendChild(menuRow);
                }
            });
        })
        .catch(error => console.error('Error loading revenues data:', error));
};

// Ensure the table element exists in the DOM
document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('quantité');
    if (!table) {
        console.error('Table element not found on DOMContentLoaded');
    } else {
        console.log('Table element found on DOMContentLoaded');
    }
    // Load data from the server
    load_quantity();
    load_revenues();
});
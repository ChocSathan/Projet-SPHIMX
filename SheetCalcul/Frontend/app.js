function addBackup() {
    const backupName = document.getElementById('selectAddBackup').value;
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
        alert('Please select a backup');
    }
}

function removeBackup() {
    const backupName = document.getElementById('selectRemoveBackup').value;
    fetch('/remove_backup', {
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
    loadBackupOptions();
    loadRemoveBackupOptions();
    loadBenef();
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

    fetch('/load_total_quantity')
        .then(response => response.json())
        .then(data => {
            const tableFoot = document.querySelector('#quantité tfoot');
            tableFoot.innerHTML = ''; // Clear existing rows
            const totalRow = document.createElement('tr');
            totalRow.innerHTML = `
                <td id="libTotal" colspan="2">Totals</td>
                <td id="totalNonMembres">${data[0]}</td>
                <td id="totalMembres">${data[1]}</td>
                <td id="totals" colspan="2">${data[2]}</td>
            `;
            tableFoot.appendChild(totalRow);
        })
        .catch(error => console.error('Error loading total quantity data:', error));
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

    fetch('/load_total_revenues')
        .then(response => response.json())
        .then(data => {
            const tableFoot = document.querySelector('#revenues tfoot');
            tableFoot.innerHTML = ''; // Clear existing rows
            const totalRow = document.createElement('tr');
            totalRow.innerHTML = `
                <td id="libTotal" colspan="2">Totals</td>
                <td id="totalNonMembres">${data[0]}€</td>
                <td id="totalMembres">${data[1]}€</td>
                <td id="totals" colspan="2">${data[2]}€</td>
            `;
            tableFoot.appendChild(totalRow);
        })
        .catch(error => console.error('Error loading total revenues data:', error));
};

function loadBackupOptions() {
    fetch('/load_backup_options')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('selectAddBackup');
            select.innerHTML = ''; // Clear existing options
            data.forEach(backupName => {
                const option = document.createElement('option');
                option.value = backupName;
                option.textContent = backupName;
                select.appendChild(option);
                console.log('Loaded backup option:', option);
            });
        })
        .catch(error => console.error('Error loading backup options:', error));
}

function loadRemoveBackupOptions() {
    fetch('/load_remove_backup_options')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('selectRemoveBackup');
            select.innerHTML = ''; // Clear existing options
            option = document.createElement('option');
            option.value = '';
            option.textContent = '---';
            select.appendChild(option);
            data.forEach(backupName => {
                const option = document.createElement('option');
                option.value = backupName;
                option.textContent = backupName;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading remove backup options:', error));
}

function updateBenef() {
    const cout = parseFloat(document.getElementById('cout').value) || 0;
    document.getElementById('revenuesTotal').textContent = document.getElementById('totals').textContent;
    document.getElementById('benefTotal').textContent = (parseFloat(document.getElementById('revenuesTotal').textContent) - cout).toFixed(2);
}

// Ensure the table element exists in the DOM
document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('quantité');
    if (!table) {
        console.error('Table element not found on DOMContentLoaded');
    } else {
        console.log('Table element found on DOMContentLoaded');
    }
    // Load data from the server
    reload();
});
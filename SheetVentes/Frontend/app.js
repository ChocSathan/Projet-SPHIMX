function add() {
    // Get the current value
    let nonMembreCell = event.target.parentElement;
    let currentValue = parseInt(nonMembreCell.childNodes[0].nodeValue);
    // Increment the value
    nonMembreCell.childNodes[0].nodeValue = currentValue + 1;
    // Save the data
    save();
    calculateRevenues();
    populateRemoveMenuOptions();
}

function remove() {
    // Get the current value
    let nonMembreCell = event.target.parentElement;
    let currentValue = parseInt(nonMembreCell.childNodes[0].nodeValue);
    // Decrement the value if greater than 0
    if (currentValue > 0) {
        nonMembreCell.childNodes[0].nodeValue = currentValue - 1;
        // Save the data
        save();
        calculateRevenues();
        populateRemoveMenuOptions();
    }
}

function removeMenu() {
    let select = document.getElementById('selectRemoveMenu');
    let menuName = select.value;
    let table = document.getElementById('table');

    if (menuName === '') {
        // Remove all rows except the header
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        save();
        calculateRevenues();
        populateRemoveMenuOptions();
        return;
    }

    let found = false;
    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        if (row.cells[0].innerText === menuName) {
            table.deleteRow(i);
            found = true;
            save();
            calculateRevenues();
            populateRemoveMenuOptions();
            break;
        }
    }

    if (!found) {
        alert('Menu not found');
    }
}

function populateRemoveMenuOptions() {
    let select = document.getElementById('selectRemoveMenu');
    let table = document.getElementById('table');
    select.innerHTML = ''; // Clear existing options

    // Add default option
    let defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = '---';
    select.appendChild(defaultOption);

    // Populate options with menu names
    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let option = document.createElement('option');
        option.value = row.cells[0].innerText;
        option.text = row.cells[0].innerText;
        select.appendChild(option);
    }
}

function addMenu() {
    let menuName = document.getElementById('inputAddMenuName').value;
    let priceNonMembre = parseFloat(document.getElementById('inputAddMenuPriceNonMembre').value).toFixed(2);
    let priceMembre = parseFloat(document.getElementById('inputAddMenuPriceMembre').value).toFixed(2);
    if (menuName.trim() === '' || isNaN(priceNonMembre) || isNaN(priceMembre)) {
        alert('Please enter a valid menu name and/or prices');
        return;
    }

    let table = document.getElementById('table');
    let newRow = table.insertRow();
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    let cell3 = newRow.insertCell(2);
    let cell4 = newRow.insertCell(3);
    let cell5 = newRow.insertCell(4);

    cell1.appendChild(document.createTextNode(menuName));
    cell2.innerHTML = `0<br>
        <button id="addButton" onclick="add()">+</button>
        <button id="removeButton" onclick="remove()">-</button>`;
    cell3.innerHTML = `0<br>
        <button id="addButton" onclick="add()">+</button>
        <button id="removeButton" onclick="remove()">-</button>`;
    cell4.appendChild(document.createTextNode(priceNonMembre));
    cell5.appendChild(document.createTextNode(priceMembre));
    save();
    calculateRevenues();
    populateRemoveMenuOptions();
}

function createBackup() {
    let backupName = document.getElementById('inputBackupName').value.trim();
    if (backupName === '') {
        alert('Please enter a backup name');
        return;
    }

    let table = document.getElementById('table');
    if (!table) {
        console.error('Table element not found');
        return;
    }

    let data = [];
    // Start from 1 to skip the header row
    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let rowData = [];
        for (let j = 0; j < row.cells.length; j++) {
            let cell = row.cells[j];
            if (cell.childNodes.length > 0) {
                rowData.push(cell.childNodes[0].nodeValue);
            } else {
                rowData.push('');
            }
        }
        data.push(rowData);
    }

    // Send backup data to the server
    fetch('/createBackup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupName, data }),
    })
    .then(response => response.json())
    .then(data => {
        console.alert('Backup created successfully:', data);
    })
    .catch((error) => {
        console.error('Error creating backup:', error);
    });
}

function pressRemoveMenu() {
    if (event.key === 'Enter') {
        removeMenu();
    }
}

function pressAddMenu() {
    if (event.key === 'Enter') {
        addMenu();
    }
}

function pressCreateBackup() {
    if (event.key === 'Enter') {
        createBackup();
    }
}

function save() {
    try {
        let table = document.getElementById('table');
        if (!table) {
            console.error('Table element not found');
            return;
        }
        let data = [];
        // Start from 1 to skip the header row
        for (let i = 1; i < table.rows.length; i++) {
            let row = table.rows[i];
            let rowData = [];
            for (let j = 0; j < row.cells.length; j++) {
                let cell = row.cells[j];
                if (cell.childNodes.length > 0) {
                    rowData.push(cell.childNodes[0].nodeValue);
                } else {
                    rowData.push('');
                }
            }
            data.push(rowData);
        }
        // Send data to the server
        fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } catch (error) {
        console.error('Error collecting data:', error);
    }
}

function load() {
    fetch('/load', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        return response.json(); // Parse the response as JSON
    })
    .then(data => {
        let table = document.getElementById('table');
        if (!table) {
            console.error('Table element not found');
            return;
        }
        // Clear existing rows except the header
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        // Populate table with loaded data
        data.forEach((rowData, rowIndex) => {
            let row = table.insertRow();
            rowData.forEach((cellData, cellIndex) => {
                let cell = row.insertCell();
                if (cellIndex === 0) {
                    cell.appendChild(document.createTextNode(cellData));
                } else if (cellIndex === 1 || cellIndex === 2) {
                    cell.innerHTML = `${cellData}<br>
                        <button id="addButton" onclick="add()">+</button>
                        <button id="removeButton" onclick="remove()">-</button>`;
                } else {
                    cell.appendChild(document.createTextNode(cellData));
                }
            });
        });
        calculateRevenues();
        populateRemoveMenuOptions(); // Ensure options are populated after loading data
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Ensure the table element exists in the DOM
document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('table');
    if (!table) {
        console.error('Table element not found on DOMContentLoaded');
    } else {
        console.log('Table element found on DOMContentLoaded');
    }
    // Load data from the server
    load();
    calculateRevenues();
    populateRemoveMenuOptions();
});

function toggleEditor() {
    let editor = document.getElementById('editorMenu');
    if (editor.style.display === 'block') {
        editor.style.display = 'none';
    } else {
        editor.style.display = 'block';
    }
}

function calculateRevenues() {
    let table = document.getElementById('table');
    let total = 0;

    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        if (row.cells.length >= 5) { // Ensure there are enough cells
            let nonMembreCount = parseInt(row.cells[1].childNodes[0].nodeValue);
            let membreCount = parseInt(row.cells[2].childNodes[0].nodeValue);
            let priceNonMembre = parseFloat(row.cells[3].childNodes[0].nodeValue);
            let priceMembre = parseFloat(row.cells[4].childNodes[0].nodeValue);

            total += (nonMembreCount * priceNonMembre) + (membreCount * priceMembre);
        }
    }

    document.getElementById('total').innerText = total.toFixed(2);
}
const parkingLot = new Array(15).fill(null);

// --- DOM Elements ---
const plateNumberInput = document.getElementById('plateNumberInput');
const slotNumberInput = document.getElementById('slotNumberInput'); // Add input in HTML
const parkButton = document.getElementById('parkButton');
const removeButton = document.getElementById('removeButton');
const clearAllButton = document.getElementById('clearAllButton'); // Add button in HTML
const statusMessageDiv = document.getElementById('statusMessage');
const parkedCarsTableBody = document.getElementById('parkedCarsTable'); // tbody
const parkedCountSpan = document.getElementById('parkedCount');
const emptyTableMessage = document.getElementById('emptyTableMessage');
const carsTableWrapper = document.getElementById('carsTableWrapper'); // wrapper div

// --- Constants ---
const HOURLY_RATE_FIRST_HOUR = 500;
const HOURLY_RATE_ADDITIONAL = 300;
const ONE_HOUR_MS = 60 * 60 * 1000;
const LOCAL_STORAGE_KEY = 'smartParkLotData';

// --- Helper Functions ---
function sanitizeId(str) {
    // Replace non-alphanumeric characters with underscores for safe DOM IDs
    return str.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function formatDuration(milliseconds) {
    if (milliseconds < 0) milliseconds = 0;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map(unit => unit.toString().padStart(2, '0'))
        .join(':');
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-RW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

function displayMessage(message, type = 'info') {
    statusMessageDiv.textContent = message;
    statusMessageDiv.className = 'mt-4 p-3 rounded-md text-center text-lg font-medium';
    statusMessageDiv.setAttribute('aria-live', 'polite'); // Accessibility improvement
    switch (type) {
        case 'success':
            statusMessageDiv.classList.add('bg-green-100', 'text-green-800');
            break;
        case 'error':
            statusMessageDiv.classList.add('bg-red-100', 'text-red-800');
            break;
        default:
            statusMessageDiv.classList.add('bg-blue-100', 'text-blue-800');
    }
    setTimeout(() => {
        statusMessageDiv.textContent = '';
        statusMessageDiv.className = 'mt-4 p-3 rounded-md text-center text-lg font-medium';
    }, 5000);
}

function saveParkingLot() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parkingLot));
    } catch (e) {
        console.error("Error saving:", e);
        displayMessage("Storage error. Check browser settings.", "error");
    }
}

function loadParkingLot() {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
            const loaded = JSON.parse(data);
            if (Array.isArray(loaded) && loaded.length === parkingLot.length) {
                for (let i = 0; i < parkingLot.length; i++) {
                    parkingLot[i] = loaded[i] || null;
                }
            } else {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                displayMessage('Parking data was reset due to corruption.', 'error');
            }
        }
    } catch (e) {
        console.error("Loading error:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        displayMessage('Parking data was reset due to error.', 'error');
    }
}

function parkCar() {
    const plateNumber = plateNumberInput.value.trim().toUpperCase();
    const slotInput = slotNumberInput.value.trim();
    const slotInputNum = parseInt(slotInput, 10);

    // Strict Rwandan license plate validation: e.g. RAC123A, RAD456B, RAB789C
    const plateRegex = /^RA[BCDEFGHJKLNPSTVZ]\d{3}[A-Z]$/;
    if (!plateNumber) {
        displayMessage('Please enter a plate number.', 'error');
        return;
    }
    if (!plateRegex.test(plateNumber)) {
        displayMessage('Invalid plate format. Example: RAC123A', 'error');
        return;
    }

    const isDuplicate = parkingLot.some(car => car && car.plateNumber === plateNumber);
    if (isDuplicate) {
        displayMessage(`Car "${plateNumber}" is already parked.`, 'error');
        return;
    }

    const freeSlots = parkingLot.map((slot, idx) => slot === null ? idx + 1 : null).filter(Boolean);
    if (freeSlots.length === 0) {
        plateNumberInput.classList.add('shake');
        setTimeout(() => plateNumberInput.classList.remove('shake'), 500);
        displayMessage('Parking lot is full!', 'error');
        return;
    }

    let chosenSlotIndex = -1;

    if (slotInput !== '') {
        if (!isNaN(slotInputNum) && slotInputNum >= 1 && slotInputNum <= parkingLot.length) {
            if (parkingLot[slotInputNum - 1] === null) {
                chosenSlotIndex = slotInputNum - 1;
            } else {
                displayMessage(`Slot ${slotInputNum} is already occupied.`, 'error');
                return;
            }
        } else {
            displayMessage('Slot number must be between 1 and 15.', 'error');
            return;
        }
    } else {
        chosenSlotIndex = parkingLot.findIndex(slot => slot === null);
    }

    const newCar = {
        plateNumber,
        slotNumber: chosenSlotIndex + 1,
        entryTime: Date.now()
    };

    parkingLot[chosenSlotIndex] = newCar;
    saveParkingLot();
    displayMessage(`Car "${plateNumber}" parked in slot ${newCar.slotNumber}.`, 'success');
    clearInputs();
    displayParkedCars();
    plateNumberInput.focus();
}

function removeCar() {
    const plateNumber = plateNumberInput.value.trim().toUpperCase();
    if (!plateNumber) {
        displayMessage('Enter plate number to remove.', 'error');
        return;
    }

    const index = parkingLot.findIndex(car => car && car.plateNumber === plateNumber);
    if (index === -1) {
        displayMessage(`Car "${plateNumber}" not found.`, 'error');
        return;
    }

    if (!confirm(`Remove car "${plateNumber}" from the lot?`)) return;

    const car = parkingLot[index];
    const exitTime = Date.now();
    const duration = exitTime - car.entryTime;

    let bill = HOURLY_RATE_FIRST_HOUR;
    const remaining = duration - ONE_HOUR_MS;
    if (remaining > 0) {
        bill += Math.ceil(remaining / ONE_HOUR_MS) * HOURLY_RATE_ADDITIONAL;
    }

    parkingLot[index] = null;
    saveParkingLot();
    displayMessage(
        `Car "${plateNumber}" removed. Time: ${formatDuration(duration)}. Bill: Rwf ${bill.toLocaleString()}.`,
        'success'
    );
    clearInputs();
    displayParkedCars();
    plateNumberInput.focus();
}

function clearInputs() {
    plateNumberInput.value = '';
    slotNumberInput.value = '';
}

function clearAllCars() {
    if (confirm("Clear all cars from the lot?")) {
        for (let i = 0; i < parkingLot.length; i++) parkingLot[i] = null;
        saveParkingLot();
        displayParkedCars();
        displayMessage("All slots cleared.", "success");
        clearInputs();
    }
}

function displayParkedCars() {
    parkedCarsTableBody.innerHTML = '';
    // Always sort by slotNumber before displaying
    const sortedCars = parkingLot
        .map((car, i) => car ? { ...car, index: i } : null)
        .filter(Boolean)
        .sort((a, b) => a.slotNumber - b.slotNumber);

    parkedCountSpan.textContent = sortedCars.length;

    if (sortedCars.length === 0) {
        emptyTableMessage.classList.remove('hidden');
        carsTableWrapper.classList.add('hidden');
    } else {
        emptyTableMessage.classList.add('hidden');
        carsTableWrapper.classList.remove('hidden');

        sortedCars.forEach(car => {
            const row = document.createElement('tr');
            row.className = 'text-center';
            const safeId = sanitizeId(car.plateNumber);
            row.innerHTML = `
                <td class="py-2">${car.slotNumber}</td>
                <td class="py-2">${car.plateNumber}</td>
                <td class="py-2">${formatTimestamp(car.entryTime)}</td>
                <td class="py-2" id="duration-${safeId}">${formatDuration(Date.now() - car.entryTime)}</td>
            `;
            parkedCarsTableBody.appendChild(row);
        });
    }
}

function updateDurations() {
    // Update the duration cell for each parked car
    parkingLot.forEach(car => {
        if (car) {
            const safeId = sanitizeId(car.plateNumber);
            const durationCell = document.getElementById(`duration-${safeId}`);
            if (durationCell) {
                durationCell.textContent = formatDuration(Date.now() - car.entryTime);
            }
        }
    });
}

// --- Events ---
function validateInputs() {
    const plateNumber = plateNumberInput.value.trim().toUpperCase();
    const slotInput = slotNumberInput.value.trim();
    const slotInputNum = parseInt(slotInput, 10);
    const plateRegex = /^RA[BCDEFGHJKLNPSTVZ]\d{3}[A-Z]$/;
    let valid = true;
    if (!plateNumber || !plateRegex.test(plateNumber)) valid = false;
    if (slotInput !== '' && (isNaN(slotInputNum) || slotInputNum < 1 || slotInputNum > parkingLot.length)) valid = false;
    parkButton.disabled = !valid;
}

plateNumberInput.addEventListener('input', validateInputs);
slotNumberInput.addEventListener('input', validateInputs);

parkButton.addEventListener('click', parkCar);
removeButton.addEventListener('click', removeCar);
clearAllButton.addEventListener('click', clearAllCars);

plateNumberInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') parkCar();
});

slotNumberInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') parkCar();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateDurations();
});

// --- Init ---
let durationIntervalId = null;
window.onload = () => {
    loadParkingLot();
    displayParkedCars();
    if (durationIntervalId) clearInterval(durationIntervalId);
    durationIntervalId = setInterval(updateDurations, 1000);
    validateInputs();
};

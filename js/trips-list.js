let currentFilters = {};
let allTrips = [];
let vehicles = [];
let companies = [];
let drivers = [];
let vendors = [];
let editingTripId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupFilters();
    loadTripsTable();
    setupEditForm();
});

function loadData() {
    allTrips = storage.getTrips();
    vehicles = storage.getAll('vehicles');
    companies = storage.getAll('companies');
    drivers = storage.getAll('drivers');
    vendors = storage.getAll('vendors');
}

function setupFilters() {
    // Populate vehicle filter
    const vehicleFilter = document.getElementById('filterVehicle');
    vehicleFilter.innerHTML = '<option value="">All Vehicles</option>';
    
    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = `${vehicle.name} - ${vehicle.number}`;
        vehicleFilter.appendChild(option);
    });

    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    document.getElementById('filterStartDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('filterEndDate').value = lastDay.toISOString().split('T')[0];
}

function setupEditForm() {
    // Populate edit form dropdowns
    setupEditVehicles();
    setupEditDrivers();
    setupEditCompanies();
    setupEditVendors();

    // Setup form submission
    document.getElementById('editTripForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateTrip();
    });
}

function setupEditVehicles() {
    const vehicleSelect = document.getElementById('editVehicleId');
    vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
    
    vehicles.filter(v => v.status === 'Active').forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = `${vehicle.name} - ${vehicle.number} (${vehicle.type})`;
        vehicleSelect.appendChild(option);
    });
    
    const manualOption = document.createElement('option');
    manualOption.value = 'manual';
    manualOption.textContent = 'Manual Entry (Outsource Vehicle)';
    vehicleSelect.appendChild(manualOption);
}

function setupEditDrivers() {
    const driverSelect = document.getElementById('editDriverId');
    driverSelect.innerHTML = '<option value="">Select Driver</option>';
    
    drivers.filter(d => d.status === 'Active').forEach(driver => {
        const option = document.createElement('option');
        option.value = driver.id;
        option.textContent = `${driver.name} (${driver.phone})`;
        driverSelect.appendChild(option);
    });
}

function setupEditCompanies() {
    const companySelect = document.getElementById('editCompanyId');
    companySelect.innerHTML = '<option value="">Select Company</option>';
    
    companies.filter(c => c.status === 'Active').forEach(company => {
        const option = document.createElement('option');
        option.value = company.id;
        option.textContent = company.name;
        companySelect.appendChild(option);
    });
}

function setupEditVendors() {
    const vendorSelect = document.getElementById('editVendorId');
    vendorSelect.innerHTML = '<option value="">Select Vendor</option>';
    
    vendors.filter(v => v.status === 'Active').forEach(vendor => {
        const option = document.createElement('option');
        option.value = vendor.id;
        option.textContent = `${vendor.name} (${vendor.commission}% commission)`;
        vendorSelect.appendChild(option);
    });
}

function applyFilters() {
    currentFilters = {
        startDate: document.getElementById('filterStartDate').value,
        endDate: document.getElementById('filterEndDate').value,
        tripType: document.getElementById('filterTripType').value,
        vehicleId: document.getElementById('filterVehicle').value
    };
    
    loadTripsTable();
}

function clearFilters() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterTripType').value = '';
    document.getElementById('filterVehicle').value = '';
    currentFilters = {};
    loadTripsTable();
}

function getFilteredTrips() {
    let filteredTrips = [...allTrips];
    
    if (currentFilters.startDate && currentFilters.endDate) {
        filteredTrips = filteredTrips.filter(trip => {
            const tripDate = new Date(trip.date);
            return tripDate >= new Date(currentFilters.startDate) && 
                   tripDate <= new Date(currentFilters.endDate);
        });
    }
    
    if (currentFilters.tripType) {
        filteredTrips = filteredTrips.filter(trip => trip.tripType === currentFilters.tripType);
    }
    
    if (currentFilters.vehicleId) {
        filteredTrips = filteredTrips.filter(trip => 
            trip.vehicleId === parseInt(currentFilters.vehicleId)
        );
    }
    
    return filteredTrips.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function loadTripsTable() {
    const trips = getFilteredTrips();
    const tbody = document.querySelector('#tripsTable tbody');
    
    if (trips.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No trips found matching your filters.</td></tr>';
        return;
    }
    
    tbody.innerHTML = trips.map(trip => {
        const vehicle = trip.vehicleId ? 
            vehicles.find(v => v.id === trip.vehicleId) :
            null;
        const vehicleDisplay = vehicle ? `${vehicle.name} - ${vehicle.number}` : trip.vehicleDetails || 'Manual Entry';
            
        const driver = drivers.find(d => d.id === trip.driverId);
        let company = 'N/A';
        if (trip.tripType === 'Company' && trip.companyId) {
            company = companies.find(c => c.id === trip.companyId)?.name || 'Unknown';
        } else if (trip.tripType === 'Individual' && trip.clientName) {
            company = trip.clientName;
        } else if (trip.tripType === 'Outsource' && trip.clientName) {
            company = trip.clientName;
        }
            
        let totalCosts = 0;
        
        if (trip.tripType === 'Outsource') {
            // For outsource trips: vendor share + toll/parking
            totalCosts = (parseFloat(trip.vendorShare) || 0) + (parseFloat(trip.tollParking) || 0);
        } else if (trip.tripType === 'Company') {
            // For company trips: driver cost + fuel cost + maintenance (toll/parking is reimbursed)
            totalCosts = (parseFloat(trip.driverCost) || 0) + 
                        (parseFloat(trip.fuelCost) || 0) + 
                        (parseFloat(trip.maintenance) || 0);
        } else {
            // For individual trips: driver cost + fuel cost + maintenance + toll/parking
            totalCosts = (parseFloat(trip.driverCost) || 0) + 
                        (parseFloat(trip.fuelCost) || 0) + 
                        (parseFloat(trip.maintenance) || 0) + 
                        (parseFloat(trip.tollParking) || 0);
        }
        
        const profit = (parseFloat(trip.payment) || 0) - totalCosts;
        
        return `
            <tr>
                <td>${new Date(trip.date).toLocaleDateString('en-IN')}</td>
                <td>${trip.route}</td>
                <td>${trip.tripType}</td>
                <td>${vehicleDisplay}</td>
                <td>${driver ? driver.name : 'N/A'}</td>
                <td>${company}</td>
                <td>${(trip.kilometre || 0).toLocaleString('en-IN')}</td>
                <td>₹${(trip.payment || 0).toLocaleString('en-IN')}</td>
                <td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">₹${profit.toLocaleString('en-IN')}</td>
                <td class="actions">
                    <button class="btn btn-small btn-info" onclick="viewTrip(${trip.id})">View</button>
                    <button class="btn btn-small btn-edit" onclick="editTrip(${trip.id})">Edit</button>
                    <button class="btn btn-small btn-delete" onclick="deleteTrip(${trip.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewTrip(tripId) {
    const trip = storage.getById('trips', tripId);
    if (!trip) {
        showAlert('Trip not found!', 'error');
        return;
    }

    const vehicle = trip.vehicleId ? 
        vehicles.find(v => v.id === trip.vehicleId) :
        null;
    const vehicleDisplay = vehicle ? `${vehicle.name} - ${vehicle.number} (${vehicle.type})` : trip.vehicleDetails || 'Manual Entry';
        
    const driver = drivers.find(d => d.id === trip.driverId);
    const company = trip.companyId ? 
        companies.find(c => c.id === trip.companyId) :
        null;
    const vendor = trip.vendorId ?
        vendors.find(v => v.id === trip.vendorId) :
        null;
        
    let totalCosts = 0;
    
    if (trip.tripType === 'Outsource') {
        // For outsource trips: vendor share + toll/parking
        totalCosts = (parseFloat(trip.vendorShare) || 0) + (parseFloat(trip.tollParking) || 0);
    } else if (trip.tripType === 'Company') {
        // For company trips: driver cost + fuel cost + maintenance (toll/parking is reimbursed)
        totalCosts = (parseFloat(trip.driverCost) || 0) + 
                    (parseFloat(trip.fuelCost) || 0) + 
                    (parseFloat(trip.maintenance) || 0);
    } else {
        // For individual trips: driver cost + fuel cost + maintenance + toll/parking
        totalCosts = (parseFloat(trip.driverCost) || 0) + 
                    (parseFloat(trip.fuelCost) || 0) + 
                    (parseFloat(trip.maintenance) || 0) + 
                    (parseFloat(trip.tollParking) || 0);
    }
    
    const profit = (parseFloat(trip.payment) || 0) - totalCosts;

    let detailsHtml = `
        <div class="trip-details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="detail-section">
                <h3>Basic Information</h3>
                <div class="detail-item"><strong>Date:</strong> ${new Date(trip.date).toLocaleDateString('en-IN')}</div>
                <div class="detail-item"><strong>Trip Type:</strong> ${trip.tripType}</div>
                <div class="detail-item"><strong>Route:</strong> ${trip.route}</div>
                <div class="detail-item"><strong>Route Type:</strong> ${trip.routeType}</div>
                <div class="detail-item"><strong>Distance:</strong> ${trip.kilometre || 0} KM</div>
                ${trip.description ? `<div class="detail-item"><strong>Description:</strong> ${trip.description}</div>` : ''}
            </div>
            
            <div class="detail-section">
                <h3>Assignment</h3>
                <div class="detail-item"><strong>Vehicle:</strong> ${vehicleDisplay}</div>
                <div class="detail-item"><strong>Driver:</strong> ${driver ? `${driver.name} (${driver.phone})` : 'N/A'}</div>
                ${trip.tripType === 'Company' && company ? `<div class="detail-item"><strong>Company:</strong> ${company}</div>` : ''}
                ${trip.tripType === 'Individual' && trip.clientName ? 
                    `<div class="detail-item"><strong>Client:</strong> ${trip.clientName}${trip.clientPhone ? ` (${trip.clientPhone})` : ''}</div>` : ''
                }
                ${trip.tripType === 'Outsource' && trip.vendorName ? `<div class="detail-item"><strong>Vendor:</strong> ${trip.vendorName}</div>` : ''}
                ${trip.tripType === 'Outsource' && trip.clientName ? 
                    `<div class="detail-item"><strong>Client:</strong> ${trip.clientName}${trip.clientPhone ? ` (${trip.clientPhone})` : ''}</div>` : ''
                }
            </div>
        </div>

        <div class="trip-details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="detail-section">
                <h3>Financial Details</h3>
                <div class="detail-item"><strong>Payment Method:</strong> ${trip.paymentMethod}</div>
                <div class="detail-item"><strong>Payment Received:</strong> ₹${(trip.payment || 0).toLocaleString('en-IN')}</div>
                ${trip.tripType === 'Outsource' ? 
                    `<div class="detail-item"><strong>Vendor Share:</strong> ₹${(trip.vendorShare || 0).toLocaleString('en-IN')}</div>
                     ${trip.vendorName ? `<div class="detail-item"><strong>Vendor Name:</strong> ${trip.vendorName}</div>` : ''}` :
                    `<div class="detail-item"><strong>Driver Cost:</strong> ₹${(trip.driverCost || 0).toLocaleString('en-IN')}</div>
                     <div class="detail-item"><strong>Fuel Cost:</strong> ₹${(trip.fuelCost || 0).toLocaleString('en-IN')}</div>
                     ${trip.maintenance > 0 ? `<div class="detail-item"><strong>Maintenance:</strong> ₹${trip.maintenance.toLocaleString('en-IN')}</div>` : ''}
                     ${trip.maintenanceReason ? `<div class="detail-item"><strong>Maintenance Reason:</strong> ${trip.maintenanceReason}</div>` : ''}`
                }
                ${trip.tollParking > 0 ? `<div class="detail-item"><strong>Toll & Parking:</strong> ₹${trip.tollParking.toLocaleString('en-IN')}</div>` : ''}
            </div>
            
            <div class="detail-section">
                <h3>Summary</h3>
                <div class="detail-item"><strong>Total Costs:</strong> ₹${totalCosts.toLocaleString('en-IN')}</div>
                <div class="detail-item"><strong>Net Profit:</strong> <span class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">₹${profit.toLocaleString('en-IN')}</span></div>
            </div>
        </div>
    `;

    // Add company trip specific details
    if (trip.tripType === 'Company' && (trip.startDateTime || trip.endDateTime || trip.totalDays)) {
        detailsHtml += `
            <div class="detail-section">
                <h3>Company Trip Details</h3>
                ${trip.startDateTime ? `<div class="detail-item"><strong>Start Date & Time:</strong> ${new Date(trip.startDateTime).toLocaleString('en-IN')}</div>` : ''}
                ${trip.endDateTime ? `<div class="detail-item"><strong>End Date & Time:</strong> ${new Date(trip.endDateTime).toLocaleString('en-IN')}</div>` : ''}
                ${trip.totalDays ? `<div class="detail-item"><strong>Total Days:</strong> ${trip.totalDays}</div>` : ''}
            </div>
        `;
    }

    document.getElementById('tripDetails').innerHTML = detailsHtml;
    const modal = document.getElementById('viewTripModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function closeViewModal() {
    const modal = document.getElementById('viewTripModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
}

function editTrip(tripId) {
    const trip = storage.getById('trips', tripId);
    if (!trip) {
        showAlert('Trip not found!', 'error');
        return;
    }

    editingTripId = tripId;
    
    // Fill form with trip data
    document.getElementById('editTripDate').value = trip.date;
    document.getElementById('editTripType').value = trip.tripType;
    document.getElementById('editRoute').value = trip.route;
    document.getElementById('editRouteType').value = trip.routeType;
    document.getElementById('editKilometre').value = trip.kilometre;
    document.getElementById('editFuelCost').value = trip.fuelCost;
    document.getElementById('editPaymentMethod').value = trip.paymentMethod;
    document.getElementById('editPayment').value = trip.payment;
    document.getElementById('editDriverCost').value = trip.driverCost;
    document.getElementById('editMaintenance').value = trip.maintenance || 0;
    document.getElementById('editMaintenanceReason').value = trip.maintenanceReason || '';
    document.getElementById('editDescription').value = trip.description || '';

    // Handle vehicle selection
    if (trip.vehicleId) {
        document.getElementById('editVehicleId').value = trip.vehicleId;
        document.getElementById('editManualVehicleGroup').style.display = 'none';
    } else if (trip.vehicleDetails) {
        document.getElementById('editVehicleId').value = 'manual';
        document.getElementById('editManualVehicle').value = trip.vehicleDetails;
        document.getElementById('editManualVehicleGroup').style.display = 'block';
    }

    // Handle driver
    document.getElementById('editDriverId').value = trip.driverId;

    // Handle trip type specific fields
    handleEditTripTypeChange();

    if (trip.tripType === 'Company') {
        document.getElementById('editCompanyId').value = trip.companyId || '';
        document.getElementById('editTollParking').value = trip.tollParking || 0;
        document.getElementById('editStartDateTime').value = trip.startDateTime || '';
        document.getElementById('editEndDateTime').value = trip.endDateTime || '';
        document.getElementById('editTotalDays').value = trip.totalDays || 0;
    }

    if (trip.tripType === 'Outsource') {
        document.getElementById('editVendorId').value = trip.vendorId || '';
    }

    // Show modal
    const modal = document.getElementById('editTripModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function handleEditTripTypeChange() {
    const tripType = document.getElementById('editTripType').value;
    const companyGroup = document.getElementById('editCompanyGroup');
    const vendorGroup = document.getElementById('editVendorGroup');
    const companyFields = document.getElementById('editCompanyFields');

    // Reset visibility
    companyGroup.style.display = 'none';
    vendorGroup.style.display = 'none';
    companyFields.style.display = 'none';

    if (tripType === 'Company') {
        companyGroup.style.display = 'block';
        companyFields.style.display = 'block';
        document.getElementById('editCompanyId').required = true;
        document.getElementById('editVendorId').required = false;
    } else if (tripType === 'Outsource') {
        vendorGroup.style.display = 'block';
        document.getElementById('editVendorId').required = true;
        document.getElementById('editCompanyId').required = false;
    } else {
        document.getElementById('editCompanyId').required = false;
        document.getElementById('editVendorId').required = false;
    }
}

function handleEditVehicleChange() {
    const vehicleId = document.getElementById('editVehicleId').value;
    const manualVehicleGroup = document.getElementById('editManualVehicleGroup');

    if (vehicleId === 'manual') {
        manualVehicleGroup.style.display = 'block';
        document.getElementById('editManualVehicle').required = true;
        document.getElementById('editVehicleId').required = false;
    } else {
        manualVehicleGroup.style.display = 'none';
        document.getElementById('editManualVehicle').required = false;
        document.getElementById('editVehicleId').required = true;
    }
}

function calculateEditTotalDays() {
    const startDateTime = document.getElementById('editStartDateTime').value;
    const endDateTime = document.getElementById('editEndDateTime').value;

    if (startDateTime && endDateTime) {
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        const diffTime = Math.abs(end - start);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        document.getElementById('editTotalDays').value = diffDays.toFixed(1);
    }
}

function updateTrip() {
    if (!editingTripId) return;

    const tripData = {
        date: document.getElementById('editTripDate').value,
        tripType: document.getElementById('editTripType').value,
        route: document.getElementById('editRoute').value,
        routeType: document.getElementById('editRouteType').value,
        kilometre: parseFloat(document.getElementById('editKilometre').value),
        fuelCost: parseFloat(document.getElementById('editFuelCost').value),
        paymentMethod: document.getElementById('editPaymentMethod').value,
        payment: parseFloat(document.getElementById('editPayment').value),
        driverCost: parseFloat(document.getElementById('editDriverCost').value),
        maintenance: parseFloat(document.getElementById('editMaintenance').value) || 0,
        maintenanceReason: document.getElementById('editMaintenanceReason').value || '',
        description: document.getElementById('editDescription').value || ''
    };

    // Handle vehicle selection
    const vehicleId = document.getElementById('editVehicleId').value;
    if (vehicleId === 'manual') {
        tripData.vehicleDetails = document.getElementById('editManualVehicle').value;
        tripData.vehicleId = null;
    } else {
        tripData.vehicleId = parseInt(vehicleId);
        tripData.vehicleDetails = null;
    }

    // Add driver
    tripData.driverId = parseInt(document.getElementById('editDriverId').value);

    // Add company if Company trip
    if (tripData.tripType === 'Company') {
        tripData.companyId = parseInt(document.getElementById('editCompanyId').value);
        tripData.tollParking = parseFloat(document.getElementById('editTollParking').value) || 0;
        tripData.startDateTime = document.getElementById('editStartDateTime').value || null;
        tripData.endDateTime = document.getElementById('editEndDateTime').value || null;
        tripData.totalDays = parseFloat(document.getElementById('editTotalDays').value) || 0;
    }

    // Add vendor if Outsource trip
    if (tripData.tripType === 'Outsource') {
        tripData.vendorId = parseInt(document.getElementById('editVendorId').value);
    }

    try {
        storage.update('trips', editingTripId, tripData);
        showAlert('Trip updated successfully!', 'success');
        closeTripModal();
        loadData();
        loadTripsTable();
    } catch (error) {
        showAlert('Error updating trip: ' + error.message, 'error');
    }
}

function deleteTrip(tripId) {
    const trip = storage.getById('trips', tripId);
    if (!trip) {
        showAlert('Trip not found!', 'error');
        return;
    }

    const confirmMessage = `Are you sure you want to delete this trip?\n\nRoute: ${trip.route}\nDate: ${new Date(trip.date).toLocaleDateString('en-IN')}\nPayment: ₹${trip.payment || 0}`;
    
    if (confirm(confirmMessage)) {
        try {
            storage.delete('trips', tripId);
            showAlert('Trip deleted successfully!', 'success');
            loadData();
            loadTripsTable();
        } catch (error) {
            showAlert('Error deleting trip: ' + error.message, 'error');
        }
    }
}

function closeTripModal() {
    const modal = document.getElementById('editTripModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    editingTripId = null;
    document.getElementById('editTripForm').reset();
    
    // Reset conditional fields
    document.getElementById('editCompanyGroup').style.display = 'none';
    document.getElementById('editVendorGroup').style.display = 'none';
    document.getElementById('editCompanyFields').style.display = 'none';
    document.getElementById('editManualVehicleGroup').style.display = 'none';
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.querySelector('main').insertBefore(alert, document.querySelector('main').firstChild);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const editModal = document.getElementById('editTripModal');
    const viewModal = document.getElementById('viewTripModal');
    
    if (event.target == editModal) {
        closeTripModal();
    } else if (event.target == viewModal) {
        closeViewModal();
    }
}
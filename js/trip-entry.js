console.log('🔥🔥🔥 trip-entry.js VERSION 2025-01-28-16:30 loaded! 🔥🔥🔥');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Trip entry page loaded!');
    
    try {
        console.log('Setting default date...');
        setDefaultDate();
        console.log('Default date set');
    } catch (error) {
        console.error('Error setting default date:', error);
    }
    
    try {
        console.log('Setting up form...');
        setupForm();
        console.log('Form setup complete');
    } catch (error) {
        console.error('Error setting up form:', error);
    }
});

// Wait for database to be ready, then load data
window.addEventListener('databaseReady', async function() {
    console.log('🔄 Database ready, loading trip entry data...');
    try {
        console.log('Loading dropdown data...');
        await loadDropdownData();
        console.log('Dropdown data loaded');
        
        console.log('Loading recent trips...');
        await loadRecentTrips();
        console.log('Recent trips loaded');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please refresh the page.');
    }
});

async function loadDropdownData() {
    try {
        console.log('🔄 Loading vehicles from database...');
        // Load vehicles
        const vehicles = (await storage.getAllAsync('vehicles')).filter(v => v.status === 'Active');
        console.log('📋 Vehicles loaded:', vehicles);
        
        const vehicleSelect = document.getElementById('vehicleId');
        if (!vehicleSelect) {
            console.error('Vehicle select element not found');
            return;
        }
        vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
        
        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.name} - ${vehicle.number} (${vehicle.type})`;
            vehicleSelect.appendChild(option);
        });
        
        // Add manual entry option for outsource
        const manualOption = document.createElement('option');
        manualOption.value = 'manual';
        manualOption.textContent = 'Manual Entry (Outsource Vehicle)';
        vehicleSelect.appendChild(manualOption);

        // Add "Add More" option
        const addMoreOption = document.createElement('option');
        addMoreOption.value = 'add_more';
        addMoreOption.textContent = '+ Add New Vehicle';
        addMoreOption.style.color = '#667eea';
        addMoreOption.style.fontWeight = 'bold';
        vehicleSelect.appendChild(addMoreOption);

        // Load drivers
        console.log('🔄 Loading drivers from database...');
        const drivers = (await storage.getAllAsync('drivers')).filter(d => d.status === 'Active');
        console.log('📋 Drivers loaded:', drivers);
        
        const driverSelect = document.getElementById('driverId');
        if (!driverSelect) {
            console.error('Driver select element not found');
            return;
        }
        driverSelect.innerHTML = '<option value="">Select Driver</option>';
        
        drivers.forEach(driver => {
            const option = document.createElement('option');
            option.value = driver.id;
            option.textContent = `${driver.name} (${driver.phone})`;
            driverSelect.appendChild(option);
        });

        // Add "Add More" option for drivers
        const addMoreDriverOption = document.createElement('option');
        addMoreDriverOption.value = 'add_more';
        addMoreDriverOption.textContent = '+ Add New Driver';
        addMoreDriverOption.style.color = '#667eea';
        addMoreDriverOption.style.fontWeight = 'bold';
        driverSelect.appendChild(addMoreDriverOption);

        // Load companies
        console.log('🔄 Loading companies from database...');
        const companies = (await storage.getAllAsync('companies')).filter(c => c.status === 'Active');
        console.log('📋 Companies loaded:', companies);
        
        const companySelect = document.getElementById('companyId');
        companySelect.innerHTML = '<option value="">Select Company</option>';
        
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            companySelect.appendChild(option);
        });

        // Vendor is now a text input, no need to populate dropdown
        console.log('Vendor field is now manual text entry');
        console.log(`✅ Loaded dropdowns: ${vehicles.length} vehicles, ${drivers.length} drivers, ${companies.length} companies`);
    } catch (error) {
        console.error('Error loading dropdown data:', error);
        alert('Error loading data. Please refresh the page.');
    }
}

function setDefaultDate() {
    const today = new Date();
    const tripDateElement = document.getElementById('tripDate');
    if (tripDateElement) {
        tripDateElement.value = today.toISOString().split('T')[0];
    }
}

function setupForm() {
    console.log('Setting up form...');
    const form = document.getElementById('tripForm');
    if (!form) {
        console.error('Trip form not found!');
        return;
    }
    
    form.addEventListener('submit', function(e) {
        console.log('Form submitted!');
        e.preventDefault();
        saveTrip();
    });

    // Setup quick add forms
    document.getElementById('quickAddVehicleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveQuickVehicle();
    });

    document.getElementById('quickAddDriverForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveQuickDriver();
    });
}

function handleDriverSelection() {
    const driverId = document.getElementById('driverId').value;
    
    if (driverId === 'add_more') {
        // Open quick add driver modal
        openQuickAddDriverModal();
        // Reset selection
        document.getElementById('driverId').value = '';
        return;
    }
}

function handleTripTypeChange() {
    const tripType = document.getElementById('tripType').value;
    const companyGroup = document.getElementById('companyGroup');
    const vendorGroup = document.getElementById('vendorGroup');
    const clientNameGroup = document.getElementById('clientNameGroup');
    const clientPhoneGroup = document.getElementById('clientPhoneGroup');
    const companyFields = document.getElementById('companyFields');
    const fuelCostGroup = document.getElementById('fuelCostGroup');
    const vendorShareGroup = document.getElementById('vendorShareGroup');
    const driverCostGroup = document.getElementById('driverCostGroup');
    const maintenanceGroup = document.getElementById('maintenanceGroup');
    const maintenanceReasonGroup = document.getElementById('maintenanceReasonGroup');
    const vehicleGroup = document.getElementById('vehicleGroup');
    const manualVehicleGroup = document.getElementById('manualVehicleGroup');

    // Reset visibility
    companyGroup.style.display = 'none';
    vendorGroup.style.display = 'none';
    clientNameGroup.style.display = 'none';
    clientPhoneGroup.style.display = 'none';
    companyFields.style.display = 'none';
    vendorShareGroup.style.display = 'none';
    fuelCostGroup.style.display = 'block'; // Show by default
    driverCostGroup.style.display = 'block'; // Show by default
    maintenanceGroup.style.display = 'block'; // Show by default
    maintenanceReasonGroup.style.display = 'block'; // Show by default

    if (tripType === 'Company') {
        companyGroup.style.display = 'block';
        companyFields.style.display = 'block';
        document.getElementById('companyId').required = true;
        document.getElementById('vendorName').required = false;
        document.getElementById('clientName').required = false;
        document.getElementById('fuelCost').required = true;
        document.getElementById('vendorShare').required = false;
        document.getElementById('driverCost').required = true;
    } else if (tripType === 'Outsource') {
        vendorGroup.style.display = 'block';
        vendorShareGroup.style.display = 'block';
        clientNameGroup.style.display = 'block';
        clientPhoneGroup.style.display = 'block';
        fuelCostGroup.style.display = 'none'; // Hide fuel cost for outsource
        driverCostGroup.style.display = 'none'; // Hide driver cost for outsource
        maintenanceGroup.style.display = 'none'; // Hide maintenance for outsource
        maintenanceReasonGroup.style.display = 'none'; // Hide maintenance reason for outsource
        
        document.getElementById('vendorName').required = true;
        document.getElementById('vendorShare').required = true;
        document.getElementById('companyId').required = false;
        document.getElementById('clientName').required = true;
        document.getElementById('fuelCost').required = false;
        document.getElementById('driverCost').required = false;
        
        // For outsource, default to manual vehicle entry
        document.getElementById('vehicleId').value = 'manual';
        handleVehicleChange();
    } else if (tripType === 'Individual') {
        clientNameGroup.style.display = 'block';
        clientPhoneGroup.style.display = 'block';
        document.getElementById('companyId').required = false;
        document.getElementById('vendorName').required = false;
        document.getElementById('clientName').required = true;
        document.getElementById('fuelCost').required = true;
        document.getElementById('vendorShare').required = false;
        document.getElementById('driverCost').required = true;
    } else {
        document.getElementById('companyId').required = false;
        document.getElementById('vendorName').required = false;
        document.getElementById('clientName').required = false;
        document.getElementById('fuelCost').required = true;
        document.getElementById('vendorShare').required = false;
        document.getElementById('driverCost').required = true;
        
        // Reset vehicle selection for individual trips
        document.getElementById('vehicleId').value = '';
        handleVehicleChange();
    }
}

function handleVehicleChange() {
    const vehicleId = document.getElementById('vehicleId').value;
    const vehicleGroup = document.getElementById('vehicleGroup');
    const manualVehicleGroup = document.getElementById('manualVehicleGroup');

    if (vehicleId === 'add_more') {
        // Open quick add vehicle modal
        openQuickAddVehicleModal();
        // Reset selection
        document.getElementById('vehicleId').value = '';
        return;
    } else if (vehicleId === 'manual') {
        manualVehicleGroup.style.display = 'block';
        document.getElementById('manualVehicle').required = true;
        document.getElementById('vehicleId').required = false;
    } else {
        manualVehicleGroup.style.display = 'none';
        document.getElementById('manualVehicle').required = false;
        document.getElementById('vehicleId').required = true;
    }
}

function calculateTotalDays() {
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;

    if (startDateTime && endDateTime) {
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        const diffTime = Math.abs(end - start);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        document.getElementById('totalDays').value = diffDays.toFixed(1);
    }
}

function calculateProfit() {
    const tripType = document.getElementById('tripType').value;
    const payment = parseFloat(document.getElementById('payment').value) || 0;
    const tollParking = parseFloat(document.getElementById('tollParking').value) || 0;
    
    console.log('calculateProfit - tripType:', tripType);
    console.log('calculateProfit - payment:', payment);
    console.log('calculateProfit - tollParking:', tollParking);
    
    let totalCosts = 0;
    
    if (tripType === 'Outsource') {
        // For outsource: vendor share + toll/parking
        const vendorShare = parseFloat(document.getElementById('vendorShare').value) || 0;
        totalCosts = vendorShare + tollParking;
        console.log('calculateProfit - Outsource - vendorShare:', vendorShare);
        console.log('calculateProfit - Outsource - totalCosts:', totalCosts);
    } else if (tripType === 'Company') {
        // For company: driver cost + fuel cost + maintenance (toll/parking is reimbursed)
        const driverCost = parseFloat(document.getElementById('driverCost').value) || 0;
        const fuelCost = parseFloat(document.getElementById('fuelCost').value) || 0;
        const maintenance = parseFloat(document.getElementById('maintenance').value) || 0;
        totalCosts = driverCost + fuelCost + maintenance;
        console.log('calculateProfit - Company - driverCost:', driverCost);
        console.log('calculateProfit - Company - fuelCost:', fuelCost);
        console.log('calculateProfit - Company - maintenance:', maintenance);
        console.log('calculateProfit - Company - totalCosts (excluding toll/parking):', totalCosts);
    } else {
        // For individual: driver cost + fuel cost + maintenance + toll/parking
        const driverCost = parseFloat(document.getElementById('driverCost').value) || 0;
        const fuelCost = parseFloat(document.getElementById('fuelCost').value) || 0;
        const maintenance = parseFloat(document.getElementById('maintenance').value) || 0;
        totalCosts = driverCost + fuelCost + maintenance + tollParking;
        console.log('calculateProfit - Individual - driverCost:', driverCost);
        console.log('calculateProfit - Individual - fuelCost:', fuelCost);
        console.log('calculateProfit - Individual - maintenance:', maintenance);
        console.log('calculateProfit - Individual - totalCosts:', totalCosts);
    }

    const netProfit = payment - totalCosts;
    console.log('calculateProfit - netProfit:', netProfit);

    document.getElementById('totalRevenue').textContent = payment.toLocaleString('en-IN');
    document.getElementById('totalCosts').textContent = totalCosts.toLocaleString('en-IN');
    document.getElementById('netProfit').textContent = netProfit.toLocaleString('en-IN');

    // Update profit row styling (green for profit, red for loss)
    const profitRow = document.getElementById('profitRow');
    if (profitRow) {
        if (netProfit < 0) {
            profitRow.classList.add('negative');
        } else {
            profitRow.classList.remove('negative');
        }
    }

    document.getElementById('profitDisplay').style.display = 'block';
}

let isSaving = false;

async function saveTrip() {
    console.log('saveTrip function called!');
    
    // Prevent double submissions
    if (isSaving) {
        console.log('Save already in progress, ignoring...');
        return;
    }
    
    isSaving = true;
    const saveButton = document.querySelector('button[type="submit"]');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
    }
    
    const tripType = document.getElementById('tripType').value;
    console.log('Trip type:', tripType);
    const tripData = {
        date: document.getElementById('tripDate').value,
        tripType: tripType,
        route: document.getElementById('route').value,
        routeType: document.getElementById('routeType').value,
        kilometre: parseFloat(document.getElementById('kilometre').value),
        paymentMethod: document.getElementById('paymentMethod').value,
        payment: parseFloat(document.getElementById('payment').value),
        description: document.getElementById('description').value || ''
    };

    // Handle costs based on trip type
    if (tripType === 'Outsource') {
        tripData.driverCost = 0;
        tripData.maintenance = 0;
        tripData.maintenanceReason = '';
    } else {
        tripData.driverCost = parseFloat(document.getElementById('driverCost').value);
        tripData.maintenance = parseFloat(document.getElementById('maintenance').value) || 0;
        tripData.maintenanceReason = document.getElementById('maintenanceReason').value || '';
    }

    // Handle fuel cost vs vendor share based on trip type
    if (tripType === 'Outsource') {
        tripData.fuelCost = 0;
        tripData.vendorShare = parseFloat(document.getElementById('vendorShare').value);
    } else {
        tripData.fuelCost = parseFloat(document.getElementById('fuelCost').value);
        tripData.vendorShare = 0;
    }

    // Handle vehicle selection
    const vehicleId = document.getElementById('vehicleId').value;
    if (vehicleId === 'manual') {
        tripData.vehicleDetails = document.getElementById('manualVehicle').value;
        tripData.vehicleId = null;
    } else {
        tripData.vehicleId = parseInt(vehicleId);
        tripData.vehicleDetails = null;
    }

    // Add driver
    tripData.driverId = parseInt(document.getElementById('driverId').value);

    // Add company if Company trip
    if (tripData.tripType === 'Company') {
        tripData.companyId = parseInt(document.getElementById('companyId').value);
        tripData.tollParking = parseFloat(document.getElementById('tollParking').value) || 0;
        tripData.startDateTime = document.getElementById('startDateTime').value || null;
        tripData.endDateTime = document.getElementById('endDateTime').value || null;
        tripData.totalDays = parseFloat(document.getElementById('totalDays').value) || 0;
    }

    // Add vendor if Outsource trip
    if (tripData.tripType === 'Outsource') {
        tripData.vendorName = document.getElementById('vendorName').value;
        tripData.clientName = document.getElementById('clientName').value;
        tripData.clientPhone = document.getElementById('clientPhone').value || null;
    }

    // Add client if Individual trip
    if (tripData.tripType === 'Individual') {
        tripData.clientName = document.getElementById('clientName').value;
        tripData.clientPhone = document.getElementById('clientPhone').value || null;
    }

    // Validate required fields
    if (!validateTripData(tripData)) {
        return;
    }

    try {
        console.log('Attempting to save trip:', tripData);
        
        // DIRECT FIX: Convert camelCase to snake_case for database
        console.log('🚀 BEFORE CONVERSION - companyId:', tripData.companyId);
        const dbTripData = {
            date: tripData.date,
            trip_type: tripData.tripType,
            route: tripData.route,
            route_type: tripData.routeType,
            kilometre: tripData.kilometre,
            vehicle_id: tripData.vehicleId,
            vehicle_details: tripData.vehicleDetails,
            driver_id: tripData.driverId,
            company_id: tripData.companyId,
            client_name: tripData.clientName,
            client_phone: tripData.clientPhone,
            vendor_name: tripData.vendorName,
            vendor_share: tripData.vendorShare,
            payment_method: tripData.paymentMethod,
            payment: tripData.payment,
            driver_cost: tripData.driverCost,
            fuel_cost: tripData.fuelCost,
            maintenance: tripData.maintenance,
            maintenance_reason: tripData.maintenanceReason,
            toll_parking: tripData.tollParking,
            start_date_time: tripData.startDateTime,
            end_date_time: tripData.endDateTime,
            total_days: tripData.totalDays,
            description: tripData.description
        };
        
        console.log('Converted for database:', dbTripData);
        console.log('🚀 AFTER CONVERSION - company_id:', dbTripData.company_id);
        console.log('🚀 dbTripData keys:', Object.keys(dbTripData));
        const savedTrip = await storage.addTrip(dbTripData);
        console.log('Trip saved successfully:', savedTrip);
        showAlert('Trip saved successfully!', 'success');
        clearForm();
        await loadRecentTrips();
    } catch (error) {
        console.error('Error saving trip:', error);
        showAlert('Error saving trip: ' + error.message, 'error');
    } finally {
        // Reset saving state and button
        isSaving = false;
        const saveButton = document.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Trip';
        }
    }
}

function validateTripData(tripData) {
    const errors = [];
    
    console.log('🔍 Validating trip data:', tripData);
    console.log('🔍 fuelCost value:', tripData.fuelCost, 'type:', typeof tripData.fuelCost, 'isNaN:', isNaN(tripData.fuelCost));
    console.log('🔍 payment value:', tripData.payment, 'type:', typeof tripData.payment, 'isNaN:', isNaN(tripData.payment));
    console.log('🔍 driverCost value:', tripData.driverCost, 'type:', typeof tripData.driverCost, 'isNaN:', isNaN(tripData.driverCost));

    if (!tripData.date) errors.push('Trip date is required');
    if (!tripData.tripType) errors.push('Trip type is required');
    if (!tripData.route) errors.push('Route is required');
    if (!tripData.routeType) errors.push('Route type is required');
    if (isNaN(tripData.kilometre) || tripData.kilometre < 0) errors.push('Valid distance is required');
    
    // Validate fuel cost or vendor share based on trip type
    if (tripData.tripType === 'Outsource') {
        if (isNaN(tripData.vendorShare) || tripData.vendorShare < 0) errors.push('Valid vendor share is required for outsource trips');
    } else {
        if (isNaN(tripData.fuelCost) || tripData.fuelCost < 0) errors.push('Valid fuel cost is required');
    }
    if (!tripData.paymentMethod) errors.push('Payment method is required');
    if (isNaN(tripData.payment) || tripData.payment < 0) errors.push('Valid payment amount is required');
    
    // Driver cost only required for non-outsource trips
    if (tripData.tripType !== 'Outsource') {
        if (isNaN(tripData.driverCost) || tripData.driverCost < 0) errors.push('Valid driver cost is required');
    }
    
    if (!tripData.driverId) errors.push('Driver selection is required');

    // Vehicle validation
    if (!tripData.vehicleId && !tripData.vehicleDetails) {
        errors.push('Vehicle selection or manual entry is required');
    }

    // Trip type specific validation
    if (tripData.tripType === 'Company' && !tripData.companyId) {
        errors.push('Company selection is required for company trips');
    }

    if (tripData.tripType === 'Outsource' && !tripData.vendorName) {
        errors.push('Vendor name is required for outsource trips');
    }

    if (errors.length > 0) {
        console.log('Validation errors:', errors);
        console.log('Trip data:', tripData);
        showAlert('Please fix the following errors:\n' + errors.join('\n'), 'error');
        return false;
    }

    return true;
}

function clearForm() {
    document.getElementById('tripForm').reset();
    setDefaultDate();
    document.getElementById('profitDisplay').style.display = 'none';
    
    // Reset conditional fields
    document.getElementById('companyGroup').style.display = 'none';
    document.getElementById('vendorGroup').style.display = 'none';
    document.getElementById('clientNameGroup').style.display = 'none';
    document.getElementById('clientPhoneGroup').style.display = 'none';
    document.getElementById('companyFields').style.display = 'none';
    document.getElementById('manualVehicleGroup').style.display = 'none';
    
    // Reset required attributes
    const companyId = document.getElementById('companyId');
    const vendorName = document.getElementById('vendorName');
    const clientName = document.getElementById('clientName');
    const manualVehicle = document.getElementById('manualVehicle');
    const vehicleId = document.getElementById('vehicleId');
    const fuelCost = document.getElementById('fuelCost');
    const vendorShare = document.getElementById('vendorShare');
    const driverCost = document.getElementById('driverCost');
    
    if (companyId) companyId.required = false;
    if (vendorName) vendorName.required = false;
    if (clientName) clientName.required = false;
    if (manualVehicle) manualVehicle.required = false;
    if (vehicleId) vehicleId.required = true;
    if (fuelCost) fuelCost.required = true;
    if (vendorShare) vendorShare.required = false;
    if (driverCost) driverCost.required = true;
}

async function loadRecentTrips() {
    try {
        const trips = (await storage.getTrips()).slice(0, 10);
        const recentTripsDiv = document.getElementById('recentTrips');
        if (!recentTripsDiv) {
            console.error('Recent trips div not found');
            return;
        }

        if (trips.length === 0) {
            recentTripsDiv.innerHTML = '<p>No trips recorded yet.</p>';
            return;
        }

        const vehicles = await storage.getAllAsync('vehicles');
        const companies = await storage.getAllAsync('companies');
        const drivers = await storage.getAllAsync('drivers');

    recentTripsDiv.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Route</th>
                        <th>Type</th>
                        <th>Vehicle</th>
                        <th>Driver</th>
                        <th>Client/Company</th>
                        <th>Payment</th>
                        <th>Profit</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${trips.map(trip => {
                        const vehicle = trip.vehicleId ? vehicles.find(v => v.id === trip.vehicleId) : null;
                        const company = trip.companyId ? companies.find(c => c.id === trip.companyId) : null;
                        const driver = drivers.find(d => d.id === trip.driverId);
                        const vendor = trip.vendorId ? vendors.find(v => v.id === trip.vendorId) : null;

                        let totalCosts = 0;
                        
                        if (trip.tripType === 'Outsource') {
                            // For outsource trips: vendor share + toll/parking
                            totalCosts = (trip.vendorShare || 0) + (trip.tollParking || 0);
                        } else if (trip.tripType === 'Company') {
                            // For company trips: driver cost + fuel cost + maintenance (toll/parking is reimbursed)
                            totalCosts = (trip.driverCost || 0) + (trip.fuelCost || 0) + (trip.maintenance || 0);
                        } else {
                            // For individual trips: driver cost + fuel cost + maintenance + toll/parking
                            totalCosts = (trip.driverCost || 0) + (trip.fuelCost || 0) + (trip.maintenance || 0) + (trip.tollParking || 0);
                        }
                        
                        const profit = (trip.payment || 0) - totalCosts;

                        // Determine client/company display
                        let clientCompany = 'N/A';
                        if (trip.tripType === 'Company' && company) {
                            clientCompany = company.name;
                        } else if (trip.tripType === 'Individual' && trip.clientName) {
                            clientCompany = trip.clientName;
                        } else if (trip.tripType === 'Outsource' && trip.clientName) {
                            clientCompany = trip.clientName;
                        }

                        return `
                            <tr>
                                <td>${new Date(trip.date).toLocaleDateString('en-IN')}</td>
                                <td>${trip.route}</td>
                                <td>${trip.tripType}</td>
                                <td>${vehicle ? vehicle.number : trip.vehicleDetails || 'N/A'}</td>
                                <td>${driver ? driver.name : 'N/A'}</td>
                                <td>${clientCompany}</td>
                                <td>₹${(trip.payment || 0).toLocaleString('en-IN')}</td>
                                <td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">₹${profit.toLocaleString('en-IN')}</td>
                                <td class="actions">
                                    <button class="btn btn-small btn-info" onclick="viewTrip(${trip.id})">View</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    } catch (error) {
        console.error('Error loading recent trips:', error);
        const recentTripsDiv = document.getElementById('recentTrips');
        if (recentTripsDiv) {
            recentTripsDiv.innerHTML = '<p>Error loading recent trips.</p>';
        }
    }
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

// Quick Add Vehicle Functions
function openQuickAddVehicleModal() {
    const modal = document.getElementById('quickAddVehicleModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
    // Set default values
    document.getElementById('quickVehicleStatus').value = 'Active';
    document.getElementById('quickVehicleOwner').value = 'Own';
}

function closeQuickAddVehicleModal() {
    const modal = document.getElementById('quickAddVehicleModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.getElementById('quickAddVehicleForm').reset();
}

async function saveQuickVehicle() {
    const vehicleData = {
        name: document.getElementById('quickVehicleName').value,
        number: document.getElementById('quickVehicleNumber').value.toUpperCase(),
        type: document.getElementById('quickVehicleType').value,
        owner: document.getElementById('quickVehicleOwner').value,
        status: document.getElementById('quickVehicleStatus').value
    };

    try {
        const newVehicle = await storage.add('vehicles', vehicleData);
        showAlert('Vehicle added successfully!', 'success');
        closeQuickAddVehicleModal();
        
        // Refresh vehicle dropdown and select the new vehicle
        await loadDropdownData();
        document.getElementById('vehicleId').value = newVehicle.id;
    } catch (error) {
        showAlert('Error adding vehicle: ' + error.message, 'error');
    }
}

// Quick Add Driver Functions
function openQuickAddDriverModal() {
    const modal = document.getElementById('quickAddDriverModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
    // Set default value
    document.getElementById('quickDriverStatus').value = 'Active';
}

function closeQuickAddDriverModal() {
    const modal = document.getElementById('quickAddDriverModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.getElementById('quickAddDriverForm').reset();
}

async function saveQuickDriver() {
    const driverData = {
        name: document.getElementById('quickDriverName').value,
        phone: document.getElementById('quickDriverPhone').value,
        status: document.getElementById('quickDriverStatus').value
    };

    try {
        const newDriver = await storage.add('drivers', driverData);
        showAlert('Driver added successfully!', 'success');
        closeQuickAddDriverModal();
        
        // Refresh driver dropdown and select the new driver
        await loadDropdownData();
        document.getElementById('driverId').value = newDriver.id;
    } catch (error) {
        showAlert('Error adding driver: ' + error.message, 'error');
    }
}

async function viewTrip(tripId) {
    try {
        const trip = await storage.getByIdAsync('trips', tripId);
        if (!trip) {
            showAlert('Trip not found!', 'error');
            return;
        }

        const vehicles = await storage.getAllAsync('vehicles');
        const companies = await storage.getAllAsync('companies');
        const drivers = await storage.getAllAsync('drivers');

    const vehicle = trip.vehicleId ? 
        vehicles.find(v => v.id === trip.vehicleId) :
        null;
    const vehicleDisplay = vehicle ? `${vehicle.name} - ${vehicle.number} (${vehicle.type})` : trip.vehicleDetails || 'Manual Entry';
        
    const driver = drivers.find(d => d.id === trip.driverId);
    const company = trip.companyId ? 
        companies.find(c => c.id === trip.companyId) :
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
                ${trip.tripType === 'Company' && company ? `<div class="detail-item"><strong>Company:</strong> ${company.name}</div>` : ''}
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
        const modal = document.getElementById('tripModal');
        modal.style.display = 'flex';
        modal.classList.add('show');
    } catch (error) {
        console.error('Error viewing trip:', error);
        showAlert('Error loading trip details: ' + error.message, 'error');
    }
}

function closeTripModal() {
    const modal = document.getElementById('tripModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const vehicleModal = document.getElementById('quickAddVehicleModal');
    const driverModal = document.getElementById('quickAddDriverModal');
    const tripModal = document.getElementById('tripModal');
    
    if (event.target == vehicleModal) {
        closeQuickAddVehicleModal();
    } else if (event.target == driverModal) {
        closeQuickAddDriverModal();
    } else if (event.target == tripModal) {
        closeTripModal();
    }
}
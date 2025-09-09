document.addEventListener('DOMContentLoaded', function() {
    // Don't load data immediately - wait for database
});

// Wait for database to be ready, then load data
window.addEventListener('databaseReady', async function() {
    console.log('🔄 Database ready, loading dashboard data...');
    try {
        await updateDashboard();
        await loadRecentTrips();
        console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
});

async function updateDashboard() {
    try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // Update stats
        const todaysTrips = (await storage.getTodaysTrips()).length;
        const monthRevenue = await storage.getMonthlyRevenue(currentYear, currentMonth);
        const monthProfit = await storage.getMonthlyProfit(currentYear, currentMonth);
        const activeVehicles = await storage.getActiveVehiclesCount();

        document.getElementById('todaysTrips').textContent = todaysTrips;
        document.getElementById('monthRevenue').textContent = `₹${monthRevenue.toLocaleString('en-IN')}`;
        document.getElementById('monthProfit').textContent = `₹${monthProfit.toLocaleString('en-IN')}`;
        document.getElementById('activeVehicles').textContent = activeVehicles;
    } catch (error) {
        console.error('Error updating dashboard:', error);
        // Show fallback values
        document.getElementById('todaysTrips').textContent = '0';
        document.getElementById('monthRevenue').textContent = '₹0';
        document.getElementById('monthProfit').textContent = '₹0';
        document.getElementById('activeVehicles').textContent = '0';
    }
}

async function loadRecentTrips() {
    try {
        const trips = (await storage.getTrips()).slice(0, 5); // Get last 5 trips
    const tripsList = document.getElementById('recentTripsList');

    if (trips.length === 0) {
        tripsList.innerHTML = '<p>No trips recorded yet. <a href="trip-entry.html">Add your first trip</a></p>';
        return;
        }

        const vehicles = await storage.getAllAsync('vehicles');
        const companies = await storage.getAllAsync('companies');
        const drivers = await storage.getAllAsync('drivers');

        tripsList.innerHTML = trips.map(trip => {
        const vehicle = vehicles.find(v => v.id === parseInt(trip.vehicleId)) || { number: 'N/A' };
        const driver = drivers.find(d => d.id === parseInt(trip.driverId)) || { name: 'N/A' };
        
        // Determine client/company display
        let clientCompany = 'N/A';
        if (trip.tripType === 'Company' && trip.companyId) {
            const company = companies.find(c => c.id === parseInt(trip.companyId));
            clientCompany = company ? company.name : 'Unknown';
        } else if (trip.tripType === 'Individual' && trip.clientName) {
            clientCompany = trip.clientName;
        } else if (trip.tripType === 'Outsource' && trip.clientName) {
            clientCompany = trip.clientName;
        }

        return `
            <div class="trip-item">
                <div class="trip-info">
                    <h4>${trip.route} - ₹${parseFloat(trip.payment || 0).toLocaleString('en-IN')}</h4>
                    <p><strong>Date:</strong> ${new Date(trip.date).toLocaleDateString('en-IN')}</p>
                    <p><strong>Vehicle:</strong> ${vehicle.number} | <strong>Driver:</strong> ${driver.name}</p>
                    <p><strong>Type:</strong> ${trip.tripType} | <strong>Distance:</strong> ${trip.kilometre} km</p>
                    <p><strong>Client/Company:</strong> ${clientCompany}</p>
                </div>
                <div class="trip-actions">
                    <button class="btn btn-small btn-info" onclick="viewTrip(${trip.id})">View</button>
                </div>
            </div>
        `;
        }).join('');
    } catch (error) {
        console.error('Error loading recent trips:', error);
        document.getElementById('recentTripsList').innerHTML = '<p>Error loading recent trips.</p>';
    }
}

async function viewTrip(tripId) {
    try {
        const trip = await storage.getByIdAsync('trips', tripId);
        if (!trip) {
            alert('Trip not found!');
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
        alert('Error loading trip details.');
    }
}

function closeTripModal() {
    const modal = document.getElementById('tripModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('tripModal');
    if (event.target == modal) {
        closeTripModal();
    }
}
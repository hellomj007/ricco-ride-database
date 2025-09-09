let currentFilters = {};
let allTrips = [];
let vehicles = [];
let companies = [];
let drivers = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupFilters();
    loadReports();
    populateYearDropdown();
});

function loadData() {
    allTrips = storage.getTrips();
    vehicles = storage.getAll('vehicles');
    companies = storage.getAll('companies');
    drivers = storage.getAll('drivers');
}

function setupFilters() {
    // Populate vehicle filter
    const vehicleFilter = document.getElementById('filterVehicle');
    vehicleFilter.innerHTML = '<option value="">All Vehicles</option>';
    
    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = vehicle.number;
        vehicleFilter.appendChild(option);
    });

    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    document.getElementById('filterStartDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('filterEndDate').value = lastDay.toISOString().split('T')[0];
    
    // Set default preset to "This Month"
    document.getElementById('dateRangePreset').value = 'thisMonth';
    
    // Add event listeners to reset preset when dates are manually changed
    document.getElementById('filterStartDate').addEventListener('change', resetDateRangePreset);
    document.getElementById('filterEndDate').addEventListener('change', resetDateRangePreset);
}

function applyDateRangePreset() {
    const preset = document.getElementById('dateRangePreset').value;
    const startDateInput = document.getElementById('filterStartDate');
    const endDateInput = document.getElementById('filterEndDate');
    
    if (!preset) {
        return; // Custom range selected, do nothing
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let startDate, endDate;
    
    switch (preset) {
        case 'today':
            startDate = endDate = today;
            break;
            
        case 'yesterday':
            startDate = endDate = yesterday;
            break;
            
        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
            
        case 'lastMonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
            
        case 'thisYear':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            break;
            
        case 'lastYear':
            startDate = new Date(today.getFullYear() - 1, 0, 1);
            endDate = new Date(today.getFullYear() - 1, 11, 31);
            break;
            
        case 'allTime':
            startDate = null;
            endDate = null;
            break;
    }
    
    if (startDate) {
        startDateInput.value = startDate.toISOString().split('T')[0];
    } else {
        startDateInput.value = '';
    }
    
    if (endDate) {
        endDateInput.value = endDate.toISOString().split('T')[0];
    } else {
        endDateInput.value = '';
    }
    
    // Automatically apply filters after setting date range
    applyFilters();
}

function resetDateRangePreset() {
    // Reset to "Custom Range" when dates are manually changed
    document.getElementById('dateRangePreset').value = '';
}

function applyFilters() {
    currentFilters = {
        startDate: document.getElementById('filterStartDate').value,
        endDate: document.getElementById('filterEndDate').value,
        tripType: document.getElementById('filterTripType').value,
        vehicleId: document.getElementById('filterVehicle').value
    };
    
    loadReports();
}

function clearFilters() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterTripType').value = '';
    document.getElementById('filterVehicle').value = '';
    currentFilters = {};
    loadReports();
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
    
    return filteredTrips;
}

function loadReports() {
    const trips = getFilteredTrips();
    updateSummaryStats(trips);
    loadSummaryReport(trips);
    loadVehiclePerformance(trips);
    loadCompanyAnalysis(trips);
    loadDetailedTrips(trips);
}

function updateSummaryStats(trips) {
    const totalTrips = trips.length;
    const totalRevenue = trips.reduce((sum, trip) => sum + (parseFloat(trip.payment) || 0), 0);
    const totalDistance = trips.reduce((sum, trip) => sum + (parseFloat(trip.kilometre) || 0), 0);
    
    const totalCosts = trips.reduce((sum, trip) => {
        const driverCost = parseFloat(trip.driverCost) || 0;
        const fuelCost = parseFloat(trip.fuelCost) || 0;
        const maintenance = parseFloat(trip.maintenance) || 0;
        const tollParking = parseFloat(trip.tollParking) || 0;
        return sum + driverCost + fuelCost + maintenance + tollParking;
    }, 0);
    
    const totalProfit = totalRevenue - totalCosts;
    
    document.getElementById('totalTrips').textContent = totalTrips;
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById('totalProfit').textContent = `₹${totalProfit.toLocaleString('en-IN')}`;
    document.getElementById('totalDistance').textContent = `${totalDistance.toLocaleString('en-IN')} KM`;
}

function loadSummaryReport(trips) {
    const totalRevenue = trips.reduce((sum, trip) => sum + (parseFloat(trip.payment) || 0), 0);
    const driverCosts = trips.reduce((sum, trip) => trip.tripType !== 'Outsource' ? sum + (parseFloat(trip.driverCost) || 0) : sum, 0);
    const fuelCosts = trips.reduce((sum, trip) => trip.tripType !== 'Outsource' ? sum + (parseFloat(trip.fuelCost) || 0) : sum, 0);
    const maintenanceCosts = trips.reduce((sum, trip) => trip.tripType !== 'Outsource' ? sum + (parseFloat(trip.maintenance) || 0) : sum, 0);
    const vendorShares = trips.reduce((sum, trip) => trip.tripType === 'Outsource' ? sum + (parseFloat(trip.vendorShare) || 0) : sum, 0);
    // Toll/parking only counted for non-Company trips (Company trips get reimbursed)
    const tollParking = trips.reduce((sum, trip) => trip.tripType !== 'Company' ? sum + (parseFloat(trip.tollParking) || 0) : sum, 0);
    const netProfit = totalRevenue - driverCosts - fuelCosts - maintenanceCosts - vendorShares - tollParking;
    
    document.getElementById('summaryRevenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById('summaryDriverCosts').textContent = `₹${driverCosts.toLocaleString('en-IN')}`;
    document.getElementById('summaryFuelCosts').textContent = `₹${fuelCosts.toLocaleString('en-IN')}`;
    document.getElementById('summaryMaintenanceCosts').textContent = `₹${maintenanceCosts.toLocaleString('en-IN')}`;
    document.getElementById('summaryTollParking').textContent = `₹${tollParking.toLocaleString('en-IN')}`;
    document.getElementById('summaryNetProfit').textContent = `₹${netProfit.toLocaleString('en-IN')}`;
    
    // Trip type breakdown
    const tripTypeStats = {};
    trips.forEach(trip => {
        if (!tripTypeStats[trip.tripType]) {
            tripTypeStats[trip.tripType] = { count: 0, revenue: 0, profit: 0 };
        }
        tripTypeStats[trip.tripType].count++;
        tripTypeStats[trip.tripType].revenue += parseFloat(trip.payment) || 0;
        
        let costs = 0;
        
        if (trip.tripType === 'Outsource') {
            costs = (parseFloat(trip.vendorShare) || 0) + (parseFloat(trip.tollParking) || 0);
        } else if (trip.tripType === 'Company') {
            costs = (parseFloat(trip.driverCost) || 0) + 
                   (parseFloat(trip.fuelCost) || 0) + 
                   (parseFloat(trip.maintenance) || 0);
        } else {
            costs = (parseFloat(trip.driverCost) || 0) + 
                   (parseFloat(trip.fuelCost) || 0) + 
                   (parseFloat(trip.maintenance) || 0) + 
                   (parseFloat(trip.tollParking) || 0);
        }
        
        tripTypeStats[trip.tripType].profit += (parseFloat(trip.payment) || 0) - costs;
    });
    
    const breakdownHtml = Object.keys(tripTypeStats).map(type => `
        <div class="trip-type-item">
            <h4>${type} Trips</h4>
            <p>Count: ${tripTypeStats[type].count}</p>
            <p>Revenue: ₹${tripTypeStats[type].revenue.toLocaleString('en-IN')}</p>
            <p>Profit: ₹${tripTypeStats[type].profit.toLocaleString('en-IN')}</p>
        </div>
    `).join('');
    
    document.getElementById('tripTypeBreakdown').innerHTML = breakdownHtml;
}

function loadVehiclePerformance(trips) {
    const vehicleStats = {};
    
    trips.forEach(trip => {
        const vehicleKey = trip.vehicleId ? 
            vehicles.find(v => v.id === trip.vehicleId)?.number || 'Unknown' :
            trip.vehicleDetails || 'Manual Entry';
            
        if (!vehicleStats[vehicleKey]) {
            vehicleStats[vehicleKey] = {
                trips: 0,
                revenue: 0,
                distance: 0,
                costs: 0
            };
        }
        
        vehicleStats[vehicleKey].trips++;
        vehicleStats[vehicleKey].revenue += parseFloat(trip.payment) || 0;
        vehicleStats[vehicleKey].distance += parseFloat(trip.kilometre) || 0;
        
        const costs = (parseFloat(trip.driverCost) || 0) + 
                     (parseFloat(trip.fuelCost) || 0) + 
                     (parseFloat(trip.maintenance) || 0) + 
                     (parseFloat(trip.tollParking) || 0);
        vehicleStats[vehicleKey].costs += costs;
    });
    
    const performanceHtml = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Vehicle</th>
                        <th>Trips</th>
                        <th>Total Distance (KM)</th>
                        <th>Revenue (₹)</th>
                        <th>Costs (₹)</th>
                        <th>Profit (₹)</th>
                        <th>Avg Revenue/Trip</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(vehicleStats).map(vehicle => {
                        const stats = vehicleStats[vehicle];
                        const profit = stats.revenue - stats.costs;
                        const avgRevenue = stats.trips > 0 ? stats.revenue / stats.trips : 0;
                        
                        return `
                            <tr>
                                <td>${vehicle}</td>
                                <td>${stats.trips}</td>
                                <td>${stats.distance.toLocaleString('en-IN')}</td>
                                <td>₹${stats.revenue.toLocaleString('en-IN')}</td>
                                <td>₹${stats.costs.toLocaleString('en-IN')}</td>
                                <td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">₹${profit.toLocaleString('en-IN')}</td>
                                <td>₹${avgRevenue.toLocaleString('en-IN')}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('vehiclePerformance').innerHTML = performanceHtml;
}

function loadCompanyAnalysis(trips) {
    const companyTrips = trips.filter(trip => trip.tripType === 'Company' && trip.companyId);
    const companyStats = {};
    
    companyTrips.forEach(trip => {
        const company = companies.find(c => c.id === trip.companyId);
        const companyName = company ? company.name : 'Unknown Company';
        
        if (!companyStats[companyName]) {
            companyStats[companyName] = {
                trips: 0,
                revenue: 0,
                distance: 0,
                costs: 0
            };
        }
        
        companyStats[companyName].trips++;
        companyStats[companyName].revenue += parseFloat(trip.payment) || 0;
        companyStats[companyName].distance += parseFloat(trip.kilometre) || 0;
        
        const costs = (parseFloat(trip.driverCost) || 0) + 
                     (parseFloat(trip.fuelCost) || 0) + 
                     (parseFloat(trip.maintenance) || 0) + 
                     (parseFloat(trip.tollParking) || 0);
        companyStats[companyName].costs += costs;
    });
    
    if (Object.keys(companyStats).length === 0) {
        document.getElementById('companyAnalysis').innerHTML = '<p>No company trips found for the selected period.</p>';
        return;
    }
    
    const analysisHtml = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Trips</th>
                        <th>Total Distance (KM)</th>
                        <th>Revenue (₹)</th>
                        <th>Costs (₹)</th>
                        <th>Profit (₹)</th>
                        <th>Avg Revenue/Trip</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(companyStats).map(company => {
                        const stats = companyStats[company];
                        const profit = stats.revenue - stats.costs;
                        const avgRevenue = stats.trips > 0 ? stats.revenue / stats.trips : 0;
                        
                        return `
                            <tr>
                                <td>${company}</td>
                                <td>${stats.trips}</td>
                                <td>${stats.distance.toLocaleString('en-IN')}</td>
                                <td>₹${stats.revenue.toLocaleString('en-IN')}</td>
                                <td>₹${stats.costs.toLocaleString('en-IN')}</td>
                                <td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">₹${profit.toLocaleString('en-IN')}</td>
                                <td>₹${avgRevenue.toLocaleString('en-IN')}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('companyAnalysis').innerHTML = analysisHtml;
}

function loadDetailedTrips(trips) {
    const tbody = document.querySelector('#detailedTripsTable tbody');
    
    tbody.innerHTML = trips.map(trip => {
        const vehicle = trip.vehicleId ? 
            vehicles.find(v => v.id === trip.vehicleId)?.number || 'Unknown' :
            trip.vehicleDetails || 'Manual Entry';
            
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
            totalCosts += (parseFloat(trip.vendorShare) || 0);
        } else {
            totalCosts += (parseFloat(trip.driverCost) || 0) + 
                         (parseFloat(trip.fuelCost) || 0) + 
                         (parseFloat(trip.maintenance) || 0);
        }
        
        const profit = (parseFloat(trip.payment) || 0) - totalCosts;
        
        return `
            <tr>
                <td>${new Date(trip.date).toLocaleDateString('en-IN')}</td>
                <td>${trip.tripType}</td>
                <td>${trip.route}</td>
                <td>${vehicle}</td>
                <td>${driver ? driver.name : 'N/A'}</td>
                <td>${company}</td>
                <td>${(trip.kilometre || 0).toLocaleString('en-IN')}</td>
                <td>₹${(trip.payment || 0).toLocaleString('en-IN')}</td>
                <td>₹${totalCosts.toLocaleString('en-IN')}</td>
                <td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">₹${profit.toLocaleString('en-IN')}</td>
                <td class="actions">
                    <button class="btn btn-small btn-info" onclick="viewTrip(${trip.id})">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function populateYearDropdown() {
    const years = [...new Set(allTrips.map(trip => new Date(trip.date).getFullYear()))];
    const yearSelect = document.getElementById('monthlyYear');
    
    yearSelect.innerHTML = years.map(year => 
        `<option value="${year}" ${year === new Date().getFullYear() ? 'selected' : ''}>${year}</option>`
    ).join('');
    
    loadMonthlyAnalysis();
}

function loadMonthlyAnalysis() {
    const selectedYear = parseInt(document.getElementById('monthlyYear').value);
    const yearTrips = allTrips.filter(trip => new Date(trip.date).getFullYear() === selectedYear);
    
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize months
    for (let i = 0; i < 12; i++) {
        monthlyData[i] = { trips: 0, revenue: 0, profit: 0 };
    }
    
    yearTrips.forEach(trip => {
        const month = new Date(trip.date).getMonth();
        monthlyData[month].trips++;
        monthlyData[month].revenue += parseFloat(trip.payment) || 0;
        
        let costs = 0;
        
        if (trip.tripType === 'Outsource') {
            costs = (parseFloat(trip.vendorShare) || 0) + (parseFloat(trip.tollParking) || 0);
        } else if (trip.tripType === 'Company') {
            costs = (parseFloat(trip.driverCost) || 0) + 
                   (parseFloat(trip.fuelCost) || 0) + 
                   (parseFloat(trip.maintenance) || 0);
        } else {
            costs = (parseFloat(trip.driverCost) || 0) + 
                   (parseFloat(trip.fuelCost) || 0) + 
                   (parseFloat(trip.maintenance) || 0) + 
                   (parseFloat(trip.tollParking) || 0);
        }
        
        monthlyData[month].profit += (parseFloat(trip.payment) || 0) - costs;
    });
    
    const chartHtml = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Trips</th>
                        <th>Revenue (₹)</th>
                        <th>Profit (₹)</th>
                        <th>Avg Revenue/Trip</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(monthlyData).map(monthIndex => {
                        const data = monthlyData[monthIndex];
                        const avgRevenue = data.trips > 0 ? data.revenue / data.trips : 0;
                        
                        return `
                            <tr>
                                <td>${monthNames[monthIndex]}</td>
                                <td>${data.trips}</td>
                                <td>₹${data.revenue.toLocaleString('en-IN')}</td>
                                <td class="${data.profit >= 0 ? 'profit-positive' : 'profit-negative'}">₹${data.profit.toLocaleString('en-IN')}</td>
                                <td>₹${avgRevenue.toLocaleString('en-IN')}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('monthlyChart').innerHTML = chartHtml;
}

function showReportTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

function exportTripsToCSV() {
    const trips = getFilteredTrips();
    let csv = 'Date,Type,Route,Vehicle,Driver,Company/Client,Distance (KM),Revenue (₹),Driver Cost (₹),Fuel Cost (₹),Maintenance (₹),Vendor Share (₹),Toll & Parking (₹),Total Costs (₹),Profit (₹)\n';
    
    trips.forEach(trip => {
        const vehicle = trip.vehicleId ? 
            vehicles.find(v => v.id === trip.vehicleId)?.number || 'Unknown' :
            trip.vehicleDetails || 'Manual Entry';
            
        const driver = drivers.find(d => d.id === trip.driverId);
        let company = 'N/A';
        if (trip.tripType === 'Company' && trip.companyId) {
            company = companies.find(c => c.id === trip.companyId)?.name || 'Unknown';
        } else if (trip.tripType === 'Individual' && trip.clientName) {
            company = trip.clientName;
        } else if (trip.tripType === 'Outsource' && trip.clientName) {
            company = trip.clientName;
        }
            
        const driverCost = parseFloat(trip.driverCost) || 0;
        const fuelCost = parseFloat(trip.fuelCost) || 0;
        const maintenance = parseFloat(trip.maintenance) || 0;
        const tollParking = parseFloat(trip.tollParking) || 0;
        const vendorShare = parseFloat(trip.vendorShare) || 0;
        
        let totalCosts = 0;
        if (trip.tripType === 'Outsource') {
            totalCosts = vendorShare + tollParking;
        } else if (trip.tripType === 'Company') {
            totalCosts = driverCost + fuelCost + maintenance;
        } else {
            totalCosts = driverCost + fuelCost + maintenance + tollParking;
        }
        
        const profit = (parseFloat(trip.payment) || 0) - totalCosts;
        
        csv += `${new Date(trip.date).toLocaleDateString('en-IN')},`;
        csv += `${trip.tripType},`;
        csv += `"${trip.route}",`;
        csv += `"${vehicle}",`;
        csv += `"${driver ? driver.name : 'N/A'}",`;
        csv += `"${company}",`;
        csv += `${trip.kilometre || 0},`;
        csv += `${trip.payment || 0},`;
        csv += `${driverCost},`;
        csv += `${fuelCost},`;
        csv += `${maintenance},`;
        csv += `${vendorShare},`;
        csv += `${tollParking},`;
        csv += `${totalCosts},`;
        csv += `${profit}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riccoride-trips-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function viewTrip(tripId) {
    const trip = storage.getById('trips', tripId);
    if (!trip) {
        alert('Trip not found!');
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
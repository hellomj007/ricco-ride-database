// Manage Data - Updated storage methods
let editingItem = null;
let editingTable = null;

// Set up database ready listener BEFORE DOMContentLoaded
window.addEventListener('databaseReady', function() {
    console.log('🔄 Database ready, loading all tables...');
    loadAllTables();
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, setting up manage-data...');
    setupForms();
    setupModal();
    
    // Try to load immediately if database is already ready
    setTimeout(() => {
        if (typeof storage !== 'undefined' && storage.isReady) {
            console.log('💡 Database already ready, loading tables immediately');
            loadAllTables();
        } else {
            console.log('⏳ Database not ready yet, waiting for databaseReady event...');
        }
    }, 200);
});

function showTab(tabName) {
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

async function loadAllTables() {
    console.log('🔄 Loading all tables...');
    try {
        await loadVehiclesTable();
        await loadDriversTable();
        await loadCompaniesTable();
        await loadVendorsTable();
        console.log('✅ All tables loaded successfully');
    } catch (error) {
        console.error('❌ Error loading tables:', error);
    }
}

function setupForms() {
    // Vehicle form
    document.getElementById('vehicleForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveVehicle();
    });

    // Driver form
    document.getElementById('driverForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveDriver();
    });

    // Company form
    document.getElementById('companyForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveCompany();
    });

    // Vendor form
    document.getElementById('vendorForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveVendor();
    });
}

function setupModal() {
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        editingItem = null;
        editingTable = null;
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            editingItem = null;
            editingTable = null;
        }
    }
}

// Vehicle Management
async function saveVehicle() {
    const vehicleData = {
        name: document.getElementById('vehicleName').value,
        number: document.getElementById('vehicleNumber').value.toUpperCase(),
        type: document.getElementById('vehicleType').value,
        owner: document.getElementById('vehicleOwner').value,
        status: document.getElementById('vehicleStatus').value
    };

    try {
        if (editingItem && editingTable === 'vehicles') {
            await storage.update('vehicles', editingItem.id, vehicleData);
            showAlert('Vehicle updated successfully!', 'success');
            closeModal();
        } else {
            await storage.add('vehicles', vehicleData);
            showAlert('Vehicle added successfully!', 'success');
        }

        clearVehicleForm();
        await loadVehiclesTable();
    } catch (error) {
        console.error('Error saving vehicle:', error);
        showAlert('Error saving vehicle. Please try again.', 'error');
    }
}

function clearVehicleForm() {
    document.getElementById('vehicleForm').reset();
}

async function loadVehiclesTable() {
    try {
        console.log('📋 Loading vehicles...');
        const vehicles = await storage.getAllAsync('vehicles');
        console.log('📋 Vehicles loaded:', vehicles);
        const tbody = document.querySelector('#vehiclesTable tbody');
        
        if (vehicles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No vehicles found</td></tr>';
        } else {
            tbody.innerHTML = vehicles.map(vehicle => `
                <tr>
                    <td>${vehicle.name}</td>
                    <td>${vehicle.number}</td>
                    <td>${vehicle.type}</td>
                    <td>${vehicle.owner}</td>
                    <td><span class="status ${vehicle.status.toLowerCase()}">${vehicle.status}</span></td>
                    <td class="actions">
                        <button class="btn btn-small btn-edit" onclick="editVehicle(${vehicle.id})">Edit</button>
                        <button class="btn btn-small btn-delete" onclick="deleteVehicle(${vehicle.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showAlert('Error loading vehicles data.', 'error');
    }
}

async function editVehicle(id) {
    try {
        const vehicle = await storage.getByIdAsync('vehicles', id);
        if (vehicle) {
            document.getElementById('vehicleName').value = vehicle.name;
            document.getElementById('vehicleNumber').value = vehicle.number;
            document.getElementById('vehicleType').value = vehicle.type;
            document.getElementById('vehicleOwner').value = vehicle.owner;
            document.getElementById('vehicleStatus').value = vehicle.status;
            
            editingItem = vehicle;
            editingTable = 'vehicles';
        }
    } catch (error) {
        console.error('Error loading vehicle:', error);
        showAlert('Error loading vehicle data.', 'error');
    }
}

async function deleteVehicle(id) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        try {
            await storage.delete('vehicles', id);
            showAlert('Vehicle deleted successfully!', 'success');
            await loadVehiclesTable();
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            showAlert('Error deleting vehicle.', 'error');
        }
    }
}

// Driver Management
async function saveDriver() {
    const driverData = {
        name: document.getElementById('driverName').value,
        phone: document.getElementById('driverPhone').value,
        status: document.getElementById('driverStatus').value
    };

    try {
        if (editingItem && editingTable === 'drivers') {
            await storage.update('drivers', editingItem.id, driverData);
            showAlert('Driver updated successfully!', 'success');
            closeModal();
        } else {
            await storage.add('drivers', driverData);
            showAlert('Driver added successfully!', 'success');
        }

        clearDriverForm();
        await loadDriversTable();
    } catch (error) {
        console.error('Error saving driver:', error);
        showAlert('Error saving driver. Please try again.', 'error');
    }
}

function clearDriverForm() {
    document.getElementById('driverForm').reset();
}

async function loadDriversTable() {
    try {
        const drivers = await storage.getAllAsync('drivers');
        const tbody = document.querySelector('#driversTable tbody');
        
        tbody.innerHTML = drivers.map(driver => `
            <tr>
                <td>${driver.name}</td>
                <td>${driver.phone}</td>
                <td><span class="status ${driver.status.toLowerCase()}">${driver.status}</span></td>
                <td class="actions">
                    <button class="btn btn-small btn-edit" onclick="editDriver(${driver.id})">Edit</button>
                    <button class="btn btn-small btn-delete" onclick="deleteDriver(${driver.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading drivers:', error);
        showAlert('Error loading drivers data.', 'error');
    }
}

async function editDriver(id) {
    try {
        const driver = await storage.getByIdAsync('drivers', id);
        if (driver) {
            document.getElementById('driverName').value = driver.name;
            document.getElementById('driverPhone').value = driver.phone;
            document.getElementById('driverStatus').value = driver.status;
            
            editingItem = driver;
            editingTable = 'drivers';
        }
    } catch (error) {
        console.error('Error loading driver:', error);
        showAlert('Error loading driver data.', 'error');
    }
}

async function deleteDriver(id) {
    if (confirm('Are you sure you want to delete this driver?')) {
        try {
            await storage.delete('drivers', id);
            showAlert('Driver deleted successfully!', 'success');
            await loadDriversTable();
        } catch (error) {
            console.error('Error deleting driver:', error);
            showAlert('Error deleting driver.', 'error');
        }
    }
}

// Company Management
async function saveCompany() {
    const companyData = {
        name: document.getElementById('companyName').value,
        contact: document.getElementById('companyContact').value,
        phone: document.getElementById('companyPhone').value,
        email: document.getElementById('companyEmail').value,
        address: document.getElementById('companyAddress').value,
        status: document.getElementById('companyStatus').value
    };

    try {
        if (editingItem && editingTable === 'companies') {
            await storage.update('companies', editingItem.id, companyData);
            showAlert('Company updated successfully!', 'success');
            closeModal();
        } else {
            await storage.add('companies', companyData);
            showAlert('Company added successfully!', 'success');
        }

        clearCompanyForm();
        await loadCompaniesTable();
    } catch (error) {
        console.error('Error saving company:', error);
        showAlert('Error saving company. Please try again.', 'error');
    }
}

function clearCompanyForm() {
    document.getElementById('companyForm').reset();
}

async function loadCompaniesTable() {
    try {
        const companies = await storage.getAllAsync('companies');
        const tbody = document.querySelector('#companiesTable tbody');
        
        tbody.innerHTML = companies.map(company => `
            <tr>
                <td>${company.name}</td>
                <td>${company.contact}</td>
                <td>${company.phone}</td>
                <td>${company.email || 'N/A'}</td>
                <td><span class="status ${company.status.toLowerCase()}">${company.status}</span></td>
                <td class="actions">
                    <button class="btn btn-small btn-edit" onclick="editCompany(${company.id})">Edit</button>
                    <button class="btn btn-small btn-delete" onclick="deleteCompany(${company.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading companies:', error);
        showAlert('Error loading companies data.', 'error');
    }
}

async function editCompany(id) {
    try {
        const company = await storage.getByIdAsync('companies', id);
        if (company) {
            document.getElementById('companyName').value = company.name;
            document.getElementById('companyContact').value = company.contact;
            document.getElementById('companyPhone').value = company.phone;
            document.getElementById('companyEmail').value = company.email || '';
            document.getElementById('companyAddress').value = company.address || '';
            document.getElementById('companyStatus').value = company.status;
            
            editingItem = company;
            editingTable = 'companies';
        }
    } catch (error) {
        console.error('Error loading company:', error);
        showAlert('Error loading company data.', 'error');
    }
}

async function deleteCompany(id) {
    if (confirm('Are you sure you want to delete this company?')) {
        try {
            await storage.delete('companies', id);
            showAlert('Company deleted successfully!', 'success');
            await loadCompaniesTable();
        } catch (error) {
            console.error('Error deleting company:', error);
            showAlert('Error deleting company.', 'error');
        }
    }
}

// Vendor Management
async function saveVendor() {
    const vendorData = {
        name: document.getElementById('vendorName').value,
        contact: document.getElementById('vendorContact').value,
        phone: document.getElementById('vendorPhone').value,
        commission: parseFloat(document.getElementById('vendorCommission').value),
        status: document.getElementById('vendorStatus').value
    };

    try {
        if (editingItem && editingTable === 'vendors') {
            await storage.update('vendors', editingItem.id, vendorData);
            showAlert('Vendor updated successfully!', 'success');
            closeModal();
        } else {
            await storage.add('vendors', vendorData);
            showAlert('Vendor added successfully!', 'success');
        }

        clearVendorForm();
        await loadVendorsTable();
    } catch (error) {
        console.error('Error saving vendor:', error);
        showAlert('Error saving vendor. Please try again.', 'error');
    }
}

function clearVendorForm() {
    document.getElementById('vendorForm').reset();
}

async function loadVendorsTable() {
    try {
        const vendors = await storage.getAllAsync('vendors');
        const tbody = document.querySelector('#vendorsTable tbody');
        
        tbody.innerHTML = vendors.map(vendor => `
            <tr>
                <td>${vendor.name}</td>
                <td>${vendor.contact}</td>
                <td>${vendor.phone}</td>
                <td>${vendor.commission}%</td>
                <td><span class="status ${vendor.status.toLowerCase()}">${vendor.status}</span></td>
                <td class="actions">
                    <button class="btn btn-small btn-edit" onclick="editVendor(${vendor.id})">Edit</button>
                    <button class="btn btn-small btn-delete" onclick="deleteVendor(${vendor.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading vendors:', error);
        showAlert('Error loading vendors data.', 'error');
    }
}

async function editVendor(id) {
    try {
        const vendor = await storage.getByIdAsync('vendors', id);
        if (vendor) {
            document.getElementById('vendorName').value = vendor.name;
            document.getElementById('vendorContact').value = vendor.contact;
            document.getElementById('vendorPhone').value = vendor.phone;
            document.getElementById('vendorCommission').value = vendor.commission;
            document.getElementById('vendorStatus').value = vendor.status;
            
            editingItem = vendor;
            editingTable = 'vendors';
        }
    } catch (error) {
        console.error('Error loading vendor:', error);
        showAlert('Error loading vendor data.', 'error');
    }
}

async function deleteVendor(id) {
    if (confirm('Are you sure you want to delete this vendor?')) {
        try {
            await storage.delete('vendors', id);
            showAlert('Vendor deleted successfully!', 'success');
            await loadVendorsTable();
        } catch (error) {
            console.error('Error deleting vendor:', error);
            showAlert('Error deleting vendor.', 'error');
        }
    }
}

// Utility functions
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
    }, 3000);
}

function closeModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    editingItem = null;
    editingTable = null;
}

// Data Import/Export
function exportData() {
    storage.exportData();
    showAlert('Data exported successfully!', 'success');
}

function importData() {
    const file = document.getElementById('importFile').files[0];
    if (file) {
        storage.importData(file)
            .then(() => {
                showAlert('Data imported successfully!', 'success');
                loadAllTables();
            })
            .catch(() => {
                showAlert('Error importing data. Please check the file format.', 'error');
            });
    }
}
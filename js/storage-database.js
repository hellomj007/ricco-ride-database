// Database-Only Storage - No localStorage, pure Supabase
// Direct Supabase configuration (simpler approach)
const SUPABASE_URL = 'https://fvjrckdblidfrjgfihnw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2anJja2RibGlkZnJqZ2ZpaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjI4MTIsImV4cCI6MjA3Mjk5ODgxMn0.uO9ujXUf_2RPPhQ-ncM8uHiJarE8w_lrct2s4E7UW1E';

let supabase;

console.log('🚀 Storage-database.js loaded');

class DatabaseStorage {
    constructor() {
        console.log('🔧 DatabaseStorage constructor called');
        this.isReady = false;
        this.initializeDatabase();
    }

    async initializeDatabase() {
        console.log('🔄 initializeDatabase started');
        try {
            // Wait for Supabase library to be available
            let retries = 0;
            while (!window.supabase && retries < 50) {
                console.log('⏳ Waiting for Supabase library... attempt', retries + 1);
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            if (!window.supabase) {
                console.error('❌ Supabase library never loaded from CDN');
                throw new Error('Supabase library not available after waiting');
            }

            console.log('✅ Supabase library found on window object');

            // Initialize Supabase client
            if (!supabase) {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                console.log('✅ Supabase client initialized with direct config');
            }

            // Test connection
            console.log('🔄 Testing database connection...');
            const { data, error } = await supabase.from('trips').select('count', { count: 'exact', head: true });

            if (error) {
                console.error('❌ Connection test failed:', error);
                throw error;
            }

            this.isReady = true;
            console.log('✅ Database connected successfully');

            // Check database schema
            await this.checkSchema();

            // Seed initial data if tables are empty
            await this.seedInitialData();
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            alert('Database connection failed: ' + (error.message || 'Unknown error'));
        }
    }

    async checkSchema() {
        try {
            // Test if drivers table has status column
            const { data, error } = await supabase.from('drivers').select('status').limit(0);
            if (error && error.message.includes('status')) {
                console.error('❌ Missing status column in drivers table. Please run the SQL schema update.');
                alert('Database schema needs updating. Please check the console and run the SQL commands in Supabase.');
            } else {
                console.log('✅ Database schema looks good');
            }
        } catch (error) {
            console.warn('Schema check failed:', error);
        }
    }

    async seedInitialData() {
        try {
            // Check if we need to add initial vehicles/drivers
            const vehicles = await this.getAll('vehicles');
            const drivers = await this.getAll('drivers');
            
            if (vehicles.length === 0) {
                console.log('Creating sample vehicle...');
                await this.save('vehicles', {
                    name: "Maruti Swift",
                    number: "MH12AB1234", 
                    type: "Sedan",
                    owner: "Own",
                    status: "Active"
                });
                console.log('✅ Sample vehicle created');
            }
            
            if (drivers.length === 0) {
                console.log('Creating sample driver...');
                const savedDriver = await this.save('drivers', {
                    name: "Driver 1",
                    phone: "9876543210",
                    status: "Active"
                });
                if (savedDriver) {
                    console.log('✅ Sample driver created');
                } else {
                    console.log('❌ Failed to create sample driver');
                }
            }
        } catch (error) {
            console.error('Error seeding initial data:', error);
            // Don't fail initialization if seeding fails
        }
    }

    // Generic get all function
    async getAll(table) {
        if (!this.isReady) {
            console.warn('Database not ready yet');
            return [];
        }
        
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (error) {
            console.error(`Error fetching ${table}:`, error);
            return [];
        }
        return data || [];
    }

    // Generic get by ID function
    async getById(table, id) {
        if (!this.isReady) return null;
        
        const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
        if (error) {
            console.error(`Error fetching ${table} by id:`, error);
            return null;
        }
        return data;
    }

    // Generic save function (insert or update)
    async save(table, item) {
        if (!this.isReady) {
            console.warn('Database not ready yet');
            return null;
        }
        
        console.log(`🔥 SAVING TO ${table}:`, item);
        console.log('🔥 Item keys:', Object.keys(item));
        console.log('🔥 Looking for companyId:', item.companyId);
        console.log('🔥 Looking for company_id:', item.company_id);
        
        let result;
        if (item.id) {
            // Update existing
            const { data, error } = await supabase.from(table).update(item).eq('id', item.id).select().single();
            result = { data, error };
        } else {
            // Insert new
            const { data, error } = await supabase.from(table).insert([item]).select().single();
            result = { data, error };
        }
        
        if (result.error) {
            console.error(`Error saving ${table}:`, result.error);
            console.error('Full error details:', JSON.stringify(result.error, null, 2));
            console.error('🔥 ITEM THAT FAILED:', item);
            alert(`Error saving data: ${result.error.message || 'Unknown error'}`);
            return null;
        }
        
        console.log(`✅ Saved to ${table}:`, result.data);
        return result.data;
    }

    // Generic delete function
    async delete(table, id) {
        if (!this.isReady) return false;
        
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) {
            console.error(`Error deleting from ${table}:`, error);
            alert(`Error deleting: ${error.message}`);
            return false;
        }
        
        console.log(`✅ Deleted from ${table}, ID:`, id);
        return true;
    }

    // Trip-specific functions (matching your current API)
    async getTrips() {
        const trips = await this.getAll('trips');
        // Convert database snake_case back to JavaScript camelCase
        return trips.map(trip => ({
            ...trip,
            tripType: trip.trip_type,
            routeType: trip.route_type,
            vehicleId: trip.vehicle_id,
            vehicleDetails: trip.vehicle_details,
            driverId: trip.driver_id,
            companyId: trip.company_id,
            clientName: trip.client_name,
            clientPhone: trip.client_phone,
            vendorName: trip.vendor_name,
            vendorShare: trip.vendor_share,
            paymentMethod: trip.payment_method,
            driverCost: trip.driver_cost,
            fuelCost: trip.fuel_cost,
            maintenanceReason: trip.maintenance_reason,
            tollParking: trip.toll_parking,
            startDateTime: trip.start_date_time,
            endDateTime: trip.end_date_time,
            totalDays: trip.total_days
        }));
    }

    async addTrip(trip) {
        // Trip data is already in database format from trip-entry.js
        return await this.save('trips', trip);
    }

    // Convert JavaScript camelCase to database snake_case
    convertToDbFormat(trip) {
        const dbTrip = {};
        
        // Direct field mappings
        const fieldMappings = {
            'tripType': 'trip_type',
            'routeType': 'route_type',
            'vehicleId': 'vehicle_id',
            'vehicleDetails': 'vehicle_details',
            'driverId': 'driver_id',
            'companyId': 'company_id',
            'clientName': 'client_name',
            'clientPhone': 'client_phone',
            'vendorName': 'vendor_name',
            'vendorShare': 'vendor_share',
            'paymentMethod': 'payment_method',
            'driverCost': 'driver_cost',
            'fuelCost': 'fuel_cost',
            'maintenanceReason': 'maintenance_reason',
            'tollParking': 'toll_parking',
            'startDateTime': 'start_date_time',
            'endDateTime': 'end_date_time',
            'totalDays': 'total_days'
        };

        // Map all fields
        for (const [jsField, dbField] of Object.entries(fieldMappings)) {
            if (trip[jsField] !== undefined) {
                dbTrip[dbField] = trip[jsField];
            }
        }

        // Direct copy fields (no conversion needed)
        const directFields = ['date', 'route', 'kilometre', 'payment', 'maintenance', 'description'];
        for (const field of directFields) {
            if (trip[field] !== undefined) {
                dbTrip[field] = trip[field];
            }
        }

        return dbTrip;
    }

    // Convert database snake_case to JavaScript camelCase
    convertFromDbFormat(dbTrip) {
        const jsTrip = {};
        
        // Reverse field mappings
        const fieldMappings = {
            'trip_type': 'tripType',
            'route_type': 'routeType', 
            'vehicle_id': 'vehicleId',
            'vehicle_details': 'vehicleDetails',
            'driver_id': 'driverId',
            'company_id': 'companyId',
            'client_name': 'clientName',
            'client_phone': 'clientPhone',
            'vendor_name': 'vendorName',
            'vendor_share': 'vendorShare',
            'payment_method': 'paymentMethod',
            'driver_cost': 'driverCost',
            'fuel_cost': 'fuelCost',
            'maintenance_reason': 'maintenanceReason',
            'toll_parking': 'tollParking',
            'start_date_time': 'startDateTime',
            'end_date_time': 'endDateTime',
            'total_days': 'totalDays'
        };

        // Map all fields
        for (const [dbField, jsField] of Object.entries(fieldMappings)) {
            if (dbTrip[dbField] !== undefined) {
                jsTrip[jsField] = dbTrip[dbField];
            }
        }

        // Direct copy fields (no conversion needed)
        const directFields = ['id', 'date', 'route', 'kilometre', 'payment', 'maintenance', 'description', 'created_at'];
        for (const field of directFields) {
            if (dbTrip[field] !== undefined) {
                jsTrip[field] = dbTrip[field];
            }
        }

        return jsTrip;
    }

    async getTodaysTrips() {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('trips')
            .select('*')
            .eq('date', today);
            
        if (error) {
            console.error('Error fetching today\'s trips:', error);
            return [];
        }
        
        // Convert database snake_case back to JavaScript camelCase
        return (data || []).map(trip => ({
            ...trip,
            tripType: trip.trip_type,
            routeType: trip.route_type,
            vehicleId: trip.vehicle_id,
            vehicleDetails: trip.vehicle_details,
            driverId: trip.driver_id,
            companyId: trip.company_id,
            clientName: trip.client_name,
            clientPhone: trip.client_phone,
            vendorName: trip.vendor_name,
            vendorShare: trip.vendor_share,
            paymentMethod: trip.payment_method,
            driverCost: trip.driver_cost,
            fuelCost: trip.fuel_cost,
            maintenanceReason: trip.maintenance_reason,
            tollParking: trip.toll_parking,
            startDateTime: trip.start_date_time,
            endDateTime: trip.end_date_time,
            totalDays: trip.total_days
        }));
    }

    async getMonthlyRevenue(year, month) {
        const trips = await this.getMonthlyTrips(year, month);
        console.log(`📊 Calculating monthly revenue for ${year}-${month}:`, trips.length, 'trips');
        const revenue = trips.reduce((total, trip) => total + (parseFloat(trip.payment) || 0), 0);
        console.log(`💰 Monthly revenue: ₹${revenue}`);
        return revenue;
    }

    async getMonthlyProfit(year, month) {
        const trips = await this.getMonthlyTrips(year, month);
        console.log(`📈 Calculating monthly profit for ${year}-${month}:`, trips.length, 'trips');
        const profit = trips.reduce((total, trip) => {
            // Convert trip to JS format first
            const jsTrip = this.convertFromDbFormat(trip);
            const revenue = parseFloat(jsTrip.payment) || 0;
            let costs = 0;
            
            if (jsTrip.tripType === 'Outsource') {
                costs = (parseFloat(jsTrip.vendorShare) || 0) + (parseFloat(jsTrip.tollParking) || 0);
            } else if (jsTrip.tripType === 'Company') {
                costs = (parseFloat(jsTrip.driverCost) || 0) + 
                       (parseFloat(jsTrip.fuelCost) || 0) + 
                       (parseFloat(jsTrip.maintenance) || 0);
            } else {
                costs = (parseFloat(jsTrip.driverCost) || 0) + 
                       (parseFloat(jsTrip.fuelCost) || 0) + 
                       (parseFloat(jsTrip.maintenance) || 0) + 
                       (parseFloat(jsTrip.tollParking) || 0);
            }
            
            return total + (revenue - costs);
        }, 0);
        console.log(`📊 Monthly profit: ₹${profit}`);
        return profit;
    }

    async getMonthlyTrips(year, month) {
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        // Get last day of month properly (handles Feb, months with 30/31 days)
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('trips')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate);
            
        if (error) {
            console.error('Error fetching monthly trips:', error);
            return [];
        }
        
        // Convert database snake_case back to JavaScript camelCase
        return (data || []).map(trip => ({
            ...trip,
            tripType: trip.trip_type,
            routeType: trip.route_type,
            vehicleId: trip.vehicle_id,
            vehicleDetails: trip.vehicle_details,
            driverId: trip.driver_id,
            companyId: trip.company_id,
            clientName: trip.client_name,
            clientPhone: trip.client_phone,
            vendorName: trip.vendor_name,
            vendorShare: trip.vendor_share,
            paymentMethod: trip.payment_method,
            driverCost: trip.driver_cost,
            fuelCost: trip.fuel_cost,
            maintenanceReason: trip.maintenance_reason,
            tollParking: trip.toll_parking,
            startDateTime: trip.start_date_time,
            endDateTime: trip.end_date_time,
            totalDays: trip.total_days
        }));
    }

    async getActiveVehiclesCount() {
        const { data, error } = await supabase
            .from('vehicles')
            .select('count', { count: 'exact', head: true })
            .eq('status', 'Active');
            
        if (error) {
            console.error('Error counting vehicles:', error);
            return 0;
        }
        return data?.length || 0;
    }

    // Backward compatibility methods
    async add(table, item) {
        return await this.save(table, item);
    }

    async update(table, id, updates) {
        const item = { ...updates, id };
        return await this.save(table, item);
    }
}

// Create global storage instance (replaces everything)
console.log('🔧 Creating DatabaseStorage instance...');
const databaseStorage = new DatabaseStorage();
console.log('🔧 DatabaseStorage created:', databaseStorage);

// Wrapper to make old synchronous code work with async database
console.log('🔧 Creating storage wrapper...');
const storage = {
    // Expose isReady property
    get isReady() {
        return databaseStorage.isReady;
    },

    // Initialize - wait for database to be ready
    async initialize() {
        let retries = 0;
        while (!databaseStorage.isReady && retries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        return databaseStorage.isReady;
    },

    // Synchronous-like interface for backward compatibility
    getAll(table) {
        if (!databaseStorage.isReady) {
            console.warn(`⚠️ Database not ready yet, cannot get ${table}`);
            return [];
        }
        console.warn(`⚠️ Using synchronous getAll('${table}') - returning empty array. Use await storage.getAllAsync('${table}') instead.`);
        return [];
    },

    getById(table, id) {
        if (!databaseStorage.isReady) {
            console.warn(`⚠️ Database not ready yet, cannot get ${table} by id`);
            return null;
        }
        console.warn(`⚠️ Using synchronous getById('${table}', ${id}) - returning null. Use await storage.getByIdAsync('${table}', ${id}) instead.`);
        return null;
    },

    // Async methods (proper usage)
    getAllAsync: (table) => databaseStorage.getAll(table),
    getByIdAsync: (table, id) => databaseStorage.getById(table, id),
    save: (table, item) => databaseStorage.save(table, item),
    add: (table, item) => databaseStorage.add(table, item),
    update: (table, id, updates) => databaseStorage.update(table, id, updates),
    delete: (table, id) => databaseStorage.delete(table, id),

    // Trip-specific methods
    getTrips: () => databaseStorage.getTrips(),
    addTrip: (trip) => databaseStorage.addTrip(trip),
    getTodaysTrips: () => databaseStorage.getTodaysTrips(),
    getMonthlyRevenue: (year, month) => databaseStorage.getMonthlyRevenue(year, month),
    getMonthlyProfit: (year, month) => databaseStorage.getMonthlyProfit(year, month),
    getMonthlyTrips: (year, month) => databaseStorage.getMonthlyTrips(year, month),
    getActiveVehiclesCount: () => databaseStorage.getActiveVehiclesCount()
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Initializing database...');
    const ready = await storage.initialize();
    if (ready) {
        console.log('✅ Database ready! App initialized.');
        // Trigger a custom event to let other scripts know database is ready
        window.dispatchEvent(new CustomEvent('databaseReady'));
    } else {
        console.error('❌ Database initialization failed');
        alert('Database connection failed. Please refresh the page.');
    }
});
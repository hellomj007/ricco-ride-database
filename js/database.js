// Database configuration - Using environment variables
const supabaseConfig = ENV.getSupabaseConfig();

// Initialize Supabase client
const supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.key);

// Database helper functions
const db = {
    // Generic functions
    async getAll(table) {
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (error) {
            console.error(`Error fetching ${table}:`, error);
            return [];
        }
        return data || [];
    },

    async getById(table, id) {
        const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
        if (error) {
            console.error(`Error fetching ${table} by id:`, error);
            return null;
        }
        return data;
    },

    async save(table, item) {
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
            return null;
        }
        return result.data;
    },

    async delete(table, id) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) {
            console.error(`Error deleting from ${table}:`, error);
            return false;
        }
        return true;
    },

    // Trip-specific functions
    async getTrips() {
        const { data, error } = await supabase
            .from('trips')
            .select(`
                *,
                vehicles:vehicle_id(*),
                drivers:driver_id(*),
                companies:company_id(*)
            `)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error fetching trips:', error);
            return [];
        }
        return data || [];
    },

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
        return data || [];
    },

    async getMonthlyTrips(year, month) {
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
        
        const { data, error } = await supabase
            .from('trips')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate);
            
        if (error) {
            console.error('Error fetching monthly trips:', error);
            return [];
        }
        return data || [];
    }
};
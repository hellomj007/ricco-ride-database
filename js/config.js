// Environment Configuration
// This file handles loading environment variables for the client-side app

class EnvironmentConfig {
    constructor() {
        this.config = {};
        this.loadConfig();
    }

    loadConfig() {
        // For client-side apps, we'll use a config object
        // In production, these values should be set via build process or server
        
        // Try to load from environment (if available via build process)
        this.config = {
            // Supabase Configuration
            SUPABASE_URL: this.getEnvVar('SUPABASE_URL', 'https://fvjrckdblidfrjgfihnw.supabase.co'),
            SUPABASE_ANON_KEY: this.getEnvVar('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2anJja2RibGlkZnJqZ2ZpaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjI4MTIsImV4cCI6MjA3Mjk5ODgxMn0.uO9ujXUf_2RPPhQ-ncM8uHiJarE8w_lrct2s4E7UW1E'),
            
            // Authentication Configuration
            AUTH_USERNAME: this.getEnvVar('AUTH_USERNAME', 'yogesh-ricco'),
            AUTH_PASSWORD: this.getEnvVar('AUTH_PASSWORD', 'Nanakar@ricco122'),
            
            // App Configuration
            APP_NAME: this.getEnvVar('APP_NAME', 'RiccoRide'),
            APP_VERSION: this.getEnvVar('APP_VERSION', '1.0.0'),
            SESSION_DURATION_HOURS: parseInt(this.getEnvVar('SESSION_DURATION_HOURS', '24')),
            
            // Development Settings
            DEBUG_MODE: this.getEnvVar('DEBUG_MODE', 'false') === 'true',
            ENABLE_CONSOLE_LOGS: this.getEnvVar('ENABLE_CONSOLE_LOGS', 'true') === 'true'
        };

        // Validate required configs
        this.validateConfig();
    }

    getEnvVar(key, defaultValue) {
        // For client-side, try different sources:
        
        // 1. Try process.env (if available via bundler like Webpack/Vite)
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
        
        // 2. Try window env variables (set by server/build process)
        if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
            return window.ENV[key];
        }
        
        // 3. Try localStorage (for development/override)
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(`ENV_${key}`);
            if (stored) return stored;
        }
        
        // 4. Return default value
        return defaultValue;
    }

    validateConfig() {
        const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'AUTH_USERNAME', 'AUTH_PASSWORD'];
        
        for (const key of required) {
            if (!this.config[key]) {
                console.error(`❌ Missing required configuration: ${key}`);
                throw new Error(`Missing required configuration: ${key}`);
            }
        }
        
        if (this.config.ENABLE_CONSOLE_LOGS) {
            console.log('✅ Configuration loaded successfully');
            console.log('📋 App Config:', {
                name: this.config.APP_NAME,
                version: this.config.APP_VERSION,
                debug: this.config.DEBUG_MODE,
                sessionHours: this.config.SESSION_DURATION_HOURS
            });
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        // Optionally persist to localStorage for development
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`ENV_${key}`, value);
        }
    }

    // Utility methods
    isDevelopment() {
        return this.config.DEBUG_MODE || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    isProduction() {
        return !this.isDevelopment();
    }

    getSupabaseConfig() {
        return {
            url: this.config.SUPABASE_URL,
            key: this.config.SUPABASE_ANON_KEY
        };
    }

    getAuthConfig() {
        return {
            username: this.config.AUTH_USERNAME,
            password: this.config.AUTH_PASSWORD,
            sessionDuration: this.config.SESSION_DURATION_HOURS * 60 * 60 * 1000 // Convert to milliseconds
        };
    }
}

// Create global config instance
const ENV = new EnvironmentConfig();

// Export for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENV;
}
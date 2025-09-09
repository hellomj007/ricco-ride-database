// Simple Authentication System
class SimpleAuth {
    constructor() {
        // Get credentials from environment configuration
        const authConfig = ENV.getAuthConfig();
        this.credentials = {
            username: authConfig.username,
            password: authConfig.password
        };
        
        this.sessionKey = 'ricco_authenticated';
        this.sessionDuration = authConfig.sessionDuration;
    }

    // Check if user is already logged in
    isAuthenticated() {
        const auth = localStorage.getItem(this.sessionKey);
        if (!auth) return false;

        const authData = JSON.parse(auth);
        const now = Date.now();
        
        // Check if session has expired
        if (now > authData.expires) {
            this.logout();
            return false;
        }
        
        return true;
    }

    // Show login form
    showLoginForm() {
        document.body.innerHTML = `
            <div class="auth-container">
                <div class="auth-form">
                    <div class="auth-header">
                        <h1>🚗 RiccoRide</h1>
                        <p>Please login to continue</p>
                    </div>
                    <form id="loginForm" onsubmit="auth.login(event)">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" required autofocus>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                        <div id="error-message" class="error-message" style="display: none;"></div>
                    </form>
                </div>
            </div>
        `;
    }

    // Handle login
    login(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');

        if (username === this.credentials.username && password === this.credentials.password) {
            // Login successful
            const authData = {
                authenticated: true,
                expires: Date.now() + this.sessionDuration,
                username: username
            };
            
            localStorage.setItem(this.sessionKey, JSON.stringify(authData));
            
            // Reload the page to show the actual app
            window.location.reload();
        } else {
            // Login failed
            errorDiv.textContent = 'Invalid username or password';
            errorDiv.style.display = 'block';
            
            // Clear password field
            document.getElementById('password').value = '';
        }
    }

    // Logout
    logout() {
        localStorage.removeItem(this.sessionKey);
        window.location.reload();
    }

    // Initialize authentication
    init() {
        if (!this.isAuthenticated()) {
            this.showLoginForm();
            return false;
        }
        
        // User is authenticated, show logout button
        this.addLogoutButton();
        return true;
    }

    // Add logout button to navigation
    addLogoutButton() {
        const nav = document.querySelector('nav');
        if (nav) {
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    this.logout();
                }
            };
            logoutBtn.style.marginLeft = 'auto';
            logoutBtn.style.color = '#ef4444';
            nav.appendChild(logoutBtn);
        }
    }
}

// Create global auth instance
const auth = new SimpleAuth();

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    auth.init();
});
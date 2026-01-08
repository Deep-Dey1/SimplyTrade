// API Base URL
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api/v1'
    : '/api/v1';

// Tab switching between login and register
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const formType = tab.getAttribute('data-form');
        
        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding form
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${formType}-form`).classList.add('active');
    });
});

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }
        
        // Store user session
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Show success message
        showMessage('login', 'success', 'Login successful! Redirecting...');
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        showMessage('login', 'error', error.message || 'Login failed. Please try again.');
    }
}

// Handle Registration
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    // Validate passwords match
    if (password !== confirm) {
        showMessage('register', 'error', 'Passwords do not match!');
        return;
    }
    
    // Validate all fields
    if (!name || !email || !password) {
        showMessage('register', 'error', 'Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Registration failed');
        }
        
        // Store user data
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Show success message
        showMessage('register', 'success', 'Account created successfully! Redirecting...');
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        showMessage('register', 'error', error.message || 'Registration failed. Please try again.');
    }
}

// Show message helper
function showMessage(formType, type, text) {
    const messageDiv = document.getElementById(`${formType}-message`);
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.className = 'message';
        messageDiv.textContent = '';
    }, 5000);
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // User is already logged in, redirect to dashboard
        window.location.href = 'index.html';
    }
});

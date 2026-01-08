// API Base URL
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api/v1'
    : '/api/v1';

// Global state
let currentInstruments = [];

// Check authentication on load
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        // User is not logged in, redirect to landing page
        window.location.href = 'index.html';
        return;
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Display user name
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('user-name').textContent = userName;
    }
    
    loadInstruments();
    loadOrders();
    loadTrades();
    loadPortfolio();
    setupEventListeners();
});

// Logout function
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
}

// Helper function to get headers with user ID
function getHeaders() {
    const userEmail = localStorage.getItem('userEmail') || 'guest@simplytrade.com';
    return {
        'Content-Type': 'application/json',
        'X-User-Id': userEmail
    };
}

// Setup event listeners
function setupEventListeners() {
    // Order form submission
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', handleOrderSubmit);

    // Order style change - show/hide price field
    const orderStyle = document.getElementById('order-style');
    orderStyle.addEventListener('change', (e) => {
        const priceInput = document.getElementById('price');
        if (e.target.value === 'LIMIT') {
            priceInput.required = true;
            priceInput.parentElement.style.opacity = '1';
        } else {
            priceInput.required = false;
            priceInput.parentElement.style.opacity = '0.6';
        }
    });
}

// Switch between tabs - No longer needed but keeping for compatibility
function switchTab(tabName) {
    // This function is no longer needed with the new layout
}

// Load instruments
async function loadInstruments() {
    try {
        const response = await fetch(`${API_BASE_URL}/instruments`);
        if (!response.ok) throw new Error('Failed to fetch instruments');
        
        const instruments = await response.json();
        currentInstruments = instruments;
        displayInstruments(instruments);
    } catch (error) {
        console.error('Error loading instruments:', error);
        showError('instruments-body', 'Failed to load instruments');
    }
}

// Display instruments in table
function displayInstruments(instruments) {
    const tbody = document.getElementById('instruments-body');
    
    if (instruments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No instruments available</td></tr>';
        return;
    }

    tbody.innerHTML = instruments.map(inst => `
        <tr>
            <td><strong>${inst.symbol}</strong></td>
            <td>${inst.exchange}</td>
            <td>${inst.instrument_type}</td>
            <td>₹${inst.last_traded_price.toFixed(2)}</td>
            <td>
                <button class="btn-small" onclick="quickBuy('${inst.symbol}', ${inst.last_traded_price})">Buy</button>
                <button class="btn-small btn-sell" onclick="quickSell('${inst.symbol}', ${inst.last_traded_price})">Sell</button>
            </td>
        </tr>
    `).join('');
}

// Quick buy function
function quickBuy(symbol, price) {
    document.getElementById('symbol').value = symbol;
    document.getElementById('order-type').value = 'BUY';
    document.getElementById('order-style').value = 'MARKET';
    document.getElementById('quantity').value = '1';
    document.getElementById('price').value = '';
}

// Quick sell function
function quickSell(symbol, price) {
    document.getElementById('symbol').value = symbol;
    document.getElementById('order-type').value = 'SELL';
    document.getElementById('order-style').value = 'MARKET';
    document.getElementById('quantity').value = '1';
    document.getElementById('price').value = '';
}

// Handle order form submission
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const orderData = {
        symbol: formData.get('symbol').toUpperCase(),
        order_type: formData.get('order_type'),
        order_style: formData.get('order_style'),
        quantity: parseInt(formData.get('quantity')),
        price: formData.get('price') ? parseFloat(formData.get('price')) : null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || 'Failed to place order');
        }

        showMessage('success', `Order placed successfully! Order ID: ${result.id}`);
        e.target.reset();
        
        // Reload orders and portfolio
        setTimeout(() => {
            loadOrders();
            loadPortfolio();
            loadTrades();
        }, 500);

    } catch (error) {
        console.error('Error placing order:', error);
        showMessage('error', error.message);
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('orders-body', 'Failed to load orders');
    }
}

// Display orders in table
function displayOrders(orders) {
    const tbody = document.getElementById('orders-body');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td><strong>${order.symbol}</strong></td>
            <td class="order-${order.order_type.toLowerCase()}">${order.order_type}</td>
            <td>${order.order_style}</td>
            <td>${order.quantity}</td>
            <td>${order.price ? '₹' + order.price.toFixed(2) : 'Market'}</td>
            <td><span class="status status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td>${formatDate(order.created_at)}</td>
        </tr>
    `).join('');
}

// Load trades
async function loadTrades() {
    try {
        const response = await fetch(`${API_BASE_URL}/trades`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch trades');
        
        const trades = await response.json();
        displayTrades(trades);
    } catch (error) {
        console.error('Error loading trades:', error);
        showError('trades-body', 'Failed to load trades');
    }
}

// Display trades in table
function displayTrades(trades) {
    const tbody = document.getElementById('trades-body');
    
    if (trades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No trades yet</td></tr>';
        return;
    }

    tbody.innerHTML = trades.map(trade => `
        <tr>
            <td>#${trade.id}</td>
            <td>#${trade.order_id}</td>
            <td><strong>${trade.symbol}</strong></td>
            <td class="order-${trade.order_type.toLowerCase()}">${trade.order_type}</td>
            <td>${trade.quantity}</td>
            <td>₹${trade.price.toFixed(2)}</td>
            <td>${formatDate(trade.executed_at)}</td>
        </tr>
    `).join('');
}

// Load portfolio
async function loadPortfolio() {
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch portfolio');
        
        const portfolio = await response.json();
        displayPortfolio(portfolio);
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showError('portfolio-body', 'Failed to load portfolio');
    }
}

// Display portfolio in table
function displayPortfolio(portfolio) {
    const tbody = document.getElementById('portfolio-body');
    
    if (portfolio.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No holdings yet</td></tr>';
        return;
    }

    tbody.innerHTML = portfolio.map(item => `
        <tr>
            <td><strong>${item.symbol}</strong></td>
            <td>${item.quantity}</td>
            <td>₹${item.average_price.toFixed(2)}</td>
            <td><strong>₹${item.current_value.toFixed(2)}</strong></td>
        </tr>
    `).join('');
}

// Show message (success or error)
function showMessage(type, text) {
    const messageDiv = document.getElementById('order-message');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;

    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.className = 'message';
        messageDiv.textContent = '';
    }, 5000);
}

// Show error in table
function showError(tbodyId, message) {
    const tbody = document.getElementById(tbodyId);
    const colSpan = tbody.closest('table').querySelectorAll('th').length;
    tbody.innerHTML = `<tr><td colspan="${colSpan}" class="loading" style="color: #e74c3c;">${message}</td></tr>`;
}

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Auto-refresh data every 10 seconds
setInterval(() => {
    loadInstruments();
    loadOrders();
    loadTrades();
    loadPortfolio();
}, 10000);

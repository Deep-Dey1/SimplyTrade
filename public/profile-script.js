// API Base URL
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api/v1'
    : '/api/v1';

// Check authentication on load
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'landing.html';
        return;
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    displayUserInfo();
    setupTabs();
    loadPortfolio();
    loadOrders();
    loadTrades();
});

// Display user information
function displayUserInfo() {
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    
    document.getElementById('profile-name').textContent = userName;
    document.getElementById('profile-email').textContent = userEmail;
}

// Setup tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Reload data for the active tab
    if (tabName === 'orders') loadOrders();
    if (tabName === 'trades') loadTrades();
    if (tabName === 'portfolio') loadPortfolio();
}

// Helper function to get headers with user ID
function getHeaders() {
    const userEmail = localStorage.getItem('userEmail') || 'guest@simplytrade.com';
    return {
        'Content-Type': 'application/json',
        'X-User-Id': userEmail
    };
}

// Load portfolio
async function loadPortfolio() {
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch portfolio');
        
        const portfolio = await response.json();
        
        // Get current prices from instruments
        const instrumentsResponse = await fetch(`${API_BASE_URL}/instruments`);
        const instruments = await instrumentsResponse.json();
        
        displayPortfolio(portfolio, instruments);
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showError('portfolio-body', 'Failed to load portfolio', 5);
    }
}

// Display portfolio in table
function displayPortfolio(portfolio, instruments) {
    const tbody = document.getElementById('portfolio-body');
    
    if (portfolio.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No holdings yet</td></tr>';
        return;
    }

    tbody.innerHTML = portfolio.map(item => {
        const instrument = instruments.find(i => i.symbol === item.symbol);
        const currentPrice = instrument ? instrument.last_traded_price : item.average_price;
        const currentValue = item.quantity * currentPrice;
        const investedValue = item.quantity * item.average_price;
        const pnl = currentValue - investedValue;
        const pnlClass = pnl >= 0 ? 'profit' : 'loss';
        
        return `
            <tr>
                <td><strong>${item.symbol}</strong></td>
                <td>${item.quantity}</td>
                <td>₹${item.average_price.toFixed(2)}</td>
                <td><strong>₹${currentValue.toFixed(2)}</strong></td>
                <td class="${pnlClass}">${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
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
        showError('orders-body', 'Failed to load orders', 8);
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
        showError('trades-body', 'Failed to load trades', 7);
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

// Show error in table
function showError(tbodyId, message, colSpan) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = `<tr><td colspan="${colSpan}" class="loading" style="color: #e53e3e;">${message}</td></tr>`;
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

// Logout function
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
}

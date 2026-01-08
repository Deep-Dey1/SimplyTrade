# SimplyTrade - Trading Platform

A simple, streamlined trading platform built with FastAPI backend and vanilla HTML/CSS/JavaScript frontend. This project demonstrates core trading workflows including instrument management, order placement, trade execution, and portfolio tracking.

## 📋 Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Assumptions](#assumptions)

---

## ✨ Features

### Core Functionality
- **Instrument Management**: View available financial instruments with real-time pricing
- **Order Management**: Place BUY/SELL orders with MARKET/LIMIT styles
- **Trade Tracking**: View executed trades history
- **Portfolio**: Track holdings with average price and current value
- **Order Status Tracking**: Monitor order states (NEW → PLACED → EXECUTED → CANCELLED)

### Additional Features
- **Auto Order Execution**: Market orders execute immediately
- **Portfolio Calculation**: Automatic average price calculation for holdings
- **Input Validation**: Quantity validation, price requirements for LIMIT orders
- **Real-time Updates**: Frontend auto-refreshes data every 10 seconds
- **Clean UI**: Modern grid background with smooth interactions

---

## 🛠️ Technology Stack

### Backend
- **Python 3.8+**
- **FastAPI**: Modern web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database (no setup required)
- **Pydantic**: Data validation using Python type hints
- **Uvicorn**: ASGI server

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling with gradient backgrounds
- **Vanilla JavaScript**: API interactions and DOM manipulation

---

## 📁 Project Structure

```
SimplyTrade/
├── backend/
│   ├── main.py              # FastAPI application with all routes
│   ├── models.py            # SQLAlchemy models (Instrument, Order, Trade, Portfolio)
│   ├── database.py          # Database connection and session management
│   ├── requirements.txt     # Python dependencies
│   └── trading.db           # SQLite database (auto-generated)
│
├── frontend/
│   ├── index.html           # Main HTML page
│   ├── styles.css           # CSS styling
│   └── script.js            # JavaScript for API calls
│
└── README.md                # This file
```

---

## 🚀 Setup and Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- A modern web browser

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload
   ```

4. **Verify the backend is running**:
   - Open your browser and go to: `http://localhost:8000`
   - API documentation (Swagger UI): `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Open the frontend**:
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python's built-in server
     python -m http.server 3000
     ```
   - Then open: `http://localhost:3000`

**Important**: Make sure the backend is running before using the frontend!

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### 1. Instrument APIs

#### Get All Instruments
```http
GET /api/v1/instruments
```

**Response**:
```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "exchange": "NASDAQ",
    "instrument_type": "EQUITY",
    "last_traded_price": 178.50
  }
]
```

#### Get Specific Instrument
```http
GET /api/v1/instruments/{symbol}
```

### 2. Order Management APIs

#### Place Order
```http
POST /api/v1/orders
```

**Request Body**:
```json
{
  "symbol": "AAPL",
  "order_type": "BUY",
  "order_style": "MARKET",
  "quantity": 10,
  "price": null
}
```

**Response**:
```json
{
  "id": 1,
  "symbol": "AAPL",
  "order_type": "BUY",
  "order_style": "MARKET",
  "quantity": 10,
  "price": null,
  "status": "EXECUTED",
  "created_at": "2026-01-09T10:30:00",
  "executed_at": "2026-01-09T10:30:01"
}
```

**Validations**:
- `quantity` must be > 0
- `price` is required for LIMIT orders
- `order_type` must be BUY or SELL
- `order_style` must be MARKET or LIMIT
- `symbol` must exist in instruments

#### Get Order Status
```http
GET /api/v1/orders/{order_id}
```

#### Get All Orders
```http
GET /api/v1/orders
```

### 3. Trade APIs

#### Get All Trades
```http
GET /api/v1/trades
```

**Response**:
```json
[
  {
    "id": 1,
    "order_id": 1,
    "symbol": "AAPL",
    "order_type": "BUY",
    "quantity": 10,
    "price": 178.50,
    "executed_at": "2026-01-09T10:30:01"
  }
]
```

### 4. Portfolio APIs

#### Get Portfolio
```http
GET /api/v1/portfolio
```

**Response**:
```json
[
  {
    "symbol": "AAPL",
    "quantity": 10,
    "average_price": 178.50,
    "current_value": 1785.00
  }
]
```

---

## 💡 Usage Examples

### Using cURL

**1. Get all instruments**:
```bash
curl http://localhost:8000/api/v1/instruments
```

**2. Place a market BUY order**:
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "order_type": "BUY",
    "order_style": "MARKET",
    "quantity": 5
  }'
```

**3. Place a limit SELL order**:
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "GOOGL",
    "order_type": "SELL",
    "order_style": "LIMIT",
    "quantity": 3,
    "price": 145.00
  }'
```

**4. Get order status**:
```bash
curl http://localhost:8000/api/v1/orders/1
```

**5. Get portfolio**:
```bash
curl http://localhost:8000/api/v1/portfolio
```

### Using the Frontend

1. **View Instruments**: The instruments table loads automatically on page load
2. **Quick Buy**: Click the "Buy" button next to any instrument to pre-fill the order form
3. **Place Order**: 
   - Fill in the order form
   - For MARKET orders, price is optional
   - For LIMIT orders, price is required
   - Click "Place Order"
4. **View Orders/Trades/Portfolio**: Use the tabs to switch between different views

---

## 📝 Assumptions

### Business Logic
1. **Single User System**: 
   - Authentication is mocked with a hardcoded user (`user_001`)
   - All operations are for this single user

2. **Order Execution**:
   - MARKET orders execute immediately at the current instrument price
   - LIMIT orders are placed but not auto-executed (can be enhanced)
   - No order cancellation feature implemented
   - No partial fills - orders execute fully or not at all

3. **Portfolio Management**:
   - Average price is calculated using weighted average method
   - SELL orders reduce quantity but don't check for sufficient holdings (simplified)
   - No short selling allowed
   - Portfolio value calculated using current instrument prices

4. **Instruments**:
   - Pre-loaded with 10 dummy instruments (5 NASDAQ + 5 NSE stocks)
   - Prices are static (no real-time market data)
   - All instruments are EQUITY type

### Technical
1. **Database**:
   - SQLite is used for simplicity (in-memory alternative can be configured)
   - Database file (`trading.db`) is created automatically on first run
   - No database migrations - schema is created from models

2. **API Design**:
   - RESTful principles followed
   - JSON format for all requests/responses
   - CORS enabled for all origins (development only)
   - Basic error handling with appropriate HTTP status codes

3. **Frontend**:
   - Vanilla JavaScript (no frameworks) for simplicity
   - Auto-refresh every 10 seconds
   - Assumes backend is running on `http://localhost:8000`

4. **Error Handling**:
   - Basic validation on API level
   - User-friendly error messages in frontend
   - Console logging for debugging

### Limitations
- No real market connectivity
- No WebSocket for real-time updates
- No user authentication/authorization
- No order book or matching engine
- No transaction history beyond trades
- No charts or advanced analytics
- No responsive design optimizations for mobile

---

## 🎯 Testing the Application

### Test Workflow

1. **Start the backend** (ensure it's running on port 8000)
2. **Open the frontend** in your browser
3. **Verify instruments load** - you should see 10 instruments
4. **Place a BUY order**:
   - Click "Buy" on AAPL
   - Submit the pre-filled form
   - Check "My Orders" tab - status should be EXECUTED
   - Check "My Trades" tab - trade should appear
   - Check "Portfolio" tab - AAPL should appear with quantity
5. **Place a SELL order**:
   - Manually create a SELL order for AAPL
   - Verify portfolio quantity decreases

### API Testing with Swagger

Visit `http://localhost:8000/docs` for interactive API documentation where you can test all endpoints.

---

## 🔧 Future Enhancements

- User authentication and multi-user support
- Order cancellation functionality
- Real-time price updates
- Advanced order types (Stop Loss, OCO, etc.)
- Charts and analytics dashboard
- Trade history filtering and export
- WebSocket for real-time notifications
- Docker containerization
- Unit and integration tests

---

## 📄 License

This project is created for educational purposes as part of a technical assignment.

---

## 👤 Author

Created as a demonstration of backend system design and REST API development for trading platforms.

---

## 🙏 Acknowledgments

- FastAPI documentation
- SQLAlchemy ORM
- Modern web design patterns

---

**Note**: This is a demonstration project with simplified trading logic. Do not use in production or with real trading systems.

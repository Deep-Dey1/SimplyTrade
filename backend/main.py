from fastapi import FastAPI, Depends, HTTPException, Header, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
import os

from .database import engine, get_db, Base, SessionLocal
from .models import Instrument, Order, Trade, Portfolio, User

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SimplyTrade API", version="1.0.0")

# Create API router
api_router = APIRouter(prefix="/api/v1")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schemas for request/response
class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    
    class Config:
        from_attributes = True

# Dependency to get current user from header and validate
def get_current_user(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID not provided")
    
    # Verify user exists in database
    user = db.query(User).filter(User.email == x_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return x_user_id
class InstrumentResponse(BaseModel):
    id: int
    symbol: str
    exchange: str
    instrument_type: str
    last_traded_price: float

    class Config:
        from_attributes = True

class OrderRequest(BaseModel):
    symbol: str
    order_type: str  # BUY or SELL
    order_style: str  # MARKET or LIMIT
    quantity: int = Field(..., gt=0)
    price: Optional[float] = None

class OrderResponse(BaseModel):
    id: int
    symbol: str
    order_type: str
    order_style: str
    quantity: int
    price: Optional[float]
    status: str
    created_at: datetime
    executed_at: Optional[datetime]

    class Config:
        from_attributes = True

class TradeResponse(BaseModel):
    id: int
    order_id: int
    symbol: str
    order_type: str
    quantity: int
    price: float
    executed_at: datetime

    class Config:
        from_attributes = True

class PortfolioResponse(BaseModel):
    symbol: str
    quantity: int
    average_price: float
    current_value: float

# Root endpoint
# AUTH APIs
@api_router.post("/auth/register", response_model=UserResponse, status_code=201)
def register_user(user_request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user (In production, hash the password!)
    new_user = User(
        name=user_request.name,
        email=user_request.email,
        password=user_request.password  # Should be hashed in production
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@api_router.post("/auth/login", response_model=UserResponse)
def login_user(login_request: UserLoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    
    # Find user by email
    user = db.query(User).filter(User.email == login_request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check password (In production, compare hashed password)
    if user.password != login_request.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return user

# 1. INSTRUMENT APIs
@api_router.get("/instruments", response_model=List[InstrumentResponse])
def get_instruments(db: Session = Depends(get_db)):
    """Fetch list of tradable instruments"""
    instruments = db.query(Instrument).all()
    return instruments

@api_router.get("/instruments/{symbol}", response_model=InstrumentResponse)
def get_instrument(symbol: str, db: Session = Depends(get_db)):
    """Fetch specific instrument by symbol"""
    instrument = db.query(Instrument).filter(Instrument.symbol == symbol).first()
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return instrument

# 2. ORDER MANAGEMENT APIs
@api_router.post("/orders", response_model=OrderResponse, status_code=201)
def place_order(order_request: OrderRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    """Place a new order"""
    
    # Validation: Check if instrument exists
    instrument = db.query(Instrument).filter(Instrument.symbol == order_request.symbol).first()
    if not instrument:
        raise HTTPException(status_code=400, detail=f"Instrument {order_request.symbol} not found")
    
    # Validation: Price required for LIMIT orders
    if order_request.order_style == "LIMIT" and order_request.price is None:
        raise HTTPException(status_code=400, detail="Price is required for LIMIT orders")
    
    # Validation: Order type and style
    if order_request.order_type not in ["BUY", "SELL"]:
        raise HTTPException(status_code=400, detail="Order type must be BUY or SELL")
    
    if order_request.order_style not in ["MARKET", "LIMIT"]:
        raise HTTPException(status_code=400, detail="Order style must be MARKET or LIMIT")
    
    # Create order
    new_order = Order(
        user_id=user_id,
        symbol=order_request.symbol,
        order_type=order_request.order_type,
        order_style=order_request.order_style,
        quantity=order_request.quantity,
        price=order_request.price,
        status="PLACED"
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Execute order immediately for MARKET orders (simulation)
    if order_request.order_style == "MARKET":
        execute_order(new_order.id, db)
    
    db.refresh(new_order)
    return new_order

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order_status(order_id: int, db: Session = Depends(get_db)):
    """Fetch order status by order ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.get("/orders", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    """Fetch all orders for the user"""
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    return orders

# 3. TRADE APIs
@api_router.get("/trades", response_model=List[TradeResponse])
def get_trades(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    """Fetch list of executed trades"""
    trades = db.query(Trade).filter(Trade.user_id == user_id).order_by(Trade.executed_at.desc()).all()
    return trades

# 4. PORTFOLIO APIs
@api_router.get("/portfolio", response_model=List[PortfolioResponse])
def get_portfolio(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    """Fetch current portfolio holdings"""
    portfolio_items = db.query(Portfolio).filter(Portfolio.user_id == user_id, Portfolio.quantity > 0).all()
    
    result = []
    for item in portfolio_items:
        # Get current price from instrument
        instrument = db.query(Instrument).filter(Instrument.symbol == item.symbol).first()
        current_price = instrument.last_traded_price if instrument else item.average_price
        
        result.append({
            "symbol": item.symbol,
            "quantity": item.quantity,
            "average_price": item.average_price,
            "current_value": item.quantity * current_price
        })
    
    return result

# Helper function to execute orders
def execute_order(order_id: int, db: Session):
    """Simulate order execution"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return
    
    # Get instrument price
    instrument = db.query(Instrument).filter(Instrument.symbol == order.symbol).first()
    if not instrument:
        return
    
    # Determine execution price
    execution_price = order.price if order.order_style == "LIMIT" else instrument.last_traded_price
    
    # Create trade record
    trade = Trade(
        order_id=order.id,
        user_id=order.user_id,
        symbol=order.symbol,
        order_type=order.order_type,
        quantity=order.quantity,
        price=execution_price
    )
    db.add(trade)
    
    # Update portfolio
    portfolio_item = db.query(Portfolio).filter(Portfolio.user_id == order.user_id, Portfolio.symbol == order.symbol).first()
    
    if order.order_type == "BUY":
        if portfolio_item:
            # Update average price and quantity
            total_cost = (portfolio_item.quantity * portfolio_item.average_price) + (order.quantity * execution_price)
            portfolio_item.quantity += order.quantity
            portfolio_item.average_price = total_cost / portfolio_item.quantity
        else:
            # Create new portfolio entry
            portfolio_item = Portfolio(
                user_id=order.user_id,
                symbol=order.symbol,
                quantity=order.quantity,
                average_price=execution_price
            )
            db.add(portfolio_item)
    
    elif order.order_type == "SELL":
        if portfolio_item and portfolio_item.quantity >= order.quantity:
            portfolio_item.quantity -= order.quantity
        # Note: In a real system, you'd check if user has enough quantity to sell
    
    # Update order status
    order.status = "EXECUTED"
    order.executed_at = datetime.utcnow()
    
    db.commit()

# Initialize database with sample instruments
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    
    # Check if instruments already exist
    if db.query(Instrument).count() == 0:
        sample_instruments = [
            Instrument(symbol="AAPL", exchange="NASDAQ", instrument_type="EQUITY", last_traded_price=178.50),
            Instrument(symbol="GOOGL", exchange="NASDAQ", instrument_type="EQUITY", last_traded_price=142.80),
            Instrument(symbol="MSFT", exchange="NASDAQ", instrument_type="EQUITY", last_traded_price=378.90),
            Instrument(symbol="AMZN", exchange="NASDAQ", instrument_type="EQUITY", last_traded_price=155.20),
            Instrument(symbol="TSLA", exchange="NASDAQ", instrument_type="EQUITY", last_traded_price=245.60),
            Instrument(symbol="RELIANCE", exchange="NSE", instrument_type="EQUITY", last_traded_price=2456.75),
            Instrument(symbol="TCS", exchange="NSE", instrument_type="EQUITY", last_traded_price=3678.50),
            Instrument(symbol="INFY", exchange="NSE", instrument_type="EQUITY", last_traded_price=1456.30),
            Instrument(symbol="HDFCBANK", exchange="NSE", instrument_type="EQUITY", last_traded_price=1678.90),
            Instrument(symbol="ICICIBANK", exchange="NSE", instrument_type="EQUITY", last_traded_price=987.65),
            Instrument(symbol="WIPRO", exchange="NSE", instrument_type="EQUITY", last_traded_price=445.80),
        ]
        
        db.bulk_save_objects(sample_instruments)
        db.commit()
    
    db.close()

# Include API router BEFORE mounting static files
app.include_router(api_router)

# Mount static files (frontend) - this comes after API routes are registered
# Try multiple possible paths for the public directory
public_dir = None
possible_paths = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "public"),
    os.path.join(os.getcwd(), "public"),
    "/opt/render/project/src/public"
]

for path in possible_paths:
    if os.path.exists(path):
        public_dir = path
        print(f"Found public directory at: {public_dir}")
        break

if public_dir:
    app.mount("/", StaticFiles(directory=public_dir, html=True), name="static")
else:
    print("Warning: public directory not found")
    # Add a fallback root route
    @app.get("/")
    def root():
        return {"message": "SimplyTrade API - Frontend files not found. API is available at /api/v1/"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

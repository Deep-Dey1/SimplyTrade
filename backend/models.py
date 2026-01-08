from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from datetime import datetime
from .database import Base
import enum

# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)  # In production, this should be hashed
    created_at = Column(DateTime, default=datetime.utcnow)

# Enums for order types
class OrderType(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"

class OrderStyle(str, enum.Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"

class OrderStatus(str, enum.Enum):
    NEW = "NEW"
    PLACED = "PLACED"
    EXECUTED = "EXECUTED"
    CANCELLED = "CANCELLED"

class InstrumentType(str, enum.Enum):
    EQUITY = "EQUITY"
    FUTURES = "FUTURES"
    OPTIONS = "OPTIONS"

# Instrument Model
class Instrument(Base):
    __tablename__ = "instruments"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    exchange = Column(String)
    instrument_type = Column(String)
    last_traded_price = Column(Float)

# Order Model
class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="user_001")  # Mocked user
    symbol = Column(String)
    order_type = Column(String)  # BUY or SELL
    order_style = Column(String)  # MARKET or LIMIT
    quantity = Column(Integer)
    price = Column(Float, nullable=True)  # Required for LIMIT orders
    status = Column(String, default="NEW")
    created_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)

# Trade Model
class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer)
    user_id = Column(String, default="user_001")
    symbol = Column(String)
    order_type = Column(String)  # BUY or SELL
    quantity = Column(Integer)
    price = Column(Float)
    executed_at = Column(DateTime, default=datetime.utcnow)

# Portfolio Model
class Portfolio(Base):
    __tablename__ = "portfolio"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="user_001")
    symbol = Column(String)
    quantity = Column(Integer, default=0)
    average_price = Column(Float, default=0.0)

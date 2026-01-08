# Database initialization script
from backend.database import engine, Base
from backend.models import User, Instrument, Order, Trade, Portfolio

# Create all tables
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")

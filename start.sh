#!/bin/bash
# Start script for Render

# Run database migrations (create tables)
python -c "from backend.database import engine, Base; from backend.models import User, Instrument, Order, Trade, Portfolio; Base.metadata.create_all(bind=engine)"

# Start the FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}

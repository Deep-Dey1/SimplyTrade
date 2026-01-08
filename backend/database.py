from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite database URL - Use /tmp for serverless environments like Vercel
# Note: Data in /tmp is ephemeral and will be cleared between deployments
db_path = "/tmp/trading.db" if os.environ.get("VERCEL") else "./trading.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

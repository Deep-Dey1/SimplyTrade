from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite database URL
# For Render: Store in persistent disk at /opt/render/project/src
db_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(db_dir, "trading.db")
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

#!/bin/bash
# Start script for Render

# Run database migrations (create tables)
cd /opt/render/project/src
python -m backend.database_init

# Start the FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}

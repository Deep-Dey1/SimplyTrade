#!/bin/bash
# Start script for Render

# Set Python path to include the project root
export PYTHONPATH=/opt/render/project/src:$PYTHONPATH

# Run database migrations (create tables)
cd /opt/render/project/src
python -m backend.database_init

# Start the FastAPI server
cd /opt/render/project/src
uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}

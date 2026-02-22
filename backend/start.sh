#!/bin/bash
# Production startup script for FastAPI using Gunicorn with Uvicorn workers

# Load environment variables if needed
# export $(cat .env | xargs)

# Start Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000

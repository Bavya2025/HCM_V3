#!/bin/bash

# Activate virtual environment
source "/home/user/ERPS - Copy 19/venv/bin/activate"

# Change to backend directory
cd "/home/user/ERPS - Copy 19/backend"

# Start Gunicorn
exec gunicorn config.wsgi:application --bind 127.0.0.1:8001

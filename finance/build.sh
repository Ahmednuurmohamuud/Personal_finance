#!/bin/bash
# Stop on first error
set -e

# 1. Ku rakib dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# 2. Samee migrations
echo "Applying database migrations..."
python manage.py migrate

# 3. Abuuro currencies haddii aysan jirin
echo "Creating default currencies..."
python manage.py create_currencies

# 4. Start Django server using gunicorn
echo "Starting Gunicorn server..."
gunicorn finance_project.wsgi:application --bind 0.0.0.0:8000

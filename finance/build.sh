#!/bin/bash

# Rakib dependencies
pip install -r requirements.txt

# Ku dabaq migrations
python manage.py migrate --noinput

# Abuur currencies
python manage.py create_currencies

# Ururi static files
python manage.py collectstatic --noinput

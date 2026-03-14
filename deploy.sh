#!/bin/bash

# Ensure pm2 and serve are installed
if ! command -v pm2 &> /dev/null
then
    echo "PM2 not found. Installing globally..."
    npm install -g pm2
fi

if ! command -v serve &> /dev/null
then
    echo "Serve not found. Installing globally..."
    npm install -g serve
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Install backend requirements
echo "Installing backend dependencies..."
cd backend
python3 -m pip install -r requirements.txt
cd ..

# Install frontend dependencies and build
echo "Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

# Install adminpanel dependencies and build
echo "Installing adminpanel dependencies..."
cd adminpanel
npm install
npm run build
cd ..

# Start application using PM2
echo "Starting services with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Enable PM2 startup
echo "Enabling PM2 startup..."
pm2 startup

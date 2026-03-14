@echo off
setlocal

echo "Checking for PM2 and serve..."
where pm2 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo "PM2 not found. Installing globally..."
    npm install -g pm2
)

where serve >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo "Serve not found. Installing globally..."
    npm install -g serve
)

if not exist "logs" mkdir logs

echo "Installing backend dependencies..."
cd backend
python -m pip install -r requirements.txt
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

echo "Installing adminpanel dependencies..."
cd adminpanel
npm install
npm run build
cd ..

echo "Starting services with PM2..."
pm2 start ecosystem.config.js --env production

echo "Saving PM2 process list..."
pm2 save

echo "PM2 startup is manual on Windows. Please check pm2-windows-startup if needed."
pause

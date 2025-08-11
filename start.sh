#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to clean up background processes on exit
cleanup() {
  echo "Stopping all processes..."
  kill $(jobs -p) 2>/dev/null || true
  exit
}

# Trap SIGINT and SIGTERM to clean up
trap cleanup SIGINT SIGTERM

# Check if yarn is installed
if ! command -v yarn &> /dev/null
then
  echo "yarn could not be found. Please install yarn first."
  exit 1
fi

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd backend
  yarn install
  cd ..
fi

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  yarn install
  cd ..
fi

# Start backend server in the background
echo "Starting backend server..."
cd backend
yarn dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend development server in the background
echo "Starting frontend development server..."
cd frontend
yarn dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Servers started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
echo "Backend API: http://localhost:8000/api/test"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID

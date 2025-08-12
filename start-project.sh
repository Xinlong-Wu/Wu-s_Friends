#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to print messages
print_message() {
  echo "=====> $1"
}

# Check if yarn is installed
if ! command -v yarn &> /dev/null
then
  echo "yarn could not be found. Please install yarn first."
  exit 1
fi

# Install backend dependencies
print_message "Installing backend dependencies..."
cd backend
yarn install
cd ..

# Install frontend dependencies
print_message "Installing frontend dependencies..."
cd frontend
yarn install
cd ..

# Create uploads directory if it doesn't exist
print_message "Creating uploads directory..."
mkdir -p backend/uploads

# Start both servers
print_message "Starting backend server..."
cd backend
yarn dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

print_message "Starting frontend server..."
cd frontend
yarn dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

print_message "Servers started!"
print_message "Frontend: http://localhost:5173"
print_message "Backend: http://localhost:8000"
print_message "Logs are being written to backend.log and frontend.log"
print_message "Press Ctrl+C to stop both servers"

# Cleanup function to kill child processes when script is terminated
cleanup() {
  print_message "Stopping servers..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  print_message "Servers stopped."
  exit 0
}

# Trap termination signals to cleanup
trap cleanup INT TERM

# Wait for child processes
wait $BACKEND_PID $FRONTEND_PID

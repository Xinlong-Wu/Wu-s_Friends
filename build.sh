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

# Build frontend
print_message "Building frontend..."
cd frontend
yarn build
cd ..

# Build backend
print_message "Building backend..."
cd backend
yarn build
cd ..

print_message "Build completed successfully!"
print_message "To start the application, run: cd backend && yarn start"

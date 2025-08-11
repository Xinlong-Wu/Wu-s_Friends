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

# Test backend TypeScript compilation
print_message "Testing backend TypeScript compilation..."
cd backend
yarn tsc --noEmit
cd ..

# Test frontend TypeScript compilation
print_message "Testing frontend TypeScript compilation..."
cd frontend
yarn tsc --noEmit
cd ..

print_message "All TypeScript tests passed!"
print_message "To start the development servers, run: ./start.sh"

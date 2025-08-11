# Project Scripts

This project includes several helper scripts to make development and deployment easier.

## Available Scripts

### `start.sh`
Starts both the frontend and backend development servers simultaneously.

```bash
./start.sh
```

This script will:
1. Install dependencies for both frontend and backend if they haven't been installed
2. Start the backend server on port 8000
3. Start the frontend development server on port 5173
4. Display the URLs for both servers
5. Handle graceful shutdown of both servers when you press Ctrl+C

### `build.sh`
Builds both the frontend and backend for production.

```bash
./build.sh
```

This script will:
1. Install dependencies for both frontend and backend
2. Build the frontend React application
3. Compile the backend TypeScript code
4. Output the build results

After running this script, you can start the production server with:
```bash
cd backend
yarn start
```

### `test.sh`
Runs TypeScript compilation tests for both frontend and backend to verify there are no type errors.

```bash
./test.sh
```

This script will:
1. Check that both frontend and backend code compile without TypeScript errors
2. Report success or failure

## Manual Commands

If you prefer to run commands manually, here are the equivalent commands:

### Frontend Development
```bash
cd frontend
yarn install
yarn dev
```

### Backend Development
```bash
cd backend
yarn install
yarn dev
```

### Production Build
```bash
# Frontend
cd frontend
yarn install
yarn build

# Backend
cd backend
yarn install
yarn build
```

### Production Start
```bash
cd backend
yarn start
```

The application will be available at `http://localhost:8000`.

## Environment Variables

Before running the application, make sure to set up your environment variables:

1. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Update the values in `backend/.env` with your actual configuration, especially:
   - `ALIYUN_API_KEY`: Your Aliyun API key for AI services

## Troubleshooting

If you encounter any issues:

1. Make sure you have Node.js (v16 or higher) and Yarn (v3+) installed
2. Ensure all dependencies are installed by running `yarn install` in both frontend and backend directories
3. Check that the ports 5173 (frontend) and 8000 (backend) are not being used by other applications
4. Verify your Aliyun API key is correctly set in the backend `.env` file

# AI Chat Application

A full-stack chat application that interacts with Aliyun AI services, built with React, TypeScript, and Node.js.

## Features

### High Priority (Implemented)
- ✅ Smooth AI conversation with context continuity
- ✅ Streaming output (showing text as it's generated)
- ✅ One-click clearing of current session context
- ✅ File upload (txt, pdf, docx) and passing to AI
- ✅ Image upload (jpg, png, jpeg) and passing to AI

### Medium Priority (Implemented)
- ✅ Multi-session support (session list, each with independent context)
- ✅ Delete sessions

### Low Priority (Partially Implemented)
- ✅ User login (email or third-party) with cloud sync (basic implementation)

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Zustand for state management
- **Backend**: Node.js with Express, TypeScript
- **Package Manager**: Yarn (4+)
- **AI Service**: Aliyun AI services
- **File Upload**: Multer with support for Aliyun OSS or direct API upload

## Prerequisites

- Node.js (v16 or higher)
- Yarn (v4+)
- Aliyun API Key

## Quick Start

1. **Install dependencies and start both servers**:
   ```bash
   ./start-project.sh
   ```

2. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

## Manual Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the values in `.env` with your actual configuration, especially:
     ```
     ALIYUN_API_KEY=your-actual-api-key-here
     ```

4. Create uploads directory:
   ```bash
   mkdir uploads
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

## Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   cd backend
   yarn dev
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   cd frontend
   yarn dev
   ```

### Production Mode

1. Build both frontend and backend:
   ```bash
   # Build frontend
   cd frontend
   yarn build
   
   # Build backend
   cd ../backend
   yarn build
   ```

2. Start the server:
   ```bash
   yarn start
   ```

3. The application will be available at `http://localhost:8000`

## Project Structure

```
.
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── README.md
```

## API Endpoints

### Chat
- `POST /api/chat/sessions` - Create a new chat session
- `GET /api/chat/sessions` - Get all chat sessions
- `DELETE /api/chat/sessions/:id` - Delete a chat session
- `POST /api/chat/:sessionId/message` - Send a message to AI
- `DELETE /api/chat/:sessionId/messages` - Clear session messages

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Upload
- `POST /api/upload` - Upload a file

## Development

### Frontend
The frontend is built with React and TypeScript, using:
- Zustand for state management
- Tailwind CSS for styling
- React Markdown for rendering markdown content
- React Syntax Highlighter for code highlighting

### Backend
The backend is built with Node.js and Express, using:
- TypeScript for type safety
- Multer for file uploads
- In-memory storage for development (should be replaced with a database in production)

## Configuration

### Aliyun API Key

1. Get your API key from [Aliyun DashScope](https://dashscope.console.aliyun.com/)
2. Add it to your backend `.env` file:
   ```
   ALIYUN_API_KEY=your-actual-api-key-here
   ```

## Deployment

For production deployment, you can:
1. Build the frontend and backend
2. Serve the frontend build from the backend server
3. Deploy to your preferred hosting platform (VPS, cloud provider, etc.)

## Notes

- The application uses in-memory storage for development. For production, replace with a proper database.
- API keys should be kept secure and not exposed in the frontend.
- File uploads are stored locally in the `uploads/` directory in development. For production, use cloud storage like Aliyun OSS.

## Troubleshooting

If you encounter any issues:

1. Make sure you have Node.js (v16 or higher) and Yarn (v4+) installed
2. Ensure all dependencies are installed by running `yarn install` in both frontend and backend directories
3. Check that the ports 5173 (frontend) and 8000 (backend) are not being used by other applications
4. Verify your Aliyun API key is correctly set in the backend `.env` file

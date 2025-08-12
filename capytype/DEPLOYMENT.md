# CapyType Race - Local Deployment Guide

## 🚀 Local Deployment

This guide focuses on running CapyType Race locally only, without any cloud deployment.

### Local Development Setup

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd capytype/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
4. The backend will run on http://localhost:3001

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd capytype/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. The frontend will be available at http://localhost:5173

#### Environment Configuration

**Backend (.env)**
```
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
NODE_ENV=development
ROOM_ID_SECRET=capytype-shared-secret
```

**Frontend (.env)**
```
VITE_BACKEND_URL=http://localhost:3001
```

## 🧪 Testing the Local Deployment

1. Start both the backend and frontend servers as described above
2. Open http://localhost:5173 in your browser
3. Enter a nickname
4. Create a room
5. Share the room code with others on your local network

## 📋 Local Deployment Checklist

- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:5173
- [ ] Environment variables properly configured
- [ ] WebSocket connection working
- [ ] Room creation and joining working
- [ ] Game functionality working

## 🆘 Troubleshooting

### "Failed to connect to server"
- Ensure backend is running on port 3001
- Check frontend .env file has correct backend URL
- Verify CORS configuration in backend .env file

### WebSocket Connection Issues
- Check browser console for specific errors
- Ensure no firewall is blocking WebSocket connections
- Try using different browsers

### Room Creation/Joining Issues
- Check backend logs for any errors
- Ensure both frontend and backend are running
- Verify that the socket connection is established (check browser console)

## 📞 Running the Application

To run the entire application with a single command, use:

```bash
cd capytype
npm run dev
```

This will start both the backend and frontend servers concurrently.


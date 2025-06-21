# CapyType Race - Deployment Guide

## 🚀 Deployment Status

### Frontend Deployment ✅
- **URL**: https://napsdsub.manus.space
- **Platform**: Manus Space (React deployment)
- **Status**: Successfully deployed
- **Build**: Production-ready with optimizations

### Backend Deployment 🔄
The backend needs to be deployed to a service that supports WebSockets. Here are the recommended options:

## 🌐 Backend Deployment Options

### Option 1: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub account
3. Select the CapyType-Race repository
4. Choose the `capytype/backend` folder as root
5. Set environment variables:
   ```
   FRONTEND_URL=https://napsdsub.manus.space
   CORS_ORIGIN=https://napsdsub.manus.space,http://localhost:5173
   PORT=3001
   ```
6. Deploy automatically

### Option 2: Render
1. Go to [Render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Set root directory to `capytype/backend`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Set environment variables (same as above)

### Option 3: Heroku
1. Install Heroku CLI
2. Create new app: `heroku create capytype-backend`
3. Set buildpack: `heroku buildpacks:set heroku/nodejs`
4. Set environment variables: `heroku config:set FRONTEND_URL=https://napsdsub.manus.space`
5. Deploy: `git subtree push --prefix=capytype/backend heroku main`

## 🔧 Configuration Update Required

After deploying the backend, you need to update the frontend configuration:

1. **Update frontend/.env**:
   ```env
   VITE_BACKEND_URL=https://your-backend-url.com
   ```

2. **Rebuild and redeploy frontend**:
   ```bash
   cd frontend
   npm run build
   # Then redeploy to your hosting service
   ```

## 🧪 Testing the Deployment

1. Open the frontend URL: https://napsdsub.manus.space
2. Enter a nickname
3. Try to create a room
4. If you see "Failed to connect to server", the backend needs to be deployed

## 📋 Deployment Checklist

- [x] Frontend deployed to Manus Space
- [x] Frontend build optimized
- [x] Environment variables configured
- [ ] Backend deployed to hosting service
- [ ] Backend environment variables set
- [ ] Frontend updated with backend URL
- [ ] End-to-end testing completed

## 🔍 Next Steps

1. **Choose a backend hosting service** from the options above
2. **Deploy the backend** with the provided instructions
3. **Update the frontend** with the new backend URL
4. **Test the complete application** to ensure everything works

## 🆘 Troubleshooting

### "Failed to connect to server"
- Backend is not deployed or not accessible
- Check backend URL in frontend .env file
- Verify CORS configuration in backend

### CORS Errors
- Add frontend URL to backend CORS_ORIGIN
- Ensure both HTTP and HTTPS are handled

### WebSocket Connection Issues
- Ensure hosting service supports WebSockets
- Check firewall and proxy settings

## 📞 Support

If you need help with the backend deployment, please provide:
1. Which hosting service you prefer
2. Any error messages you encounter
3. Your backend deployment URL (once available)

The frontend is ready and waiting for the backend connection!


# CapyType Race 🏁

A real-time multiplayer typing game with a capybara theme where players race against each other to type text as quickly and accurately as possible.

## 🚀 Features

- **Real-time Multiplayer Racing** - Compete with friends in live typing races
- **Capybara-themed UI** - Cute and engaging interface with customizable avatar colors
- **Room-based Gameplay** - Create or join private rooms with readable room names
- **Avatar Customization** - Choose from 10 different capybara colors and personalities
- **AI-powered Text Generation** - Host can generate race text using AI with topic prompts
- **Character Limit Control** - Set precise character limits for race text (50-500 characters)
- **Smart Text Truncation** - Ensures text always ends at logical boundaries (sentence/word)
- **Individual Player Lanes** - Focus on your own performance during the race
- **Real-time Color Feedback** - Instantly see typing correctness with color highlighting
- **Performance Metrics** - Track WPM, errors, and accuracy
- **Results Dashboard** - Compare your performance with others

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.IO
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI Text Generation**: Hugging Face Inference API
- **Hosting**: Firebase (Frontend) + Railway (Backend)
- **Version Control**: Git + GitHub

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend (Firebase)"
        A[React App] --> B[Zustand Store]
        B --> C[Socket.IO Client]
        A --> D[Game Components]
        A --> E[Lobby Components]
        A --> F[Avatar System]
        F --> G[Color Picker]
        E --> H[Text Generation Modal]
        H --> I[AI Text Generation]
        H --> J[Smart Text Truncation]
    end
    
    subgraph "Backend (Railway)"
        K[Express Server] --> L[Socket.IO Server]
        L --> M[Room Manager]
        M --> N[Game Logic]
        L --> O[Player Management]
        O --> P[Avatar Color Sync]
        Q[Room Validation] --> R[UUID Processing]
    end
    
    subgraph "External Services"
        S[Hugging Face API] --> I
    end
    
    subgraph "Real-time Communication"
        C <--> L
        G <--> P
    end
    
    subgraph "Game Flow"
        T[Login & Avatar Selection] --> U[Create/Join Room]
        U --> V[Lobby with Player Cards]
        V --> W[Text Generation]
        W --> X[Game Start]
        X --> Y[Typing Race]
        Y --> Z[Results]
        Z --> V
    end
    
    subgraph "Performance Optimizations"
        AA[Asset Preloading]
        AB[Individual Player Lanes]
        AC[Real-time Typing Feedback]
    end
    
    style A fill:#e1f5fe
    style K fill:#f3e5f5
    style C fill:#fff3e0
    style L fill:#fff3e0
    style F fill:#e8f5e8
    style G fill:#e8f5e8
    style I fill:#e0f7fa
    style S fill:#bbdefb
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/souzabruno01/CapyType-Race.git
   cd CapyType-Race/capytype
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   
   **Frontend (.env)**
   ```env
   VITE_BACKEND_URL=http://localhost:3001
   ```
   
   **Backend (.env)**
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🌐 Production Deployment

### Frontend (Firebase)
```bash
cd frontend
npm run build
firebase deploy
```

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables:
   - `FRONTEND_URL`: Your Firebase hosting URL
   - `CORS_ORIGIN`: Your Firebase hosting URL + localhost for development

## 🎮 How to Play

1. **Enter your nickname** on the login screen
2. **Choose your capybara avatar** by clicking on the capybara face (10 colors available)
3. **Create a room** or **join an existing room** with a room ID
4. **Wait in the lobby** for other players to join (you'll see colorful player cards)
5. **Customize your color** anytime in the lobby using the edit button on your player card
6. **Generate race text** (host only) - Choose a topic and character limit or use random text
7. **Start the game** when ready (room admin only)
8. **Type the displayed text** as fast and accurately as possible (green for correct, red for errors)
9. **View results** and compare your performance with others

## 📊 Game Metrics

- **WPM (Words Per Minute)**: Typing speed calculation
- **Accuracy**: Percentage of correctly typed characters
- **Errors**: Number of mistakes made
- **Position**: Your rank among all players

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend server URL | `http://localhost:3001` |
| `PORT` | Backend server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `CORS_ORIGIN` | Allowed CORS origins | `localhost URLs` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues & Solutions

### "Failed to connect to server"
- **Cause**: Backend URL misconfiguration
- **Solution**: Update `VITE_BACKEND_URL` in frontend `.env` file

### CORS Errors
- **Cause**: Frontend domain not allowed in backend CORS
- **Solution**: Add your domain to `CORS_ORIGIN` in backend `.env` file

### "Invalid room code" when trying to join
- **Cause**: Room does not exist or has been closed
- **Solution**: Double-check the room code or create a new room

## 🚀 Recent Updates

- ✅ **Performance Optimization** - Implemented asset preloading to eliminate game start latency
- ✅ **Host-Driven Text Generation** - Moved text generation to lobby (host-only) with real AI integration
- ✅ **Individual Player Lanes** - Updated to show only the current player's lane during the race
- ✅ **Real-time Typing Feedback** - Added color-coded feedback (green, red, yellow) and error counting
- ✅ **Adaptive Results Modal** - Redesigned to be responsive and visually separated
- ✅ **Hugging Face AI Integration** - Using real AI text generation with topic and character limit options
- ✅ **Smart Text Truncation** - Implemented boundary-aware text truncation (sentence/word) for all text sources
- ✅ **Room Validation Fix** - Simplified room joining with plain UUIDs for better reliability
- ✅ **Enhanced Error Handling** - Improved validation and error handling for room joining
- ✅ **Backend Auto-deployment** - Updated Railway configuration for automatic deployment on git push

---

Made with ❤️ and 🐹 by [Bruno Souza](https://github.com/souzabruno01)


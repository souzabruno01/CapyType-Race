# CapyType Race 🏁

A real-time multiplayer typing game with a capybara theme where players race against each other to type text as quickly and accurately as possible.

## 🚀 Features

- **Real-time Multiplayer Racing** - Compete with friends in live typing races
- **Capybara-themed UI** - Cute and engaging interface with customizable avatar colors
- **Room-based Gameplay** - Create or join private rooms with readable room names
- **Avatar Customization** - Choose from 10 different capybara colors and personalities
- **Enhanced Visibility** - Improved UI transparency and color contrast
- **Live Progress Tracking** - See everyone's progress in real-time with vibrant player cards
- **Performance Metrics** - Track WPM, errors, and accuracy
- **Results Dashboard** - Compare your performance with others
- **Smart Lobby Redirection** - Seamless navigation back to functional lobbies
- **Automatic Race Completion** - Games end automatically when all players finish
- **Server-Authoritative Room Management** - Reliable room state management
- **🤖 Dynamic Text Generation** - Enhanced content creation with Railway backend integration
- **📊 Difficulty-Based Text System** - Easy (200 chars), Medium (400 chars), Hard (800 chars)
- **📚 Multiple Content Categories** - Quotes, Programming, Science, Stories, Technical, Literature

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.IO
- **State Management**: Zustand
- **Styling**: Tailwind CSS + Custom Styles
- **Animations**: Framer Motion
- **Real-time Communication**: Socket.IO
- **Text Generation**: Faker.js + Railway Backend Integration
- **Hosting**: Firebase (Frontend) + Railway (Backend)

## 🏗️ Architecture & Game Flow

```mermaid
graph TB
    subgraph "Frontend (Firebase)"
        A[React App] --> B[Zustand Store]
        B --> C[Socket.IO Client]
        A --> D[Game Components]
        A --> E[Lobby Components]
        E --> TGM[Text Generation Modal]
        TGM --> F[Difficulty Selector]
        TGM --> CG[Category Generator]
        A --> G[Avatar System]
        G --> H[Color Picker]
        D --> I[Results Modal]
        I --> J[Back to Lobby Button]
    end
    
    subgraph "Backend (Railway)"
        K[Express Server] --> L[Socket.IO Server]
        L --> M[Room Manager]
        M --> N[Game Logic]
        L --> O[Player Management]
        O --> P[Avatar Color Sync]
        M --> Q[Race Completion Detection]
        M --> R[Room State Management]
        K --> S[Text Generation API]
        S --> T[Faker.js Engine]
        T --> U[Category Processing]
        U --> V[Difficulty-Based Length Control]
    end
    
    subgraph "Real-time Communication"
        C <--> L
        H <--> P
        J <--> R
        Q <--> I
        CG <--> S
    end
    
    subgraph "Enhanced Game Flow"
        W[Login & Avatar Selection] --> X[Create/Join Room]
        X --> Y[Lobby with Player Cards]
        Y --> Z[Generate Text Modal]
        Z --> AA{Custom Text?}
        AA -->|Yes| BB[Select Difficulty & Category]
        AA -->|No| CC[Quick Start]
        BB --> DD[API Call to Railway Backend]
        DD --> EE[AI-Generated Text]
        CC --> FF[Random Default Text]
        EE --> GG[Game Start]
        FF --> GG
        GG --> HH[Typing Race]
        HH --> II{All Players Finished?}
        II -->|Yes| JJ[Auto Race End]
        II -->|No| KK[Continue Racing]
        KK --> LL{Time Up?}
        LL -->|Yes| JJ
        LL -->|No| KK
        JJ --> MM[Results Modal]
        MM --> NN[Back to Lobby]
        NN --> OO[Room Reset to Waiting]
        OO --> Y
        MM --> PP[Back to Login]
        PP --> W
    end
    
    subgraph "New Features 2025"
        QQ[Smart Lobby Returns]
        RR[Auto Race Completion]
        SS[Server Room Reset]
        TT[Real-time State Sync]
        UU[Dynamic Text Generation]
        VV[Difficulty-Based Limits]
        WW[Category-Based Content]
        XX[Railway Backend Integration]
    end
    
    style A fill:#e1f5fe
    style K fill:#f3e5f5
    style C fill:#fff3e0
    style L fill:#fff3e0
    style QQ fill:#e8f5e8
    style RR fill:#e8f5e8
    style SS fill:#e8f5e8
    style TT fill:#e8f5e8
    style UU fill:#e8f5e8
    style VV fill:#e8f5e8
    style WW fill:#e8f5e8
    style XX fill:#e8f5e8
```

## 🔄 Lobby Redirection & Race Completion Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant R as Room State
    participant P as Players

    Note over F,P: Enhanced Lobby Redirection Flow
    
    F->>B: User clicks "Back to Lobby"
    B->>R: Reset room state to 'waiting'
    B->>R: Clear race data & timers
    B->>R: Reset player stats
    B->>P: Emit 'gameStateChanged' to all players
    F->>F: Receive state change & navigate to /lobby
    F->>F: Room available for new players
    
    Note over F,P: Automatic Race Completion Flow
    
    loop Race Monitoring
        B->>B: Check if all players finished
        B->>B: Monitor race progress
    end
    
    B->>P: Emit 'raceFinished' (all players done)
    F->>F: Show results modal automatically
    P->>P: All players see results simultaneously
    
    Note over F,P: Server-Authoritative Room Management
    
    B->>R: Maintain single source of truth
    B->>P: Sync room state across all clients
    F->>F: Handle backend-initiated state changes
    R->>R: Room available for new players when in 'waiting'
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
6. **Generate custom text** (optional):
   - Click "Generate Text" button to open the text generation modal
   - Choose difficulty: **Easy** (~200 chars), **Medium** (~400 chars), **Hard** (~800 chars)
   - Select category: Quotes, Programming, Science, Stories, Technical, Literature, etc.
   - Click "Generate Random Text" to create dynamic content via Railway backend
7. **Start the game** when ready (room admin can use custom text or quick start with random text)
8. **Type the displayed text** as fast and accurately as possible
9. **View results** and compare your performance with others

## 📊 Game Metrics & Scoring

### Current Scoring System (WPM-Based)
- **Base Points**: WPM × 10
- **Error Penalty**: Errors × 3 (subtracted)
- **Progress Bonus**: Completion % ÷ 5 (added)
- **Speed Bonus**: +50 points if WPM > 60
- **Perfect Bonus**: +50 points if 0 errors

### Example Calculation
If you finish at 65 WPM with 2 errors and 80% progress:
- Base: 65 × 10 = 650 pts
- Penalty: 2 × 3 = -6 pts  
- Progress: 80 ÷ 5 = +16 pts
- Speed bonus: +50 pts (WPM > 60)
- Perfect bonus: 0 pts (had errors)
- **Final Score: 710 points**

### Metrics Tracked
- **WPM (Words Per Minute)**: Real-time typing speed calculation
- **Accuracy**: Percentage of correctly typed characters  
- **Errors**: Number of mistakes made
- **Progress**: Percentage of text completed
- **Position**: Your rank among all players

## 🔧 Technical Implementation

### 🏗️ **Backend Architecture**

#### Socket.IO Events
```javascript
// New lobby redirection events
socket.on('returnToLobby', () => {
  // Reset room state to waiting
  // Clear race data and timers
  // Reset player statistics
  // Notify all players via gameStateChanged
});

// Automatic race completion
socket.on('playerFinished', (data) => {
  // Check if all players finished
  // Auto-end race when complete
  // Send raceFinished event to all players
});

// State synchronization
socket.emit('gameStateChanged', { gameState, reason });
```

#### Text Generation API
```javascript
// New text generation endpoint
app.post('/api/generate-text', (req, res) => {
  const { category, difficulty } = req.body;
  
  // Validate input parameters
  const validCategories = ['quotes', 'code', 'facts', 'stories', 'technical', 'literature'];
  const validDifficulties = ['easy', 'medium', 'hard'];
  
  if (!validCategories.includes(category) || !validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid category or difficulty' });
  }
  
  // Generate text with difficulty-based length limits
  const text = generateText({ category, difficulty });
  res.json({ text, category, difficulty });
});
```

#### Difficulty-Based Text Generation
```javascript
const DIFFICULTY_LIMITS = {
  easy: 200,    // ~200 characters
  medium: 400,  // ~400 characters  
  hard: 800     // ~800 characters
};

function generateText({ category, difficulty }) {
  const targetLength = DIFFICULTY_LIMITS[difficulty];
  let text = getRandomText(category, difficulty);
  
  // Extend or trim to match difficulty requirements
  return adjustTextLength(text, targetLength);
}
```

#### Room State Management
```javascript
// Room states and transitions
const ROOM_STATES = {
  WAITING: 'waiting',     // Accepting new players
  PLAYING: 'playing',     // Game in progress
  FINISHED: 'finished'    // Race completed
};

// Automatic room availability logic
const isRoomAvailable = (room) => {
  return room.gameState === 'waiting' && room.players.length < MAX_PLAYERS;
};
```

### 🎮 **Frontend Implementation**

#### Game Store Integration
```typescript
// Enhanced useGameStore with new events
const gameStore = useGameStore();

// Handle server-initiated state changes
socket.on('gameStateChanged', ({ gameState, reason }) => {
  gameStore.setState({ gameState });
  if (gameState === 'waiting') {
    // Clear race data and reset player stats
    // Navigate to lobby if on game page
  }
});
```

#### Text Generation Integration
```typescript
// Enhanced text generation hook
const useTextGeneration = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedCategory, setSelectedCategory] = useState('general');
  
  const generateRandomText = async () => {
    // Map frontend categories to backend categories
    const categoryMapping = {
      'general': 'quotes',
      'programming': 'code', 
      'science': 'facts',
      // ... more mappings
    };
    
    // Call Railway backend API
    const response = await fetch(`${VITE_BACKEND_URL}/api/generate-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: categoryMapping[selectedCategory],
        difficulty: selectedDifficulty
      })
    });
    
    const data = await response.json();
    return data.text;
  };
};
```

#### Automatic Navigation
```typescript
// Smart navigation based on game state
useEffect(() => {
  if (gameState === 'waiting' && currentPath === '/game' && roomId) {
    navigate('/lobby'); // Auto-redirect to functional lobby
  }
}, [gameState, roomId, navigate]);
```

### 🔄 **Data Flow**

1. **Text Generation Flow**:
   ```
   User selects difficulty & category
   → Frontend calls useTextGeneration hook
   → API request to Railway backend (/api/generate-text)
   → Backend validates input & generates text with faker.js
   → Text returned with appropriate character count
   → Frontend displays generated text in modal
   → User can regenerate or start game with custom text
   ```

2. **Lobby Return Flow**:
   ```
   User clicks "Back to Lobby" 
   → Frontend emits 'returnToLobby'
   → Backend resets room state
   → Backend notifies all players
   → Frontend auto-navigates to lobby
   → Room available for new players
   ```

3. **Race Completion Flow**:
   ```
   Player finishes typing
   → Backend checks all player status
   → If all finished: emit 'raceFinished'
   → All players show results modal
   → Players can return to lobby or login
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend server URL (Railway in production) | `http://localhost:3001` |
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

## 🚀 Recent Updates

### 🎯 **Major Feature Release (July 2025)**

#### 🤖 **Dynamic Text Generation System**
- ✅ **Railway Backend Integration** - Text generation now powered by Railway-hosted backend
- ✅ **Difficulty-Based Length Control** - Easy (~200 chars), Medium (~400 chars), Hard (~800 chars)
- ✅ **Multiple Content Categories** - Quotes, Programming, Science, Stories, Technical, Literature
- ✅ **Faker.js Integration** - Dynamic content creation with enhanced text generation
- ✅ **Category Mapping System** - Frontend categories intelligently mapped to backend generators
- ✅ **Fallback System** - Local text generation as backup if backend unavailable

#### 🎛️ **Enhanced Text Generation Modal**
- ✅ **Removed Character Limit Controls** - Limits now automatically set by difficulty selection
- ✅ **Intuitive Difficulty Selector** - Clear Easy/Medium/Hard options with character count display
- ✅ **Category Selection** - Choose from diverse content types for varied typing challenges
- ✅ **Real-time Generation** - Instant text creation via Railway backend API calls
- ✅ **Custom Text Support** - Users can still input their own text with length validation

#### 🔄 **Smart Lobby Redirection System** 
- ✅ **Functional "Back to Lobby" Button** - Players are now correctly redirected to working lobbies
- ✅ **Server-Side Room Reset** - Backend properly resets room state to 'waiting' when returning to lobby
- ✅ **Room Availability Logic** - Rooms are available for new players only when not in active game state
- ✅ **Real-time State Synchronization** - All players receive instant updates when room state changes

#### 🏁 **Automatic Race Completion**
- ✅ **All-Players-Finished Detection** - Games automatically end when every player completes typing
- ✅ **Instant Results Display** - Results modal appears immediately for all players simultaneously
- ✅ **Smart Race Monitoring** - Backend continuously monitors player completion status
- ✅ **Enhanced User Experience** - No more waiting around when everyone finishes early

#### 🛠️ **Backend Enhancements**
- ✅ **New API Endpoints**:
  - `/api/generate-text` - Handles text generation with category/difficulty validation
  - Enhanced Socket events for lobby returns and state changes
- ✅ **Room State Management** - Server-authoritative room state with automatic cleanup
- ✅ **Race Timer Management** - Proper cleanup of race timers and data
- ✅ **Player Statistics Reset** - Automatic player stat reset when returning to lobby

#### 🎮 **Frontend Improvements**
- ✅ **Enhanced Game Store** - New event handlers for backend state changes
- ✅ **Automatic Navigation** - Smart navigation when game state changes
- ✅ **TypeScript Improvements** - Fixed compilation errors and improved type safety
- ✅ **Component Compatibility** - Updated lobby components for better prop handling

#### 🔧 **Technical Improvements**
- ✅ **Improved Error Handling** - Better TypeScript error resolution
- ✅ **Component Prop Fixes** - Resolved PlayerGrid and TextGenerationModal prop issues  
- ✅ **Hook Enhancements** - Updated useTextGeneration hook with Railway backend integration
- ✅ **Build Process** - Fixed compilation errors for successful deployment

### 📋 **Previous Updates**

- ✅ **Enhanced UI Visibility** - Improved transparency for login card and player cards in lobby
- ✅ **Avatar Customization** - Added 10 capybara color options with real-time color picker
- ✅ **Better Player Cards** - Increased color opacity for better visibility on the lobby board
- ✅ **Railway Deployment** - Optimized backend deployment configuration
- ✅ **Improved UX** - Better color contrast and visual feedback
- ✅ **Real-time Color Sync** - Avatar colors update instantly across all connected players
- ✅ **Fixed environment variable configuration**
- ✅ **Updated CORS settings for production**
- ✅ **Improved error handling and connection stability**

## 🌟 Key Features Deep Dive

### 🤖 **AI-Powered Text Generation System**
The text generation system provides a dynamic and engaging experience:
- **Railway Backend Integration**: High-performance text generation hosted on Railway
- **Intelligent Content Categories**: Each category uses specialized algorithms for authentic content
- **Difficulty-Based Scaling**: Text length automatically adjusts to provide appropriate challenges
- **Fallback Reliability**: Local text generation ensures functionality even if backend is unavailable

### 🎛️ **Smart Difficulty System**
Enhanced difficulty selection that removes guesswork:
- **Easy Mode**: ~200 characters perfect for beginners and warm-ups
- **Medium Mode**: ~400 characters ideal for intermediate skill building  
- **Hard Mode**: ~800 characters designed for advanced typists and competitive play
- **Category Variety**: Each difficulty level includes content from all categories

### 🎯 **Smart Lobby System**
The lobby system now provides a seamless experience with:
- **Intelligent Room States**: Rooms automatically transition between waiting, playing, and finished states
- **New Player Support**: Rooms only accept new players when in waiting state
- **Real-time Updates**: All players stay synchronized with server state changes
- **Graceful Transitions**: Smooth navigation between game states

### 🏃‍♂️ **Race Completion Logic**
Enhanced race experience featuring:
- **Automatic Detection**: Server monitors all players and ends race when everyone finishes
- **Fair Results**: All players see results simultaneously regardless of finish time
- **Timer Management**: Proper cleanup prevents race state conflicts
- **Instant Feedback**: Results appear immediately when conditions are met

### 🔧 **Server-Authoritative Architecture**
Reliable multiplayer experience through:
- **Single Source of Truth**: Backend maintains authoritative game state
- **Event-Driven Communication**: Efficient Socket.IO event system
- **State Synchronization**: Frontend automatically updates based on server events
- **Error Recovery**: Robust handling of connection issues and state conflicts

---

Made with ❤️ and 🐹 by [Bruno Souza](https://github.com/souzabruno01)


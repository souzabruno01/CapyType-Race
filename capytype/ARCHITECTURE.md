# CapyType Race - System Architecture

## Overview
This document provides a detailed architectural overview of the CapyType Race multiplayer typing game.

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Side (Firebase Hosting)"
        A[React Frontend] --> B[Zustand State Store]
        B --> C[Socket.IO Client]
        A --> D[Game Components]
        A --> E[Lobby Components]
        A --> F[Results Components]
        D --> DA[Reusable Button Component]
        D --> DB[Avatars Utility]
        D --> DC[Framer Motion]
        D --> DD[React Confetti]
        E --> EA[Text Generation Modal]
        EA --> EB[AI Integration]
        EA --> EC[Topic Selection]
        EA --> ED[Character Limit Control]
        
        subgraph "Frontend Features"
            G[Real-time Typing]
            H[Progress Tracking]
            I[Error Detection]
            J[WPM Calculation]
            GA[Asset Preloading]
            GB[Color-coded Feedback]
            GC[Smart Text Truncation]
            GD[Session Storage]
            GE[Auto Reconnection]
            GF[Individual Player Lanes]
        end
        
        subgraph "State Management"
            SM[Zustand Store]
            SS[Session Storage]
            SC[Socket Connection]
            SM --> SS
            SM --> SC
        end
    end
    
    subgraph "Server Side (Railway)"
        K[Express.js Server] --> L[Socket.IO Server]
        L --> M[Room Manager]
        M --> N[Game Logic Engine]
        N --> O[Player Management]
        
        subgraph "Backend Features"
            P[Room Creation/Joining]
            Q[Real-time Sync]
            R[Game State Management]
            S[Results Processing]
            PA[UUID Validation]
            PB[Room Code Simplification]
            PC[Connection Handling]
            PD[Avatar Synchronization]
        end
    end
    
    subgraph "External Services"
        XA[Hugging Face Inference API]
        XA --> EB
    end
    
    subgraph "Real-time Communication Layer"
        C <--> L
        T[WebSocket Connection]
        U[Event Broadcasting]
        V[State Synchronization]
        W[Auto Reconnection Logic]
        T --> W
    end
    
    subgraph "Game Flow States"
        X[Login Screen] --> Y[Room Selection]
        Y --> Z[Lobby Waiting]
        Z --> ZA[Text Generation]
        ZA --> AA[Game Active]
        AA --> BB[Results Display]
        BB --> Y
    end
    
    subgraph "Data Flow"
        CC[User Input] --> DD[Validation]
        DD --> EE[Progress Calculation]
        EE --> FF[State Update]
        FF --> GG[Broadcast to All]
        GG --> HH[UI Update]
        HH --> II[Session Persistence]
    end
    
    style DA fill:#e0e7ff,stroke:#6366f1
    style DB fill:#fef9c3,stroke:#b6a77a
    style DC fill:#f3e8ff,stroke:#a78bfa
    style DD fill:#e0f2fe,stroke:#38bdf8
    style EB fill:#dbeafe,stroke:#3b82f6
    style XA fill:#ede9fe,stroke:#8b5cf6
    style A fill:#e3f2fd
    style K fill:#f3e5f5
    style C fill:#fff8e1
    style L fill:#fff8e1
    style T fill:#e8f5e8
    style SS fill:#f0f9ff
    style GD fill:#f0f9ff
    style W fill:#ecfdf5
```

## Component Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant AI as Hugging Face API
    participant S as Socket.IO
    participant B as Backend
    participant R as Room Manager
    
    U->>F: Enter nickname
    F->>S: Connect to server
    S->>B: Establish connection
    
    U->>F: Create/Join room
    F->>S: Emit room event
    S->>B: Process room request
    B->>R: Manage room state
    R->>B: Return room data
    B->>S: Broadcast room update
    S->>F: Update UI
    
    alt Host generates text
        U->>F: Select topic & character limit
        F->>AI: Generate text with prompt
        AI->>F: Return AI-generated text
        F->>F: Apply smart truncation
        F->>F: Store in session if needed
        U->>F: Start game with generated text
    else Host uses random text
        U->>F: Generate random text
        F->>F: Apply smart truncation
        F->>F: Store in session if needed
        U->>F: Start game with random text
    end
    
    F->>S: Emit start game event
    S->>B: Set game state to active
    B->>R: Update room state
    B->>S: Broadcast game start
    S->>F: Start game for all players
    F->>F: Preload game assets
    
    U->>F: Start typing
    F->>F: Calculate progress & validate
    F->>F: Apply color feedback (green/red/yellow)
    F->>F: Update session storage
    F->>S: Emit progress update
    S->>B: Process progress
    B->>R: Update player state
    B->>S: Broadcast to room
    S->>F: Update all players (individual lanes)
    
    F->>F: Check completion
    F->>S: Emit game finished
    S->>B: Process results
    B->>R: Calculate final standings
    B->>S: Broadcast final results
    S->>F: Show adaptive results screen
```

## Technology Stack Details

```mermaid
graph LR
    subgraph "Frontend Stack"
        A[React 18] --> B[TypeScript]
        B --> C[Vite]
        C --> D[Tailwind CSS]
        D --> E[Framer Motion]
        E --> F[Socket.IO Client]
        F --> G[Zustand]
        G --> H[Reusable Button Component]
        H --> I[Avatars Utility]
        I --> J[React Confetti]
        J --> K[Hugging Face Inference API]
        K --> L[Smart Text Truncation]
        L --> M[Asset Preloading]
        M --> N[Session Storage]
        N --> O[Auto Reconnection]
        O --> P[Individual Player Lanes]
        P --> Q[Color-coded Feedback]
    end
    
    subgraph "Backend Stack"
        R[Node.js] --> S[Express.js]
        S --> T[Socket.IO Server]
        T --> U[TypeScript]
        U --> V[CORS]
        V --> W[dotenv]
        W --> X[UUID Validation]
        X --> Y[Room Management]
        Y --> Z[Connection Handling]
        Z --> AA[Player Synchronization]
    end
    
    subgraph "Development Tools"
        BB[ESLint] --> CC[Prettier]
        CC --> DD[Git]
        DD --> EE[npm/yarn]
        EE --> FF[Hot Module Replacement]
        FF --> GG[TypeScript Compiler]
    end
    
    subgraph "Deployment & CI/CD"
        HH[Firebase Hosting] --> II[Railway]
        II --> JJ[Environment Variables]
        JJ --> KK[Automated Deployment]
        KK --> LL[Health Monitoring]
        LL --> MM[Auto-scaling]
    end
```

## Environment Configuration

```mermaid
graph TB
    subgraph "Development Environment"
        A[Frontend: localhost:5173]
        B[Backend: localhost:3001]
        C[Local .env files]
    end
    
    subgraph "Production Environment"
        D[Frontend: Firebase Hosting]
        E[Backend: Render/Railway]
        F[Production .env variables]
    end
    
    subgraph "Configuration Flow"
        G[Environment Detection] --> H{Environment Type}
        H -->|Development| I[Load local .env]
        H -->|Production| J[Load production .env]
        I --> K[Connect to localhost]
        J --> L[Connect to production URLs]
    end
```

## Key Features Implementation

### Real-time Multiplayer
- WebSocket connections via Socket.IO
- Event-driven architecture
- Room-based player management
- Live progress synchronization

### Game Mechanics
- Character-by-character validation
- Real-time WPM calculation
- Error tracking and correction
- Progress percentage calculation

### State Management
- Zustand for client-side state
- In-memory room management on server
- Persistent connection handling
- Automatic reconnection logic

## Security Considerations

```mermaid
graph LR
    A[CORS Configuration] --> B[Environment Variables]
    B --> C[Input Validation]
    C --> D[Rate Limiting]
    D --> E[Connection Management]
    E --> F[Error Handling]
```

## Performance Optimizations

- **Asset Preloading**: Eliminates game start latency by preloading images and components
- **Individual Player Lanes**: Reduces visual clutter and improves focus during gameplay
- **Efficient State Updates**: Optimized Zustand store with minimal re-renders
- **Debounced Progress Reporting**: Reduces unnecessary network traffic
- **Session Storage**: Persists user preferences across page refreshes
- **Smart Text Truncation**: Ensures text boundaries at sentence/word level
- **Color-coded Real-time Feedback**: Instant visual feedback without performance impact
- **Memory Management**: Automatic cleanup of rooms and connections
- **Connection Pooling**: Efficient WebSocket connection handling
- **Auto Reconnection**: Seamless recovery from network interruptions

## Deployment Architecture

```mermaid
graph TB
    subgraph "Source Control"
        A[GitHub Repository]
    end
    
    subgraph "Frontend Deployment"
        B[Firebase CLI] --> C[Firebase Hosting]
        C --> D[CDN Distribution]
    end
    
    subgraph "Backend Deployment"
        E[Git Integration] --> F[Railway]
        F --> G[Auto-deployment]
        G --> H[Health Monitoring]
    end
    
    A --> B
    A --> E
    
    subgraph "Environment Management"
        I[Development .env]
        J[Production .env]
        K[CI/CD Variables]
    end
    
    subgraph "External API Integration"
        L[Hugging Face Inference API] --> M[Text Generation]
        M --> N[Topic Processing]
        N --> O[Character Limit]
    end
```

## Recent Architectural Improvements (July 2025)

### Session Management
- **Persistent Avatar Selection**: User avatar/color choices are stored in session storage
- **Cross-session Continuity**: Avatar preferences persist across browser refreshes
- **Fallback Handling**: Graceful defaults when session data is unavailable

### Connection Reliability
- **Auto Reconnection Logic**: Automatic retry mechanism for dropped connections
- **Connection State Management**: Comprehensive tracking of socket connection states
- **Error Recovery**: Robust error handling with user-friendly feedback

### Game Performance
- **Asset Preloading Strategy**: Preloads game assets during lobby phase
- **Individual Lane Rendering**: Shows only current player's progress for better focus
- **Real-time Feedback System**: Color-coded typing feedback without performance impact

### State Architecture
- **Enhanced Zustand Store**: Improved state management with session persistence
- **Optimized Re-renders**: Minimal component updates through efficient state design
- **Memory Leak Prevention**: Proper cleanup of event listeners and connections

### Text Generation Pipeline
- **AI Integration**: Seamless integration with Hugging Face Inference API
- **Smart Truncation**: Boundary-aware text cutting at sentence/word boundaries
- **Fallback Mechanisms**: Multiple text sources with intelligent switching

This architecture ensures scalability, maintainability, and real-time performance for the multiplayer typing game experience.


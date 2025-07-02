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
    end
    
    subgraph "Game Flow States"
        W[Login Screen] --> X[Room Selection]
        X --> Y[Lobby Waiting]
        Y --> YA[Text Generation]
        YA --> Z[Game Active]
        Z --> AA[Results Display]
        AA --> X
    end
    
    subgraph "Data Flow"
        BB[User Input] --> CC[Validation]
        CC --> DD[Progress Calculation]
        DD --> EE[State Update]
        EE --> FF[Broadcast to All]
        FF --> GG[UI Update]
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
        U->>F: Start game with generated text
    else Host uses random text
        U->>F: Generate random text
        F->>F: Apply smart truncation
        U->>F: Start game with random text
    end
    
    F->>S: Emit start game event
    S->>B: Set game state to active
    B->>S: Broadcast game start
    S->>F: Start game for all players
    
    U->>F: Start typing
    F->>F: Calculate progress & validate
    F->>F: Apply color feedback
    F->>S: Emit progress update
    S->>B: Process progress
    B->>S: Broadcast to room
    S->>F: Update all players
    
    F->>F: Check completion
    F->>S: Emit game finished
    S->>B: Process results
    B->>S: Broadcast final results
    S->>F: Show results screen
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
    end
    
    subgraph "Backend Stack"
        N[Node.js] --> O[Express.js]
        O --> P[Socket.IO Server]
        P --> Q[TypeScript]
        Q --> R[CORS]
        R --> S[dotenv]
        S --> T[UUID Validation]
    end
    
    subgraph "Development Tools"
        U[ESLint] --> V[Prettier]
        V --> W[Git]
        W --> X[npm/yarn]
    end
    
    subgraph "Deployment"
        Y[Firebase Hosting] --> Z[Railway]
        Z --> AA[Environment Variables]
        AA --> AB[CI/CD Pipeline]
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

- Efficient state updates
- Debounced progress reporting
- Optimized re-renders
- Memory management for rooms
- Connection pooling

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

This architecture ensures scalability, maintainability, and real-time performance for the multiplayer typing game experience.


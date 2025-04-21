# CapyType

A multiplayer typing game where players race against each other to type text as quickly and accurately as possible. The game features a capybara-themed UI and real-time progress tracking.

## Features

- Real-time multiplayer racing
- Capybara-themed UI
- Room-based gameplay
- Practice mode
- Live progress tracking
- WPM calculation
- Error tracking
- Results dashboard

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + Socket.IO
- State Management: Zustand
- Styling: Tailwind CSS
- Animations: Framer Motion

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/capytype.git
cd capytype
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Start the development servers:
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
capytype/
├── backend/           # Backend server code
│   ├── src/
│   │   ├── index.ts  # Main server file
│   │   └── ...
│   └── package.json
│
└── frontend/          # Frontend React application
    ├── src/
    │   ├── pages/    # React components
    │   ├── store/    # State management
    │   └── ...
    └── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
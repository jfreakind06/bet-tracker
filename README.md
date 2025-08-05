# Bet Tracker

A modern sports betting tracker built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- PostgreSQL
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/jfreakind06/bet-tracker.git
cd bet-tracker

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb bet_tracker

# Run migrations (from backend directory)
cd backend
npx knex migrate:latest
```

### 3. Environment Variables
Create `backend/.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/bet_tracker
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=development
PORT=5000
```

### 4. Start Development Servers
```bash
# Terminal 1: Start backend (from backend directory)
cd backend
npm run dev

# Terminal 2: Start frontend (from frontend directory) 
cd frontend
npm run dev
```

Visit `http://localhost:5173` to use the app!

## 📦 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

## 🛠 Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

### Frontend  
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🏗 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript  
- **Database**: PostgreSQL with Knex.js
- **Auth**: JWT tokens
- **Styling**: CSS with design system
- **Deployment**: Netlify (frontend) + Railway/Render (backend)

## 📱 Features

- User authentication (register/login)
- Add and track bets
- Update bet results (win/loss/push)
- Real-time ROI calculations
- Mobile-responsive design
- Analytics dashboard
- Bankroll management

## 🔧 Development

The app uses a mobile-first design approach with a comprehensive design system located in `frontend/src/styles/design-system.css`.

### Project Structure
```
bet-tracker/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── migrations/
├── frontend/          # React application  
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── public/
└── DEPLOYMENT.md     # Production deployment guide
```
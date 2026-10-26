# ✈️ IntelliTrip – AI-Powered Smart Tourism & Travel Management System

[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Python%20FastAPI-blue.svg)](https://github.com)
[![Generative AI](https://img.shields.io/badge/Generative%20AI-Google%20Gemini%201.5-orange.svg)](https://deepmind.google/technologies/gemini/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--learn%20%2B%20Pandas%20%2B%20NumPy-green.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**IntelliTrip** is an end-to-end, enterprise-grade Smart Tourism and Travel Management platform built to revolutionize how tourists plan, book, experience, and personalize their journeys while empowering tourism businesses and government departments with predictive analytics and emergency safety systems.

---

## 🏗️ System Architecture

```
                      +----------------------------------+
                      |       React.js + Vite Frontend   |
                      |        (Port 5173 / Vercel)      |
                      +----------------------------------+
                                       |
                                       | (HTTP REST / Axios)
                                       v
                      +----------------------------------+
                      |      Node.js + Express Backend   |
                      |         (Port 5000 / Render)     |
                      +----------------------------------+
                         /             |             \
                        /              |              \
                       v               v               v
            +------------------+ +-----------+ +------------------------+
            |  MongoDB Atlas   | | Google    | | Python FastAPI ML      |
            |   (Database)     | | Gemini    | | Microservice           |
            |                  | | API (LLM) | | (Port 8000 / Render)   |
            +------------------+ +-----------+ +------------------------+
                                                    | (Scikit-learn,
                                                    |  Pandas, NumPy)
                                                    v
                                               Predictive Models
```

---

## ✨ Features by Development Phase

### 🌐 Phase 1 — Foundation & Authentication
- **Multi-Role JWT Authentication**: Secure user registration, password hashing (`bcryptjs`), and token verification.
- **10 Fine-Grained User Roles**:
  - `Tourist`, `Tour Guide`, `Hotel Owner`, `Travel Agency`, `Transport Provider`, `Local Business Owner`, `Tourism Department Admin`, `Support Executive`, `Super Admin`.
- **Role-Based Authorization Middleware**: Enforces strict route permissions across all REST APIs.

### 🏨 Phase 2 — Core Tourism Catalog & Services
- **Full CRUD & Catalog Search**: Destinations, Hotels, Rooms, Restaurants, Guided Experiences, and Transport Fleet.
- **Booking & Reservations**: Instant booking pipeline for stays, transit, and activities with real-time status management.
- **Reviews & Ratings**: User feedback system with star ratings and sentiment extraction.
- **Wishlist & Saved Places**: Save favorite destinations and hotels to personal collections.

### 🧠 Phase 3 — Generative AI Intelligence (Google Gemini 1.5)
- **AI Travel Assistant**: Natural language conversational assistant grounded in real database context.
- **AI Day-by-Day Trip Planner**: Generates structured itineraries (day plans, estimated expenses, activities) stored directly in MongoDB.
- **Travel DNA Profile**: Multi-axis taste vector (Adventure, Nature, Culture, Food, Luxury) matching user preferences.
- **Explainable Recommendations Engine**: Real-time scoring of destinations, stays, and activities against user Travel DNA.
- **AI Dynamic Budget Guardian**: Calculates per-day budget breakdowns and savings tips.

### 🤖 Phase 4 — Advanced Python Machine Learning Microservice
- **Review Sentiment Classifier (`Scikit-learn`)**: NLP Sentiment Analysis using `CountVectorizer` + `LogisticRegression` evaluating review polarity, confidence, and keyword extraction.
- **Crowd Density Predictor (`DecisionTreeRegressor`)**: Estimates site crowd density levels (Low, Medium, High) and low-density visit time windows. *(Labeled as Estimate)*.
- **Tourism Demand Forecaster (`LinearRegression` + Seasonal Indexing)**: Predicts seasonal visitor growth and target month demand indices. *(Labeled as Estimate)*.
- **Group Travel Intelligence (Vector Mean Aggregation)**: Synthesizes multi-traveler preference arrays into unified consensus vectors and satisfaction indices.
- **Hidden Gem Discovery Engine (`Pandas DataFrame Filtering`)**: Recommends under-the-radar destinations matching cost and category criteria.
- **Sustainability & Eco-Impact Scorer**: Computes CO2 emissions and eco-sustainability ratings based on transit mode and distance.

### 🌍 Phase 5 — Complete Tourism Ecosystem & Governance
- **Global Travel Community**: Interactive forum for tourists to publish tips, photos, and stories with like/comment interactions.
- **24x7 Emergency SOS Assistant**: One-click panic alert dispatch to local police, medical units, and support executives, featuring live emergency helpline numbers (112, 100, 102, 1363).
- **Offline Trip & Exporter**: Client-side `localStorage` caching and JSON itinerary downloader for connection-free travel.
- **Gamification & Loyalty Rewards**: Points earning system, tier badges (Bronze, Silver, Gold, Platinum), and redeemable voucher catalog.
- **Enterprise Role Dashboards**: Role-tailored dashboards for Tour Guides, Hotel Owners, Agencies, Transport Providers, Local Businesses, Support Executives, and Tourism Dept Admins.
- **Advanced Tourism Analytics**: Visual metrics for visitor flow, gross platform revenue, eco-impact savings, and stakeholder distribution.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React.js, Vite, React Router v6, Axios, Lucide React Icons, Vanilla CSS Design Tokens |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, CORS, Dotenv |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Generative AI** | Google Gemini API (`@google/generative-ai`) |
| **Machine Learning Service** | Python 3, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn |

---

## 📁 Folder Structure

```
IntelliTrip/
├── frontend/                   # React.js Single Page Application
│   ├── src/
│   │   ├── components/         # Common UI components (Navbar, Footer, Loader, ProtectedRoute)
│   │   ├── context/            # AuthContext & NotificationContext
│   │   ├── pages/              # Role, Tourism, AI, Community, & Emergency pages
│   │   ├── services/           # Axios API modules (api, aiService, communityService, etc.)
│   │   ├── App.jsx             # Main Application Entry
│   │   └── routes.jsx          # Centralized React Router Configuration
│   └── package.json
│
├── backend/                    # Node.js Express REST API Server
│   ├── config/                 # DB Connection & Env Configuration
│   ├── controllers/            # Controller logic for all 14 REST modules
│   ├── middleware/             # Auth & Error handling middleware
│   ├── models/                 # Mongoose Data Models (User, Booking, Itinerary, etc.)
│   ├── routes/                 # Express API Route Definition files
│   ├── services/               # Gemini Service & Python AI Proxy Service
│   ├── server.js               # Express Server Initialization
│   └── package.json
│
├── ai-service/                 # Python FastAPI ML Microservice
│   ├── app.py                  # FastAPI application & Scikit-learn ML models
│   ├── requirements.txt        # Python dependency manifest
│   └── .env.example
│
├── database/                   # Seed Scripts & DB Indexes
├── docs/                       # Project Documentation & Architecture Diagrams
├── README.md                   # Project Documentation
└── project-spec.md             # Complete Technical Specification
```

---

## 🔑 Environment Variables

### `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/intellitrip
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
PYTHON_SERVICE_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### `ai-service/.env`
```env
PORT=8000
HOST=127.0.0.1
```

---

## ⚡ Installation & Setup Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

### 2. Backend Setup
```powershell
cd d:\IntelliTrip\backend
npm install
```

### 3. AI Service Setup
```powershell
cd d:\IntelliTrip\ai-service
python -m pip install -r requirements.txt
```

### 4. Frontend Setup
```powershell
cd d:\IntelliTrip\frontend
npm install
```

---

## 🚀 Running Instructions

Launch each service in a separate terminal window:

#### Terminal 1 — Python FastAPI ML Microservice
```powershell
cd d:\IntelliTrip\ai-service
python -m uvicorn app:app --reload --port 8000
```

#### Terminal 2 — Node.js Express Backend
```powershell
cd d:\IntelliTrip\backend
npm run dev
```

#### Terminal 3 — React Frontend (Vite)
```powershell
cd d:\IntelliTrip\frontend
npm run dev
```

Open your browser at `http://localhost:5173` to explore IntelliTrip!

---

## 📡 API Endpoint Overview

| Module | Method | Endpoint | Access |
| --- | --- | --- | --- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public |
| **Auth** | `POST` | `/api/v1/auth/login` | Public |
| **Auth** | `GET` | `/api/v1/auth/me` | Private |
| **Destinations** | `GET` | `/api/v1/destinations` | Public |
| **Hotels** | `GET` | `/api/v1/hotels` | Public |
| **Bookings** | `POST` | `/api/v1/bookings` | Private |
| **Gemini AI** | `POST` | `/api/v1/ai/assistant` | Public / Private |
| **Gemini AI** | `POST` | `/api/v1/ai/generate-itinerary` | Private |
| **Python ML** | `POST` | `/api/v1/ai/sentiment` | Public / Private |
| **Python ML** | `POST` | `/api/v1/ai/predict-crowd` | Public / Private |
| **Python ML** | `POST` | `/api/v1/ai/forecast-demand` | Public / Private |
| **Community** | `GET` / `POST` | `/api/v1/community/posts` | Public / Private |
| **Emergency** | `POST` | `/api/v1/emergency/sos` | Private |
| **Loyalty** | `GET` | `/api/v1/loyalty/profile` | Private |
| **Analytics** | `GET` | `/api/v1/analytics/overview` | Admin / Vendors |

---

## 🧪 Testing Instructions

Execute the automated test suites in the `backend/` directory:

```powershell
# Run Phase 4 Machine Learning Integration Suite
cd d:\IntelliTrip\backend
node test_phase4_suite.js

# Run Phase 5 Complete Ecosystem & System Audit Suite
node test_phase5_suite.js

# Test Frontend Production Build
cd d:\IntelliTrip\frontend
npm run build
```

---

## 📄 License
This project is developed as a Major BCA Capstone Project and is licensed under the MIT License.

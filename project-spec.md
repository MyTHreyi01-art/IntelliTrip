# IntelliTrip — AI-Powered Smart Tourism & Travel Management System
## project-spec.md — Single Source of Truth for Antigravity Agent

---

## 1. Overview

IntelliTrip is an AI-powered smart tourism and travel management web app. It gives tourists a unified platform for destination discovery, personalized recommendations, AI itinerary generation, hotel booking, transportation, food recommendations, local experiences, trip budgeting, reviews, travel assistance, dynamic itinerary replanning, and tourism analytics — plus separate dashboards for tourism businesses, guides, agencies, and admins.

Built as a **MERN stack** application with a **separate Python AI/ML service** added in later phases.

---

## 2. Tech Stack

**Frontend:** React.js, Vite, JavaScript, React Router, Axios, CSS, responsive design

**Backend:** Node.js, Express.js, REST API, JWT authentication, bcrypt, Mongoose

**Database:** MongoDB Atlas, Mongoose ODM

**Generative AI:** Google Gemini API — AI Travel Assistant, AI itinerary generation, natural language travel queries, dynamic itinerary suggestions. **Gemini key must never be exposed to the frontend** — all calls go through the Node backend.

**Machine Learning (added in later phases):** Python, FastAPI, Pandas, NumPy, Scikit-learn, NLP libraries. Powers: recommendation system, sentiment analysis, crowd prediction, tourism demand forecasting.

---

## 3. Architecture

- **frontend/** (React + Vite) — UI, navigation, forms, dashboards, API calls, displaying recommendations/itineraries.
- **backend/** (Node + Express) — auth, authorization, business logic, REST APIs, DB ops, booking management, talks to Gemini and to the Python AI service.
- **ai-service/** (Python + FastAPI) — ML models, recommendation algorithms, sentiment analysis, prediction, data processing.

---

## 4. Project Structure

```
IntelliTrip/
├── frontend/                    # React + Vite
│   ├── public/{images,icons,favicon.ico}
│   └── src/
│       ├── assets/{images,icons,fonts}
│       ├── components/
│       │   ├── common/ (Navbar, Footer, Sidebar, Loader, Modal, ProtectedRoute)
│       │   ├── destination/ (DestinationCard, DestinationSearch, DestinationFilter)
│       │   ├── itinerary/ (ItineraryCard, DayPlan, ItineraryTimeline)
│       │   ├── hotel/ (HotelCard, HotelSearch, HotelBooking)
│       │   ├── booking/ (BookingCard, BookingSummary, Payment)
│       │   ├── ai/ (AIChat, RecommendationCard, TripGenerator, TripReplanner)
│       │   └── dashboard/ (StatsCard, Charts, RecentBookings)
│       ├── pages/
│       │   ├── auth/ (Login, Register, ForgotPassword)
│       │   ├── tourist/ (TouristDashboard, Profile, TravelDNA, MyTrips, Wishlist, Budget, Bookings, TravelCommunity, Emergency)
│       │   ├── destinations/ (Destinations, DestinationDetails, HiddenGems)
│       │   ├── itinerary/ (AITripPlanner, TripLaboratory, TripDetails, Replanner)
│       │   ├── hotels/ (Hotels, HotelDetails, HotelBooking)
│       │   ├── experiences/ (Experiences, ExperienceDetails, ExperienceBooking)
│       │   ├── transport/ (Transport, TransportBooking)
│       │   ├── food/ (Restaurants, FoodRecommendations)
│       │   ├── bookings/ (AllBookings, BookingDetails, PaymentSuccess)
│       │   ├── community/ (Community, CreatePost, PostDetails)
│       │   ├── business/ (BusinessDashboard, BusinessProfile, ManageListings, BusinessAnalytics)
│       │   ├── guide/ (GuideDashboard, ManageTours, GuideBookings)
│       │   ├── agency/ (AgencyDashboard, Packages, AgencyBookings)
│       │   ├── admin/ (AdminDashboard, ManageUsers, ManageDestinations, ManageBookings, TourismAnalytics, Reports)
│       │   └── Home.jsx
│       ├── services/ (api.js, authService.js, destinationService.js, itineraryService.js, bookingService.js, hotelService.js, experienceService.js, transportService.js, weatherService.js, aiService.js)
│       ├── context/ (AuthContext, TripContext, NotificationContext)
│       ├── hooks/ (useAuth, useFetch, useLocation)
│       ├── utils/ (validators.js, formatCurrency.js, helpers.js)
│       ├── styles/ (global.css, variables.css)
│       ├── App.jsx, main.jsx, routes.jsx
│
├── backend/                     # Node + Express
│   ├── config/ (db.js, env.js, cloudinary.js)
│   ├── controllers/ (authController, userController, destinationController, itineraryController, bookingController, hotelController, experienceController, transportController, restaurantController, reviewController, communityController, paymentController, notificationController, adminController)
│   ├── models/ (User, Destination, Hotel, Room, Booking, Itinerary, Experience, Guide, Transport, Restaurant, Review, Expense, Wishlist, TravelDNA, CommunityPost, Notification, Payment)
│   ├── routes/ (authRoutes, userRoutes, destinationRoutes, itineraryRoutes, bookingRoutes, hotelRoutes, experienceRoutes, transportRoutes, restaurantRoutes, reviewRoutes, communityRoutes, paymentRoutes, adminRoutes)
│   ├── middleware/ (authMiddleware, roleMiddleware, errorMiddleware, uploadMiddleware, validationMiddleware)
│   ├── services/ (aiService, recommendationService, itineraryService, weatherService, mapService, translationService, paymentService, notificationService)
│   ├── utils/ (generateToken.js, email.js, logger.js, helpers.js)
│   ├── uploads/
│   ├── seed/ (users.js, destinations.js, hotels.js, experiences.js)
│   ├── server.js, package.json, .env
│
├── ai-service/                  # Python + FastAPI (later phases)
│   ├── models/ (recommendation_model.pkl, sentiment_model.pkl, crowd_prediction.pkl)
│   ├── datasets/ (destinations.csv, reviews.csv, tourism_data.csv, user_preferences.csv)
│   ├── recommendation/ (recommender.py, similarity.py)
│   ├── sentiment/ (sentiment_analysis.py)
│   ├── prediction/ (crowd_prediction.py, tourism_forecasting.py)
│   ├── itinerary/ (itinerary_generator.py, route_optimizer.py)
│   ├── preprocessing/ (clean_data.py, feature_engineering.py)
│   ├── app.py, requirements.txt, .env
│
├── database/{schema,seed,README.md}
├── docs/{synopsis,SRS,diagrams/{use-case,class,sequence,activity,architecture},screenshots}
├── .gitignore
├── README.md
└── package.json
```

---

## 5. User Roles (role-based authorization required)

1. Tourist
2. Tour Guide
3. Hotel Owner
4. Travel Agency
5. Transport Provider
6. Local Business Owner
7. Tourism Department Admin
8. Support Executive
9. Super Admin

Each role has a distinct dashboard and permission set, enforced via `roleMiddleware.js`.

---

## 6. Database Collections (MongoDB, Mongoose schemas)

`users`, `destinations`, `hotels`, `rooms`, `bookings`, `transport`, `restaurants`, `activities`, `experiences`, `guides`, `reviews`, `expenses`, `wishlists`, `itineraries`, `travelDNA`, `communityPosts`, `notifications`, `payments`, `events`

---

## 7. Environment Variables

**backend/.env**
```
PORT=
MONGODB_URI=
GEMINI_API_KEY=
JWT_SECRET=
FRONTEND_URL=
```

**frontend/.env**
```
VITE_API_URL=
```

Never commit `.env` files. Never place `GEMINI_API_KEY` in the frontend. No hard-coded API keys, DB credentials, passwords, or JWT secrets anywhere in code.

---

## 8. Feature Scope & Implementation Tiers

Given the scope, each feature below is tagged so the agent (and you) know how deep to build it:

- 🟢 **Fully implement** — real, working, production-style logic
- 🟡 **AI/ML prototype** — working model/demo on realistic sample data
- 🔵 **API-powered** — wraps an external API (weather, maps, geolocation, translation)
- 🟠 **Simulation** — dataset/model built specifically to demonstrate the concept
- 🔴 **Future/advanced** — out of scope for this build; documented only

### Core (🟢 Fully implement)
- Auth: register/login/logout/reset password, JWT + bcrypt, role-based authorization
- Tourist dashboard: upcoming/previous trips, recommended destinations/hotels, budget summary, recent bookings, alerts
- Destination module: search/browse/filter/details/attractions/activities/costs/reviews/save (tourist); add/edit/delete (admin)
- Hotel module: search/filter/details/rooms/prices/availability/booking/review (tourist); register hotel/manage rooms/prices/bookings (owner)
- Transportation module: taxi/bus/car rental/bike rental, price/availability/est. time
- Restaurant & food module: search/filter by cuisine & price/ratings/reviews
- Local Experience Marketplace: businesses/guides create experiences; tourists discover/book/review
- Unified Booking module: hotel/transport/activity/experience bookings, view/cancel/history
- Review module: ratings, write/edit/delete, average rating, review list
- Wishlist: save destinations/hotels/activities/restaurants/experiences
- Business dashboards (hotel owner, agency, guide, transport, local business): bookings, revenue, reviews, customers, popular services, basic analytics
- Tourism Department dashboard: aggregated tourist volume, destination popularity, booking trends, satisfaction, crowd estimates, demand forecasts, business activity — no unnecessary personal tourist data exposed
- Super Admin: manage users, roles, destinations, hotels, restaurants, transport, activities, experiences, bookings, reviews, reports

### AI-Powered (🟡 prototype using Gemini + simple content-based logic first; Python service later)
- AI Travel Assistant (Gemini, natural language queries)
- AI Trip Planner (destination, days, budget, travelers, interests → day-wise itinerary, attractions, food, estimated expenses)
- Travel DNA (preference-based scoring across categories: Adventure, Nature, Culture, Food, Relaxation, Luxury, Budget, Photography — displayed visually)
- AI Recommendation System (content-based initially: destinations, hotels, restaurants, activities, experiences — based on preferences, budget, bookings, wishlist, reviews)
- AI Budget Planner (estimate accommodation/food/transport/activities/misc, warn if over budget)
- Explainable Recommendations ("why this hotel" — match %, budget delta, distance, similarity to past likes)

### Advanced AI (🟠 simulation / 🟡 prototype — later phases)
- Review Sentiment Analysis (Python service: positive/neutral/negative)
- Dynamic Trip Replanning (detect weather/unavailability/conflicts → propose alternative, user must confirm)
- Crowd Prediction (low/med/high, labelled as estimates)
- Tourism Demand Forecasting (season/month/holidays/events/history → estimated future demand)
- Group Travel Intelligence (compare multiple users' preferences → common ground → balanced itinerary, satisfaction score)
- Hidden Gem Discovery (less-crowded destinations by interest/distance/rating/crowd)
- Sustainability Intelligence (transport/route comparison → approximate sustainability score)
- Trip Laboratory (generate cheapest/comfortable/luxury/adventure/sustainable versions of a trip; combine elements)
- AI What-If Simulator (recalculate trip on budget/day changes)
- Dynamic Budget Guardian (live spending tracking + predicted final spend + savings suggestions)

### Supporting / Platform (mixed tiers)
- 🔵 Weather Intelligence (current/forecast/rain prediction/clothing suggestions)
- 🟠 Travel Risk Analysis & Travel Safety Score (source + timestamp shown)
- 🔵 AI Place Identification (photo upload → landmark type, via vision API)
- 🔴 Time Machine Tourism (historical AR reconstruction) — document only, don't build
- 🟢 Travel Community (posts, photos, comments, likes, report content)
- 🟢 Emergency Assistant (location, nearby hospitals/police, emergency contacts)
- 🟡 Offline Trip (cache itinerary/bookings/contacts client-side for offline access)
- 🟢 Loyalty System (points from bookings/reviews/experiences/sustainable travel → rewards/discounts)
- 🔴 Smart Travel Companion Matching, Voice Assistant, AI Translator, Travel Memory AI, QR e-tickets, Digital Wallet — later/advanced, document only for now

---

## 9. Development Phases

Build and verify **one phase at a time**. Do not start a later phase early.

### Phase 1 — Foundation
- React + Vite frontend scaffold
- Node + Express backend scaffold
- MongoDB connection (Mongoose)
- JWT authentication (register/login/logout, bcrypt password hashing)
- User model with role field
- Role-based authorization middleware
- Tourist dashboard (basic, dummy/placeholder data)
- Admin dashboard (basic)
- Basic navigation/routing

### Phase 2 — Core Tourism
Destinations, Hotels, Rooms, Restaurants, Transport, Activities, Bookings, Reviews, Wishlist, Local Experiences — full CRUD + UI, connected to real MongoDB data.

### Phase 3 — AI Intelligence
Gemini AI Travel Assistant, AI Trip Planner, Travel DNA, Recommendation System, AI Budget Planner, Review Sentiment Analysis (stub/simple version; full sentiment via Python service later).

### Phase 4 — Advanced AI
Dynamic itinerary replanning, Crowd prediction, Tourism demand forecasting, Group travel intelligence, Hidden gem recommendations, Sustainability intelligence.

### Phase 5 — Complete Ecosystem
Travel community, Emergency assistant, Offline trip, Loyalty system, Business dashboards (all roles), Tourism department dashboard, advanced analytics, final integration.

---

## 10. Development Rules

- Build and verify one phase at a time; do not implement later phases early.
- Before modifying an existing file: inspect current implementation, reuse existing components/services, don't duplicate functionality, don't delete working functionality, explain significant architectural changes.
- Every generated file must have its exact path identified.
- No hard-coded API keys, DB credentials, passwords, or JWT secrets — use environment variables.

## 11. Testing (after every phase)
Start frontend, start backend, test APIs, test DB operations, test authentication, test role permissions, test UI, fix errors, verify existing functionality still works. Do not continue to next phase until current phase works.

## 12. Git
`git init` once. After each completed phase:
```
git add -A
git commit -m "Phase 1 completed"
```
Commit before trying anything risky.

## 13. Deployment

Vercel alone cannot host this app end-to-end — it's built for static frontends and short-lived serverless functions, not a long-running Express server or a Python ML service. So deployment is split:

| Piece | Where | Why |
| --- | --- | --- |
| **frontend/** (React + Vite build) | **Vercel** | Static build, Vercel's core use case |
| **backend/** (Node + Express) | **Render** (or Railway) | Needs to run as a persistent server, not a serverless function |
| **ai-service/** (Python + FastAPI) | **Render** (or Railway), separate service | Same reason — persistent process, own dependencies |

### Environment variables at deploy time
- **Vercel (frontend):** `VITE_API_URL` = your deployed backend URL (e.g. `https://intellitrip-backend.onrender.com`)
- **Render (backend):** `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL` (your deployed Vercel URL), `PORT`
- **Render (ai-service):** whatever `ai-service/.env` needs, plus the backend's URL if it calls back

### CORS
`backend/server.js` must allow requests from the deployed `FRONTEND_URL`, not just `localhost`, once both are live.

### Deployment steps (do this after each relevant phase is verified working, not before)
1. Push the repo to GitHub (see Git section).
2. Deploy `backend/` to Render as a Web Service (connect the GitHub repo, set root directory to `backend`, add env vars above).
3. Deploy `ai-service/` to Render the same way once Phase 3+ needs it (root directory `ai-service`).
4. Deploy `frontend/` to Vercel (connect the GitHub repo, set root directory to `frontend`, add `VITE_API_URL` pointing at the live Render backend URL).
5. Update `FRONTEND_URL` on Render to the live Vercel URL, and redeploy the backend so CORS allows it.
6. Verify the live app end-to-end: register, login, and confirm the frontend talks to the live backend and database.

## 14. Final Goal
Full-stack, modular, responsive, AI-powered, secure, role-based, scalable, database-driven MERN application suitable as a major BCA project — built progressively using this spec as the single source of truth.
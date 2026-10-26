import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { TripProvider } from './context/TripContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AIChatWidget from './components/ai/AIChatWidget';
import AppRoutes from './routes';
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <TripProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <AppRoutes />
              </main>
              <AIChatWidget />
              <Footer />
            </div>
          </TripProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

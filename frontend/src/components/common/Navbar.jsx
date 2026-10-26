import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  User,
  Heart,
  Menu,
  X,
  Sparkles,
  Award,
  Calendar,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  UserPlus,
  Home as HomeIcon
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'Super Admin' || user.role === 'Tourism Department Admin') {
      return '/admin/dashboard';
    }
    if (user.role === 'Tourist') {
      return '/tourist/dashboard';
    }
    return '/vendor/dashboard';
  };

  const navLinks = [
    { label: 'Bespoke Journeys', path: '/destinations' },
    { label: 'Luxury Stays', path: '/hotels' },
    { label: 'Signature Experiences', path: '/experiences' },
    { label: 'Gourmet Dining', path: '/restaurants' },
    { label: 'Private Aviation & Cabs', path: '/transport' },
    { label: 'AI Concierge', path: '/ai-planner' },
    { label: 'Offers & Rewards', path: '/loyalty' }
  ];

  return (
    <header style={styles.header}>
      <nav style={styles.navContainer}>
        {/* Left Side: Hamburger & Distinct Brand Logo */}
        <div style={styles.leftGroup}>
          <button
            style={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} color="#d4af37" /> : <Menu size={22} color="#d4af37" />}
          </button>

          {/* BRAND LOGO — Ultra-prominent with luxury gold crest and generous separation */}
          <Link to="/" style={styles.brand}>
            <div style={styles.brandLogoIcon}>
              <Compass size={22} color="#150917" strokeWidth={2.4} />
            </div>
            <div style={styles.brandTextWrap}>
              <span style={styles.brandText}>INTELLITRIP</span>
              <span style={styles.brandTagline}>BESPOKE LUXURY</span>
            </div>
          </Link>
        </div>

        {/* Center: Luxury Nav Links with Clear Spacing and Distinct Home Button */}
        <div style={styles.centerNav}>
          <Link
            to="/"
            style={{
              ...styles.homeNavLink,
              ...(location.pathname === '/' ? styles.homeNavLinkActive : {})
            }}
          >
            <HomeIcon size={14} color={location.pathname === '/' ? '#150917' : '#d4af37'} />
            <span>Home</span>
          </Link>

          <div style={styles.navSeparator}></div>

          {navLinks.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {})
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side: User Profile & Saved Trips */}
        <div style={styles.rightGroup}>
          <Link to="/tourist/wishlist" style={styles.savedTripsBtn}>
            <Heart size={16} color="#d4af37" />
            <span>Saved Trips</span>
          </Link>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={styles.userBtn}
              >
                <div style={styles.userAvatar}>
                  <User size={15} color="#150917" />
                </div>
                <span style={styles.userName}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} color="#d4af37" />
              </button>

              {userDropdownOpen && (
                <div style={styles.userDropdown} onClick={() => setUserDropdownOpen(false)}>
                  <Link to={getDashboardRoute()} style={styles.dropdownItem}>
                    <LayoutDashboard size={15} color="#d4af37" /> Dashboard
                  </Link>

                  {/* Regular Tourist user options (hidden for Super Admin & Admins) */}
                  {user.role !== 'Super Admin' && user.role !== 'Tourism Department Admin' && (
                    <>
                      <Link to="/tourist/bookings" style={styles.dropdownItem}>
                        <Calendar size={15} color="#d4af37" /> My Itineraries
                      </Link>
                      <Link to="/loyalty" style={styles.dropdownItem}>
                        <Award size={15} color="#d4af37" /> Elite Status
                      </Link>
                      <Link to="/travel-dna" style={styles.dropdownItem}>
                        <Sparkles size={15} color="#d4af37" /> Travel DNA
                      </Link>
                    </>
                  )}

                  <div style={styles.dropdownDivider}></div>
                  <button onClick={handleLogout} style={styles.dropdownLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/login" className="btn btn-gold" style={styles.signInOnlyBtn}>
                <User size={15} />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={styles.mobileDrawer}>
          <Link to="/" style={styles.mobileDrawerLink} onClick={() => setMobileMenuOpen(false)}>
            <HomeIcon size={16} color="#d4af37" style={{ marginRight: 8 }} /> Home
          </Link>
          {navLinks.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              style={styles.mobileDrawerLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/emergency"
            style={{ ...styles.mobileDrawerLink, color: '#f43f5e' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Emergency Assistance
          </Link>
          <div style={styles.mobileDivider}></div>
          {user ? (
            <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
              <LogOut size={16} /> Sign Out ({user.name})
            </button>
          ) : (
            <div style={{ marginTop: '10px' }}>
              <Link to="/login" className="btn btn-gold" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.45rem', padding: '0.75rem' }} onClick={() => setMobileMenuOpen(false)}>
                <User size={16} /> Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1100,
    background: 'rgba(18, 7, 21, 0.98)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.35)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.7)'
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 2.5rem',
    maxWidth: '1700px',
    margin: '0 auto',
    gap: '2rem'
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexShrink: 0
  },
  hamburgerBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    textDecoration: 'none',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    transition: 'transform 0.2s ease'
  },
  brandLogoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fce8a2 0%, #d4af37 50%, #8c6a1d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(212, 175, 55, 0.6)',
    border: '1.5px solid rgba(255, 255, 255, 0.4)'
  },
  brandTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1
  },
  brandText: {
    fontSize: '1.45rem',
    fontWeight: '900',
    fontFamily: 'var(--font-heading)',
    color: '#f7e7be',
    letterSpacing: '2.2px',
    textShadow: '0 2px 10px rgba(212, 175, 55, 0.4)'
  },
  brandTagline: {
    fontSize: '0.58rem',
    fontWeight: '700',
    color: '#d4af37',
    letterSpacing: '3px',
    marginTop: '3px'
  },
  centerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    flex: 1,
    justifyContent: 'flex-start',
    padding: '0 1rem',
    overflowX: 'auto',
    scrollbarWidth: 'none'
  },
  homeNavLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontSize: '0.86rem',
    fontWeight: '700',
    letterSpacing: '0.8px',
    textDecoration: 'none',
    padding: '0.4rem 0.95rem',
    borderRadius: '20px',
    background: 'rgba(40, 16, 46, 0.8)',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    color: '#f7e7be',
    transition: 'all 0.25s ease',
    whiteSpace: 'nowrap'
  },
  homeNavLinkActive: {
    background: 'linear-gradient(135deg, #f7e7be 0%, #d4af37 100%)',
    color: '#150917',
    fontWeight: '800',
    borderColor: '#f7e7be',
    boxShadow: '0 0 14px rgba(212, 175, 55, 0.5)'
  },
  navSeparator: {
    width: '1px',
    height: '20px',
    background: 'rgba(212, 175, 55, 0.3)',
    margin: '0 0.25rem',
    flexShrink: 0
  },
  navLink: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#ebdceb',
    letterSpacing: '0.5px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    padding: '0.35rem 0.2rem',
    position: 'relative'
  },
  navLinkActive: {
    color: '#d4af37',
    borderBottom: '2px solid #d4af37',
    fontWeight: '800',
    textShadow: '0 0 8px rgba(212, 175, 55, 0.4)'
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    flexShrink: 0
  },
  savedTripsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#f7e7be',
    textDecoration: 'none',
    letterSpacing: '0.5px'
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(56, 20, 63, 0.5)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    padding: '0.45rem 0.9rem',
    borderRadius: '4px',
    color: '#f7e7be',
    fontSize: '0.82rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  signInOnlyBtn: {
    padding: '0.45rem 1.15rem',
    fontSize: '0.82rem',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    textDecoration: 'none',
    fontWeight: '700'
  },
  userAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--color-gold-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: {
    color: '#f7e7be'
  },
  userDropdown: {
    position: 'absolute',
    top: '120%',
    right: 0,
    width: '220px',
    background: '#1b0c1e',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
    borderRadius: '4px',
    padding: '0.5rem 0',
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.65rem 1.25rem',
    fontSize: '0.85rem',
    color: '#e2d5e6',
    textDecoration: 'none',
    transition: 'background 0.2s'
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(212, 175, 55, 0.2)',
    margin: '0.4rem 0'
  },
  dropdownLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.65rem 1.25rem',
    fontSize: '0.85rem',
    color: '#f43f5e',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer'
  },
  mobileDrawer: {
    background: '#150917',
    borderTop: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '1.25rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  mobileDrawerLink: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#f7e7be',
    textDecoration: 'none'
  },
  mobileDivider: {
    height: '1px',
    background: 'rgba(212, 175, 55, 0.15)',
    margin: '0.5rem 0'
  },
  mobileLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    color: '#f43f5e',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer'
  }
};

export default Navbar;

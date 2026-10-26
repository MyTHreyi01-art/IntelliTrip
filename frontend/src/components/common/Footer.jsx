import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Crown, Sparkles, MapPin, Building2, PhoneCall, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        <div style={styles.grid}>
          {/* Brand & Ethos */}
          <div style={styles.colMain}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <Compass size={22} color="#150917" strokeWidth={2.2} />
              </div>
              <span style={styles.logoText}>IntelliTrip</span>
            </div>
            <p style={styles.desc}>
              Curated Opulence. Intelligently Designed. Experience the world beyond ordinary through bespoke private itineraries, royal palace suites, private aviation, and Michelin-starred dining.
            </p>
            <div style={styles.conciergeContact}>
              <div style={styles.contactItem}>
                <PhoneCall size={14} color="#d4af37" />
                <span>VIP Concierge: +91 1800 890 0000</span>
              </div>
              <div style={styles.contactItem}>
                <Mail size={14} color="#d4af37" />
                <span>concierge@intellitrip.com</span>
              </div>
            </div>
          </div>

          {/* Bespoke Collections */}
          <div style={styles.col}>
            <h4 style={styles.title}>Bespoke Journeys</h4>
            <ul style={styles.list}>
              <li><Link to="/destinations?search=Udaipur" style={styles.link}>Royal Rajasthan Palaces</Link></li>
              <li><Link to="/destinations?search=Manali" style={styles.link}>Alpine Himalayan Retreats</Link></li>
              <li><Link to="/destinations?search=Andaman" style={styles.link}>Private Island Escapes</Link></li>
              <li><Link to="/destinations?search=Alleppey" style={styles.link}>Kerala Backwater Charters</Link></li>
              <li><Link to="/destinations?search=Leh" style={styles.link}>Ladakh High Pass Expeditions</Link></li>
              <li><Link to="/destinations?search=Jim+Corbett" style={styles.link}>Tiger Safari Sanctuaries</Link></li>
            </ul>
          </div>

          {/* Luxury Services */}
          <div style={styles.col}>
            <h4 style={styles.title}>Private Services</h4>
            <ul style={styles.list}>
              <li><Link to="/hotels" style={styles.link}>5-Star Palaces & Villas</Link></li>
              <li><Link to="/transport" style={styles.link}>Chauffeured Mercedes & Vintage Cars</Link></li>
              <li><Link to="/experiences" style={styles.link}>Signature Private Tours</Link></li>
              <li><Link to="/restaurants" style={styles.link}>Gourmet Chef's Table Dining</Link></li>
              <li><Link to="/ai-planner" style={styles.link}>AI Concierge Itinerary Planner</Link></li>
              <li><Link to="/loyalty" style={styles.link}>Elite Club Privileges & Rewards</Link></li>
            </ul>
          </div>

          {/* Elite Membership */}
          <div style={styles.col}>
            <h4 style={styles.title}>IntelliTrip Elite</h4>
            <p style={{ fontSize: '0.84rem', color: '#bda3c4', lineHeight: 1.5 }}>
              Join the private circle of discerning travelers. Receive bespoke perks, room upgrades, and priority reservations.
            </p>
            <Link to="/loyalty" className="btn btn-gold" style={styles.eliteBtn}>
              <Crown size={14} /> View Elite Privileges
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={styles.bottom}>
          <p style={styles.copy}>
            © {new Date().getFullYear()} IntelliTrip Bespoke Travel Group. All rights reserved.
          </p>
          <div style={styles.legalLinks}>
            <a href="#" style={styles.legalLink}>Privacy & Discretion</a>
            <span>•</span>
            <a href="#" style={styles.legalLink}>Terms of Charter</a>
            <span>•</span>
            <a href="#" style={styles.legalLink}>Concierge Protocol</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: '#0d0510',
    color: '#bda3c4',
    borderTop: '1px solid rgba(212, 175, 55, 0.25)',
    paddingTop: '4rem',
    paddingBottom: '2rem'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '3rem'
  },
  colMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    gridColumn: 'span 1'
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem'
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--color-gold-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    fontSize: '1.45rem',
    fontWeight: '700',
    color: '#f7e7be',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '1px'
  },
  desc: {
    fontSize: '0.86rem',
    lineHeight: 1.6,
    color: '#bda3c4'
  },
  conciergeContact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginTop: '0.5rem'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.82rem',
    color: '#f7e7be'
  },
  title: {
    color: '#f7e7be',
    fontSize: '1rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    letterSpacing: '0.5px'
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    padding: 0
  },
  link: {
    color: '#bda3c4',
    fontSize: '0.85rem',
    textDecoration: 'none',
    transition: 'color 0.2s'
  },
  eliteBtn: {
    padding: '0.6rem 1.25rem',
    fontSize: '0.8rem',
    alignSelf: 'flex-start',
    marginTop: '0.5rem'
  },
  bottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)',
    paddingTop: '1.5rem',
    fontSize: '0.8rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  copy: {
    color: '#8e7894'
  },
  legalLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#8e7894'
  },
  legalLink: {
    color: '#bda3c4',
    fontSize: '0.8rem'
  }
};

export default Footer;

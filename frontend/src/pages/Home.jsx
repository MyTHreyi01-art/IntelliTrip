import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { destinationService } from '../services/destinationService';
import { hotelService } from '../services/hotelService';
import { restaurantService } from '../services/restaurantService';
import { experienceService } from '../services/experienceService';
import { transportService } from '../services/transportService';
import { reviewService } from '../services/reviewService';
import {
  Compass,
  Building2,
  MapPin,
  Ticket,
  Car,
  Sparkles,
  Calendar,
  Users,
  Search,
  Star,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Heart,
  Flame,
  Percent,
  ArrowRight,
  CheckCircle2,
  Coffee,
  Waves,
  Mountain,
  Palmtree,
  Landmark,
  TreePine,
  Sun,
  Award,
  Crown,
  UserPlus
} from 'lucide-react';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80';
const FALLBACK_MOUNTAIN = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
const FALLBACK_ISLAND = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
const FALLBACK_SAFARI = 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80';
const FALLBACK_PALACE = 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80';

const getDateOffset = (days, fromDate = new Date()) => {
  const date = new Date(fromDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hotels');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(() => getDateOffset(1));
  const [checkOut, setCheckOut] = useState(() => getDateOffset(4));
  const [guests, setGuests] = useState(2);
  const [aiPrompt, setAiPrompt] = useState('');
  const [catalog, setCatalog] = useState({ destinations: [], hotels: [], restaurants: [], experiences: [], transports: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      destinationService.getDestinations(),
      hotelService.getHotels(),
      restaurantService.getRestaurants(),
      experienceService.getExperiences(),
      transportService.getTransports()
    ]).then((results) => {
      if (cancelled) return;
      const values = results.map((result) => result.status === 'fulfilled' ? result.value.data || [] : []);
      const nextCatalog = {
        destinations: values[0],
        hotels: values[1],
        restaurants: values[2],
        experiences: values[3],
        transports: values[4]
      };
      setCatalog(nextCatalog);
      setDestination((current) => current || nextCatalog.destinations[0]?.city || '');
      setCatalogLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const destinationsWithReviews = catalog.destinations.slice(0, 3);
    if (!destinationsWithReviews.length) return undefined;
    let cancelled = false;
    Promise.allSettled(destinationsWithReviews.map((place) => reviewService.getReviewsByTarget(place._id)))
      .then((results) => {
        if (cancelled) return;
        setReviews(results.flatMap((result) => result.status === 'fulfilled' ? result.value.data || [] : []).slice(0, 6));
      });
    return () => { cancelled = true; };
  }, [catalog.destinations]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'hotels') {
      navigate(`/hotels?search=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
    } else if (activeTab === 'destinations') {
      navigate(`/destinations?search=${encodeURIComponent(destination)}`);
    } else if (activeTab === 'experiences') {
      navigate(`/experiences?search=${encodeURIComponent(destination)}`);
    } else if (activeTab === 'transport') {
      navigate(`/transport?city=${encodeURIComponent(destination)}`);
    } else if (activeTab === 'ai') {
      navigate(`/ai-planner?prompt=${encodeURIComponent(aiPrompt)}`);
    }
  };

  const featuredCollections = catalog.destinations.slice(0, 4).map((place) => ({
    title: place.name,
    subtitle: [place.city, place.country].filter(Boolean).join(', '),
    image: place.images?.[0] || FALLBACK_MOUNTAIN,
    fallback: FALLBACK_MOUNTAIN,
    link: `/destinations/${place._id}`
  }));
  const bespokeHotels = catalog.hotels.slice(0, 3);
  const gourmetDining = catalog.restaurants.slice(0, 3);
  const bespokeExperiences = catalog.experiences.slice(0, 3);
  const eliteReviews = reviews.map((review) => ({
    quote: review.comment,
    author: review.user?.name || 'IntelliTrip traveler',
    tier: `${review.rating}/5 verified review`,
    avatar: review.user?.avatar || FALLBACK_HERO
  }));

  return (
    <div style={styles.page}>
      {/* OPULENT HERO SECTION (SCREENSHOT LAYOUT) */}
      <section style={styles.heroSection}>
        <div style={styles.heroBackdrop}></div>

        <div style={styles.heroContentContainer}>
          <div style={styles.heroCenterCard}>
            <h1 style={styles.heroMainTitle}>
              Curated Opulence.<br />Intelligently Designed.
            </h1>

            <p style={styles.heroSubTitle}>
              Experience the World Beyond Ordinary, Personalized by IntelliTrip.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
              <Link to="/ai-planner" className="btn btn-gold" style={styles.heroMainBtn}>
                Explore Custom Itineraries
              </Link>
            </div>

            {/* Center Golden Compass Seal */}
            <div style={styles.compassSeal}>
              <div style={styles.sealInner}>
                <Compass size={24} color="#d4af37" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTIONS SECTION (GOLD FRAMED CARDS WITH 100% RELIABLE IMAGES) */}
      <section style={styles.collectionsSection}>
        <div className="container">
          <div style={styles.collectionsHeader}>
            <h2 style={styles.sectionTitle}>Featured Collections</h2>
            <div style={styles.goldLine}></div>
          </div>

          <div style={styles.collectionsGrid}>
            {featuredCollections.map((col, idx) => (
              <Link key={idx} to={col.link} style={styles.collectionItem} className="gold-frame">
                <div style={styles.collectionImgWrap}>
                  <img
                    src={col.image}
                    alt={col.title}
                    style={styles.collectionImg}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = col.fallback || FALLBACK_HERO;
                    }}
                  />
                  <div style={styles.collectionOverlay}></div>
                </div>
                <div style={styles.collectionCaption}>
                  <h3 style={styles.collectionTitle}>{col.title}</h3>
                  <span style={styles.collectionSub}>{col.subtitle}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BESPOKE SEARCH & BOOKING ENGINE */}
      <section style={styles.searchSection}>
        <div className="container">
          <div style={styles.searchCard} className="glass-card">
            {/* Search Tabs */}
            <div style={styles.searchTabs}>
              <button
                style={{ ...styles.tabBtn, ...(activeTab === 'hotels' ? styles.tabBtnActive : {}) }}
                onClick={() => setActiveTab('hotels')}
              >
                <Building2 size={16} color={activeTab === 'hotels' ? '#d4af37' : '#bda3c4'} />
                <span>Luxury Stays</span>
              </button>

              <button
                style={{ ...styles.tabBtn, ...(activeTab === 'destinations' ? styles.tabBtnActive : {}) }}
                onClick={() => setActiveTab('destinations')}
              >
                <MapPin size={16} color={activeTab === 'destinations' ? '#d4af37' : '#bda3c4'} />
                <span>Bespoke Journeys</span>
              </button>

              <button
                style={{ ...styles.tabBtn, ...(activeTab === 'experiences' ? styles.tabBtnActive : {}) }}
                onClick={() => setActiveTab('experiences')}
              >
                <Ticket size={16} color={activeTab === 'experiences' ? '#d4af37' : '#bda3c4'} />
                <span>Signature Experiences</span>
              </button>

              <button
                style={{ ...styles.tabBtn, ...(activeTab === 'transport' ? styles.tabBtnActive : {}) }}
                onClick={() => setActiveTab('transport')}
              >
                <Car size={16} color={activeTab === 'transport' ? '#d4af37' : '#bda3c4'} />
                <span>Private Chauffeur & Cabs</span>
              </button>

              <button
                style={{ ...styles.tabBtn, ...(activeTab === 'ai' ? styles.tabBtnActiveAi : {}) }}
                onClick={() => setActiveTab('ai')}
              >
                <Sparkles size={16} color="#d4af37" />
                <span>AI Concierge Planner</span>
              </button>
            </div>

            {/* Tab Inputs */}
            {activeTab !== 'ai' ? (
              <form onSubmit={handleSearch} style={styles.searchForm}>
                <div style={styles.searchCol}>
                  <label style={styles.label}>DESTINATION / ROYAL RETREAT</label>
                  <div className="home-booking-control" style={styles.inputWrap}>
                    <MapPin size={16} color="#d4af37" />
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      style={styles.select}
                      required
                    >
                      <option value="" disabled>Choose a destination</option>
                      {[...new Set(catalog.destinations.map((place) => place.city).filter(Boolean))].map((city) => (
                        <option key={city} value={city} style={styles.option}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.searchDivider}></div>

                <div style={styles.searchCol}>
                  <label style={styles.label}>CHECK-IN DATE</label>
                  <div className="home-booking-control" style={styles.inputWrap}>
                    <Calendar size={16} color="#d4af37" />
                    <input
                      type="date"
                      min={getDateOffset(0)}
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (checkOut <= e.target.value) setCheckOut(getDateOffset(1, new Date(`${e.target.value}T00:00:00`)));
                      }}
                      required
                      style={styles.dateInput}
                    />
                  </div>
                </div>

                <div style={styles.searchDivider}></div>

                <div style={styles.searchCol}>
                  <label style={styles.label}>CHECK-OUT DATE</label>
                  <div className="home-booking-control" style={styles.inputWrap}>
                    <Calendar size={16} color="#d4af37" />
                    <input
                      type="date"
                      min={getDateOffset(1, new Date(`${checkIn}T00:00:00`))}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      style={styles.dateInput}
                    />
                  </div>
                </div>

                <div style={styles.searchDivider}></div>

                <div style={styles.searchCol}>
                  <label style={styles.label}>NUMBER OF GUESTS</label>
                  <div className="home-booking-control" style={styles.inputWrap}>
                    <Users size={16} color="#d4af37" />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      style={styles.select}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                        <option key={count} value={count} style={styles.option}>{count} {count === 1 ? 'guest' : 'guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-gold" style={styles.searchBtn}>
                  <Search size={18} /> SEARCH
                </button>
              </form>
            ) : (
              <form onSubmit={handleSearch} style={styles.aiForm}>
                <div style={styles.aiInputBlock}>
                  <label style={styles.label}>DESCRIBE YOUR BESPOKE DREAM ITINERARY</label>
                  <div style={styles.aiField}>
                    <Sparkles size={20} color="#d4af37" />
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. 7-day luxury Rajasthan tour with vintage car transfers and Michelin dining"
                      style={styles.aiText}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-gold" style={styles.aiBtn}>
                  <Sparkles size={18} /> GENERATE BESPOKE PLAN
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* BESPOKE STAYS & RESORTS */}
      <section style={{ ...styles.luxurySection, background: '#120815', borderTop: '1px solid rgba(212, 175, 55, 0.12)' }}>
        <div className="container">
          <div style={styles.sectionHeaderRow}>
            <div>
              <span className="badge badge-gold">
                <Building2 size={13} style={{ marginRight: 4 }} /> Palace Hotels & Resorts
              </span>
              <h2 style={styles.sectionHeading}>Bespoke Stays & Resorts</h2>
            </div>
            <Link to="/hotels" style={styles.viewAllGold}>
              View All Hotels <ChevronRight size={16} />
            </Link>
          </div>

          <div style={styles.cardsGrid}>
            {bespokeHotels.map((hotel) => (
              <div key={hotel._id} className="luxury-card" style={styles.hotelCard}>
                <div style={styles.hotelImgContainer}>
                  <Link to={`/hotels/${hotel._id}`} style={styles.imageLink} aria-label={`View ${hotel.name}`}>
                    <img src={hotel.images?.[0] || FALLBACK_HERO} alt={hotel.name} style={styles.hotelImg} />
                  </Link>
                  <span style={styles.goldBadge}>{hotel.amenities?.[0] || 'Featured stay'}</span>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(21,9,23,0.85)', borderRadius: '4px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} color="#d4af37" fill="#d4af37" />
                    <span style={{ fontSize: '0.75rem', color: '#f7e7be', fontWeight: 700 }}>{Number(hotel.rating || 4.9).toFixed(1)}</span>
                  </div>
                </div>
                <div style={styles.hotelDetails}>
                  <div style={styles.locationTag}>
                    <MapPin size={13} color="#d4af37" /><span>{hotel.city}</span>
                  </div>
                  <h3 style={styles.hotelName}>{hotel.name}</h3>
                  <div style={styles.amenitiesWrap}>
                    {(hotel.amenities || []).slice(0, 3).map((a) => (
                      <span key={a} style={styles.amenityPill}>{a}</span>
                    ))}
                  </div>
                  <div style={styles.cardFooter}>
                    <div>
                      <span style={styles.pricePrefix}>Per Night from</span>
                      <div style={styles.hotelPrice}>₹{Number(hotel.startingPrice || 0).toLocaleString()}</div>
                    </div>
                    <Link to={`/hotels/${hotel._id}`} className="btn btn-gold" style={styles.smallGoldBtn}>View stay</Link>
                  </div>
                </div>
              </div>
            ))}
            {!catalogLoading && !bespokeHotels.length && <p style={styles.emptyCatalog}>No stays are listed yet.</p>}
          </div>
        </div>
      </section>

      {/* TOP DESTINATIONS */}
      <section style={styles.luxurySection}>
        <div className="container">
          <div style={styles.sectionHeaderRow}>
            <div>
              <span className="badge badge-gold">
                <MapPin size={13} style={{ marginRight: 4 }} /> Curated Destinations
              </span>
              <h2 style={styles.sectionHeading}>Top Destinations to Explore</h2>
            </div>
            <Link to="/destinations" style={styles.viewAllGold}>
              View All Destinations <ChevronRight size={16} />
            </Link>
          </div>

          <div style={styles.cardsGrid}>
            {catalog.destinations.slice(0, 3).map((dest) => (
              <div key={dest._id} className="luxury-card" style={styles.hotelCard}>
                <div style={styles.hotelImgContainer}>
                  <Link to={`/destinations/${dest._id}`} style={styles.imageLink} aria-label={`View ${dest.name}`}>
                    <img src={dest.images?.[0] || FALLBACK_MOUNTAIN} alt={dest.name} style={styles.hotelImg} />
                  </Link>
                  <span style={styles.goldBadge}>{dest.category}</span>
                </div>
                <div style={styles.hotelDetails}>
                  <h3 style={styles.hotelName}>{dest.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#bda3c4', marginBottom: '1rem', lineHeight: 1.5 }}>{dest.description}</p>
                  <div style={{ marginTop: 'auto' }}>
                    <Link to={`/destinations/${dest._id}`} className="btn btn-gold" style={{ ...styles.smallGoldBtn, width: '100%', justifyContent: 'center' }}>
                      Explore Destination
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {!catalogLoading && !catalog.destinations.length && <p style={styles.emptyCatalog}>No destinations are listed yet.</p>}
          </div>
        </div>
      </section>

      {/* GOURMET DINING — Distinct from Stays */}
      <section style={styles.luxurySection}>
        <div className="container">
          <div style={styles.sectionHeaderRow}>
            <div>
              <span className="badge badge-gold">
                <Coffee size={13} style={{ marginRight: 4 }} /> Curated Cuisine
              </span>
              <h2 style={styles.sectionHeading}>Signature Gourmet Dining</h2>
            </div>
            <Link to="/restaurants" style={styles.viewAllGold}>
              Explore All Restaurants <ChevronRight size={16} />
            </Link>
          </div>

          <div style={styles.cardsGrid}>
            {gourmetDining.map((rest, idx) => (
              <div key={rest._id} className="luxury-card" style={styles.hotelCard}>
                <div style={styles.hotelImgContainer}>
                  <Link to={`/restaurants?open=${rest._id}`} style={styles.imageLink} aria-label={`View ${rest.name}`}>
                    <img src={rest.images?.[0] || FALLBACK_HERO} alt={rest.name} style={styles.hotelImg} />
                  </Link>
                  <span style={styles.goldBadge}>₹{Number(rest.averagePriceForTwo || 1800).toLocaleString()} / 2</span>
                </div>

                <div style={styles.hotelDetails}>
                  <div style={styles.locationTag}>
                    <MapPin size={13} color="#d4af37" />
                    <span>{rest.city}</span>
                  </div>

                  <h3 style={styles.hotelName}>{rest.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#bda3c4', margin: '0.3rem 0 0.75rem' }}>{rest.cuisine}</p>

                  <div style={styles.cardFooter}>
                    <div>
                      <span style={styles.pricePrefix}>Estimated average for two</span>
                      <div style={styles.hotelPrice}>₹{Number(rest.averagePriceForTwo || 1800).toLocaleString()}</div>
                    </div>
                    <Link to={`/restaurants?open=${rest._id}`} className="btn btn-gold" style={styles.smallGoldBtn}>
                      Reserve Table
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {!catalogLoading && !gourmetDining.length && <p style={styles.emptyCatalog}>No restaurants are listed yet.</p>}
          </div>

          {/* Quick Hotels Strip */}
          <div style={styles.hotelStripRow}>
            <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.88rem' }}>✦ Looking for luxury stays?</span>
            <Link to="/hotels" style={styles.viewAllGold}>
              View {catalog.hotels.length} Palace Hotels & Resorts <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* SIGNATURE EXPERIENCES */}
      <section style={{ ...styles.luxurySection, background: '#120715', borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}>
        <div className="container">
          <div style={styles.sectionHeaderRow}>
            <div>
              <span className="badge badge-gold">
                <Sparkles size={13} style={{ marginRight: 4 }} /> Curated Moments
              </span>
              <h2 style={styles.sectionHeading}>Signature Private Experiences</h2>
            </div>
            <Link to="/experiences" style={styles.viewAllGold}>
              Explore All Experiences <ChevronRight size={16} />
            </Link>
          </div>

          <div style={styles.cardsGrid}>
            {bespokeExperiences.map((exp, idx) => (
              <div key={exp._id} className="luxury-card" style={styles.hotelCard}>
                <div style={styles.hotelImgContainer}>
                  <Link to={`/experiences?open=${exp._id}`} style={styles.imageLink} aria-label={`View ${exp.title}`}>
                    <img src={exp.images?.[0] || FALLBACK_PALACE} alt={exp.title} style={styles.hotelImg} />
                  </Link>
                  <span style={styles.durationBadge}>{exp.duration}</span>
                </div>

                <div style={styles.hotelDetails}>
                  <div style={styles.locationTag}>
                    <MapPin size={13} color="#d4af37" />
                    <span>{exp.destination?.city || exp.cityName || 'India'}</span>
                  </div>

                  <h3 style={styles.hotelName}>{exp.title}</h3>

                  <div style={styles.cardFooter}>
                    <div>
                      <span style={styles.pricePrefix}>Private Tour Rate</span>
                      <div style={styles.hotelPrice}>₹{Number(exp.pricePerPerson || 0).toLocaleString()}</div>
                    </div>
                    <Link to={`/experiences?open=${exp._id}`} className="btn btn-secondary" style={styles.smallGoldBtn}>
                      Book Experience
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {!catalogLoading && !bespokeExperiences.length && <p style={styles.emptyCatalog}>No experiences are listed yet.</p>}
          </div>
        </div>
      </section>

      <section style={styles.luxurySection}>
        <div className="container">
          <div style={styles.sectionHeaderRow}>
            <div>
              <span className="badge badge-gold"><Car size={13} style={{ marginRight: 4 }} /> Chauffeur & Private Fleet</span>
              <h2 style={styles.sectionHeading}>Private Aviation &amp; Cabs</h2>
            </div>
            <Link to="/transport" style={styles.viewAllGold}>Explore all transport <ChevronRight size={16} /></Link>
          </div>
          <div style={styles.cardsGrid}>
            {catalog.transports.slice(0, 3).map((item) => (
              <div key={item._id} className="luxury-card" style={styles.hotelCard}>
                <div style={styles.hotelImgContainer}>
                  <Link to={`/transport?open=${item._id}`} style={styles.imageLink} aria-label={`View ${item.title}`}>
                    <img src={item.images?.[0] || FALLBACK_HERO} alt={item.title} style={styles.hotelImg} />
                  </Link>
                  <span style={styles.goldBadge}>{item.type}</span>
                </div>
                <div style={styles.hotelDetails}>
                  <div style={styles.locationTag}><MapPin size={13} color="#d4af37" />{item.city}</div>
                  <h3 style={styles.hotelName}>{item.title}</h3>
                  <p style={styles.desc}>{item.vehicleModel} · Up to {item.capacity} guests</p>
                  <div style={styles.cardFooter}>
                    <div><span style={styles.pricePrefix}>Per day</span><div style={styles.hotelPrice}>₹{Number(item.pricePerDay || 0).toLocaleString()}</div></div>
                    <Link to={`/transport?open=${item._id}`} className="btn btn-gold" style={styles.smallGoldBtn}>Reserve</Link>
                  </div>
                </div>
              </div>
            ))}
            {!catalogLoading && !catalog.transports.length && <p style={styles.emptyCatalog}>No transport listings are available yet.</p>}
          </div>
        </div>
      </section>

      {/* ELITE MEMBERS QUOTE CARDS */}
      <section style={styles.eliteReviewsSection}>
        <div className="container">
          <div style={styles.collectionsHeader}>
            <h2 style={styles.sectionTitle}>What Our Members Say</h2>
            <div style={styles.goldLine}></div>
          </div>

          <div style={styles.reviewsGrid}>
            {eliteReviews.map((rev, idx) => (
              <div key={idx} style={styles.quoteCard} className="gold-frame">
                <span style={styles.quoteMark}>“</span>
                <p style={styles.quoteText}>{rev.quote}</p>
                <div style={styles.quoteAuthorRow}>
                  <img
                    src={rev.avatar}
                    alt={rev.author}
                    style={styles.authorAvatar}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <div>
                    <h4 style={styles.authorName}>{rev.author}</h4>
                    <span style={styles.authorTier}>{rev.tier}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#150917',
    color: '#f8fafc'
  },
  heroSection: {
    position: 'relative',
    height: '82vh',
    minHeight: '620px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  heroBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
    filter: 'brightness(0.78)',
    transform: 'scale(1.02)'
  },
  heroContentContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  heroCenterCard: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '900px'
  },
  heroMainTitle: {
    fontSize: '3.8rem',
    fontWeight: '700',
    color: 'var(--color-gold-light)',
    fontFamily: 'var(--font-serif)',
    lineHeight: 1.15,
    letterSpacing: '1px',
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.85)',
    marginBottom: '1.25rem'
  },
  heroSubTitle: {
    fontSize: '1.25rem',
    color: '#f3e8f7',
    fontWeight: '400',
    letterSpacing: '0.5px',
    maxWidth: '680px',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
    marginBottom: '2.5rem',
    lineHeight: 1.5
  },
  heroMainBtn: {
    padding: '1rem 2.75rem',
    fontSize: '1.05rem',
    borderRadius: '3px',
    boxShadow: '0 6px 25px rgba(212, 175, 55, 0.5)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  heroSignUpBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '1rem 2.25rem',
    fontSize: '1.05rem',
    borderRadius: '3px',
    border: '2px solid rgba(247, 231, 190, 0.75)',
    color: '#f7e7be',
    background: 'rgba(21, 9, 23, 0.45)',
    backdropFilter: 'blur(8px)',
    fontWeight: '700',
    letterSpacing: '0.5px',
    textDecoration: 'none',
    transition: 'all 0.25s ease',
    cursor: 'pointer'
  },
  compassSeal: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '1px solid rgba(212, 175, 55, 0.6)',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(21, 9, 23, 0.6)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)'
  },
  sealInner: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  collectionsSection: {
    padding: '4.5rem 0 3rem 0',
    background: '#150917'
  },
  collectionsHeader: {
    marginBottom: '2.5rem'
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-gold-light)',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem'
  },
  goldLine: {
    width: '60px',
    height: '2px',
    background: 'var(--color-gold-gradient)'
  },
  collectionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.75rem'
  },
  collectionItem: {
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none'
  },
  collectionImgWrap: {
    position: 'relative',
    height: '180px',
    overflow: 'hidden'
  },
  collectionImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease'
  },
  collectionOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, transparent 40%, rgba(21, 9, 23, 0.9) 100%)'
  },
  collectionCaption: {
    background: '#241028',
    padding: '1rem',
    textAlign: 'center',
    borderTop: '1px solid rgba(212, 175, 55, 0.25)'
  },
  collectionTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-gold-light)',
    marginBottom: '0.2rem'
  },
  collectionSub: {
    fontSize: '0.75rem',
    color: '#bda3c4',
    letterSpacing: '0.5px'
  },
  searchSection: {
    padding: '2rem 0 4rem 0'
  },
  searchCard: {
    padding: '2rem',
    background: 'rgba(31, 14, 34, 0.95)',
    border: '1px solid rgba(212, 175, 55, 0.45)',
    borderRadius: '6px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
  },
  searchTabs: {
    display: 'flex',
    gap: '0.6rem',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
    overflowX: 'auto'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    color: '#bda3c4',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderRadius: '4px',
    cursor: 'pointer',
    letterSpacing: '0.5px'
  },
  tabBtnActive: {
    background: 'rgba(56, 20, 63, 0.8)',
    color: '#d4af37',
    border: '1px solid rgba(212, 175, 55, 0.4)'
  },
  tabBtnActiveAi: {
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(56, 20, 63, 0.8))',
    color: '#f7e7be',
    border: '1px solid #d4af37'
  },
  searchForm: {
    display: 'grid',
    gridTemplateColumns: '1.5fr auto 1fr auto 1fr auto 1.2fr auto',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(21, 9, 23, 0.8)',
    padding: '1.25rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.25)'
  },
  searchCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  label: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#d4af37',
    letterSpacing: '1px'
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '44px',
    padding: '0 0.55rem',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: '6px',
    background: 'rgba(15, 23, 32, 0.92)'
  },
  select: {
    background: 'transparent',
    border: 'none',
    color: '#f7e7be',
    fontSize: '0.9rem',
    fontWeight: '600',
    outline: 'none',
    width: '100%',
    minHeight: '42px',
    padding: '0.35rem 0.25rem',
    cursor: 'pointer'
  },
  option: { color: '#f8fafc', background: '#151b23' },
  dateInput: {
    colorScheme: 'dark',
    background: 'transparent',
    border: 'none',
    color: '#f7e7be',
    fontSize: '0.9rem',
    fontWeight: '600',
    outline: 'none',
    width: '100%',
    minHeight: '42px',
    padding: '0.35rem 0.25rem',
    cursor: 'pointer'
  },
  searchDivider: {
    width: '1px',
    height: '40px',
    background: 'rgba(212, 175, 55, 0.2)'
  },
  searchBtn: {
    padding: '0.85rem 1.75rem',
    fontSize: '0.9rem'
  },
  aiForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  aiInputBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  aiField: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(21, 9, 23, 0.9)',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    padding: '0.85rem 1.25rem',
    borderRadius: '4px'
  },
  aiText: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.95rem',
    fontWeight: '500',
    outline: 'none'
  },
  aiBtn: {
    alignSelf: 'flex-start'
  },
  luxurySection: {
    padding: '4.5rem 0'
  },
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  sectionHeading: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--color-gold-light)',
    fontFamily: 'var(--font-serif)',
    marginTop: '0.5rem'
  },
  viewAllGold: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#d4af37',
    fontSize: '0.88rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem'
  },
  hotelCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  hotelImgContainer: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden'
  },
  hotelImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imageLink: { display: 'block', width: '100%', height: '100%' },
  emptyCatalog: { color: '#c5cbd3', padding: '1.25rem', gridColumn: '1 / -1' },
  goldBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'var(--color-gold-gradient)',
    color: '#150917',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.25rem 0.6rem',
    borderRadius: '2px',
    letterSpacing: '0.5px'
  },
  durationBadge: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    background: 'rgba(21, 9, 23, 0.8)',
    color: '#d4af37',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '2px',
    border: '1px solid rgba(212, 175, 55, 0.3)'
  },
  hotelDetails: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  locationTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.78rem',
    color: '#d4af37',
    fontWeight: '600',
    marginBottom: '0.35rem'
  },
  hotelName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    marginBottom: '0.75rem',
    lineHeight: 1.3
  },
  amenitiesWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginBottom: '1.25rem'
  },
  amenityPill: {
    fontSize: '0.72rem',
    color: '#bda3c4',
    background: 'rgba(56, 20, 63, 0.5)',
    padding: '0.15rem 0.5rem',
    borderRadius: '2px',
    border: '1px solid rgba(212, 175, 55, 0.15)'
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)'
  },
  pricePrefix: {
    fontSize: '0.7rem',
    color: '#8e7894',
    display: 'block'
  },
  hotelPrice: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#d4af37',
    fontFamily: 'var(--font-serif)'
  },
  priceSuffix: {
    fontSize: '0.75rem',
    color: '#bda3c4',
    fontWeight: '400'
  },
  smallGoldBtn: {
    padding: '0.5rem 1.15rem',
    fontSize: '0.8rem'
  },
  eliteReviewsSection: {
    padding: '4.5rem 0',
    background: '#180a1a',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)'
  },
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem'
  },
  quoteCard: {
    padding: '2rem',
    background: '#241028',
    position: 'relative'
  },
  quoteMark: {
    fontSize: '3.5rem',
    lineHeight: '1',
    color: 'rgba(212, 175, 55, 0.3)',
    fontFamily: 'var(--font-serif)',
    display: 'block',
    marginBottom: '-0.5rem'
  },
  quoteText: {
    fontSize: '0.98rem',
    lineHeight: 1.6,
    color: '#e2d5e6',
    fontStyle: 'italic',
    marginBottom: '1.5rem'
  },
  quoteAuthorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem'
  },
  authorAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid #d4af37'
  },
  authorName: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#f7e7be',
    fontFamily: 'var(--font-serif)'
  },
  authorTier: {
    fontSize: '0.75rem',
    color: '#d4af37',
    fontWeight: '600'
  }
};

export default Home;

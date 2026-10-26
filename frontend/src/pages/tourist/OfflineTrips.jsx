import React, { useState, useEffect } from 'react';
import { offlineService } from '../../services/offlineService';
import { useNotification } from '../../context/NotificationContext';
import { WifiOff, Download, Trash2, Calendar, MapPin, Sparkles } from 'lucide-react';

const OfflineTrips = () => {
  const { showNotification } = useNotification();
  const [offlineTrips, setOfflineTrips] = useState([]);

  useEffect(() => {
    loadOfflineTrips();
  }, []);

  const loadOfflineTrips = () => {
    const cached = offlineService.getOfflineTrips();
    setOfflineTrips(cached);
  };

  const handleRemove = (id) => {
    offlineService.removeOfflineTrip(id);
    showNotification('Offline trip removed from cache', 'info');
    loadOfflineTrips();
  };

  const handleExportJSON = (trip) => {
    offlineService.exportAsJSON(trip);
    showNotification('Trip itinerary exported as JSON file', 'success');
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <WifiOff size={14} /> Offline Mode & Client-Side Cache
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem' }}>
          Offline Itineraries & Cached Trips
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Access saved trip details, day-by-day plans, and bookings without an active internet connection.
        </p>
      </div>

      {offlineTrips.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <WifiOff size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No Offline Trips Saved</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Generate itineraries using the AI Planner or book hotels to save them offline for uninterrupted travel.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {offlineTrips.map((trip) => (
            <div key={trip.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{trip.title || trip.destination}</h3>
                  <span className="badge badge-primary">Offline Ready</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <MapPin size={12} style={{ marginRight: '0.25rem' }} /> {trip.destination || 'Custom Trip'} • Saved on {new Date(trip.savedAt).toLocaleDateString()}
                </p>

                {trip.dayPlans && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <strong>{trip.dayPlans.length} Days Planned:</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                      {trip.dayPlans.slice(0, 2).map((d, i) => (
                        <li key={i}>{d.theme || `Day ${d.day}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button onClick={() => handleExportJSON(trip)} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <Download size={14} /> Export JSON
                </button>
                <button onClick={() => handleRemove(trip.id)} className="btn btn-outline" style={{ padding: '0.5rem', color: '#ef4444' }} title="Remove Offline Cache">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfflineTrips;

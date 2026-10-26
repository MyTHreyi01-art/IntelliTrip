import React, { useState, useEffect } from 'react';
import { emergencyService } from '../../services/emergencyService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';
import { destinationService } from '../../services/destinationService';
import { AlertTriangle, PhoneCall, ShieldAlert, CheckCircle, MapPin, LocateFixed, Home, FileText } from 'lucide-react';

const EmergencyAssistant = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState({ helplines: [], nearbyFacilities: [] });
  const [requestSaved, setRequestSaved] = useState(null);
  const [smsRecipient, setSmsRecipient] = useState('112');
  const [placeSuggestions, setPlaceSuggestions] = useState([]);

  const [emergencyForm, setEmergencyForm] = useState({
    location: '',
    address: '',
    type: 'Medical',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    fetchEmergencyContacts();
    destinationService.getDestinations()
      .then((res) => setPlaceSuggestions(res.data || []))
      .catch(() => setPlaceSuggestions([]));
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showNotification('Location access is not available in this browser.', 'warning');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
        setEmergencyForm((current) => ({ ...current, location: coordinates, address: coordinates }));
      },
      () => showNotification('Could not read your location. Enter a nearby landmark instead.', 'warning'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchEmergencyContacts = async () => {
    setLoading(true);
    try {
      const res = await emergencyService.getHelplineContacts();
      setContacts(res.data || { helplines: [], nearbyFacilities: [] });
    } catch (err) {
      showNotification(err.message || 'Failed to fetch emergency contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareEmergencySms = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please sign in to save an emergency assistance request.', 'warning');
      return;
    }

    try {
      const res = await emergencyService.triggerSOS(emergencyForm);
      setRequestSaved(res.data);
      showNotification('Emergency request saved. Review and send the prepared SMS from your messaging app.', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to save emergency assistance request.', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <BackButton />
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ef4444', color: '#fff' }}>
          <AlertTriangle size={14} /> 24x7 Tourist Emergency & Safety System
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem' }}>
          Emergency Assistance
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Call a listed emergency number for immediate help. You can also prepare an SMS and send it using your device's messaging app.
        </p>
      </div>

      {loading ? (
        <Loader message="Fetching emergency helplines..." />
      ) : (
        <div style={styles.assistanceGrid}>
          {/* Left Column: Emergency request and SMS handoff */}
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldAlert size={24} /> Emergency Assistance Request
            </h2>

            {requestSaved ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ef4444' }}>
                <CheckCircle size={36} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>Request saved</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  <strong>Reference:</strong> {requestSaved._id}
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Status:</strong> {requestSaved.status}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  This request is recorded for support and does not contact emergency services by itself. For immediate help, call 112 or another listed number.
                </p>
                <a href={`sms:${smsRecipient}?body=${encodeURIComponent(`Emergency assistance needed. Location: ${requestSaved.location}. Address: ${requestSaved.address || 'Not provided'}. Type: ${requestSaved.type}. Details: ${requestSaved.notes || 'Please contact me.'} Phone: ${requestSaved.userPhone || emergencyForm.phone}`)}`} style={styles.smsButton}>
                  <PhoneCall size={16} /> Open SMS app
                </a>
                <p style={{ color: '#c5cbd3', fontSize: '0.78rem', marginTop: '0.6rem' }}>Review the message and tap Send in your messaging app.</p>
              </div>
            ) : (
              <form onSubmit={handlePrepareEmergencySms}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Emergency Type</label>
                  <select
                    className="form-control"
                    style={styles.select}
                    value={emergencyForm.type}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, type: e.target.value })}
                  >
                    {['Medical', 'Police', 'Accident', 'Lost', 'Other'].map((t) => (
                      <option key={t} value={t} style={styles.option}>{t}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">SMS recipient</label>
                  <select value={smsRecipient} onChange={(e) => setSmsRecipient(e.target.value)} style={styles.select}>
                    {contacts.helplines.map((line) => <option key={line.number} value={line.number} style={styles.option}>{line.name} · {line.number}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="emergency-location">Your location or nearby landmark</label>
                  <div className="emergency-input-row" style={styles.inputRow}>
                    <MapPin size={18} color="#d97706" />
                    <input
                      id="emergency-location"
                      type="text"
                      list="emergency-place-options"
                      value={emergencyForm.location}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, location: e.target.value })}
                      placeholder="Search a city or enter a landmark"
                      style={styles.interactiveInput}
                      required
                    />
                    <datalist id="emergency-place-options">
                      {placeSuggestions.map((place) => <option key={place._id} value={`${place.city}, ${place.country}`} />)}
                    </datalist>
                  </div>
                  <button type="button" onClick={handleUseCurrentLocation} style={styles.locationButton}>
                    <LocateFixed size={15} /> Use my current location
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="emergency-address">Street address or directions</label>
                  <div className="emergency-input-row" style={styles.inputRow}>
                    <Home size={18} color="#d97706" />
                    <input
                      id="emergency-address"
                      type="text"
                      value={emergencyForm.address}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, address: e.target.value })}
                      placeholder="Building, street, area, or directions"
                      style={styles.interactiveInput}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="emergency-phone">Your contact phone</label>
                  <div className="emergency-input-row" style={styles.inputRow}>
                    <PhoneCall size={18} color="#d97706" />
                    <input
                      id="emergency-phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      value={emergencyForm.phone}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                      style={styles.interactiveInput}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={styles.notesHeader}>
                    <label className="form-label" htmlFor="emergency-notes">Additional details</label>
                    <span style={styles.optionalTag}>OPTIONAL</span>
                  </div>
                  <p style={styles.notesHint}>Share what happened, any immediate risks, or help that would be useful.</p>
                  <div className="emergency-notes-editor" style={styles.notesEditor}>
                    <FileText size={17} color="#d97706" style={styles.notesIcon} />
                    <textarea
                      id="emergency-notes"
                      rows={4}
                      maxLength={500}
                      aria-describedby="emergency-notes-count"
                      placeholder="For example: I need medical help and am near the north entrance..."
                      value={emergencyForm.notes}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, notes: e.target.value })}
                      style={styles.notesInput}
                    />
                    <span id="emergency-notes-count" style={styles.notesCount}>{emergencyForm.notes.length}/500</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    background: '#d97706',
                    color: '#fff',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <PhoneCall size={20} /> Save request and prepare SMS
                </button>
              </form>
            )}
          </div>

          {/* Right Column: 24x7 Helplines & Nearby Facilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* National Helplines */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhoneCall color="var(--color-primary)" size={20} /> 24x7 Emergency Helplines
              </h3>
              <div style={styles.helplinesGrid}>
                {contacts.helplines && contacts.helplines.map((h, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{h.name}</span>
                    <a href={`tel:${h.number}`} style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', textDecoration: 'none' }}>
                      📞 {h.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {!contacts.nearbyFacilities?.length && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Location-specific hospitals and police stations are not verified here. Use your maps app or call 112 for local emergency dispatch.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  notesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' },
  optionalTag: { color: '#c5cbd3', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em' },
  notesHint: { color: '#b9c3cd', fontSize: '0.8rem', lineHeight: 1.45, margin: '0.1rem 0 0.55rem' },
  notesEditor: { position: 'relative', padding: '0.8rem 0.8rem 2.1rem 2.5rem', border: '1px solid #52616e', borderRadius: '6px', background: '#202d39' },
  notesIcon: { position: 'absolute', top: '0.9rem', left: '0.8rem' },
  notesInput: { display: 'block', width: '100%', minHeight: '104px', resize: 'vertical', border: 0, outline: 0, color: '#f8fafc', background: 'transparent', font: 'inherit', fontSize: '0.9rem', lineHeight: 1.5 },
  notesCount: { position: 'absolute', right: '0.8rem', bottom: '0.55rem', color: '#aeb9c4', fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums' },
  assistanceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '2rem', alignItems: 'start' },
  helplinesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' },
  inputRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.25rem 0.75rem', border: '1px solid #52616e', borderRadius: '6px', background: '#202d39' },
  interactiveInput: { flex: 1, minWidth: 0, border: 0, outline: 0, padding: '0.7rem 0', color: '#f8fafc', background: 'transparent' },
  locationButton: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.45rem', padding: '0.45rem 0.65rem', borderRadius: '4px', color: '#f1d578', background: 'rgba(217,119,6,0.12)', fontSize: '0.8rem', fontWeight: 700 },
  select: {
    width: '100%',
    color: '#f8fafc',
    background: '#202d39',
    border: '1px solid #52616e',
    borderRadius: '4px',
    padding: '0.65rem 0.75rem'
  },
  option: { color: '#f8fafc', background: '#202d39' },
  smsButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.8rem',
    padding: '0.7rem 1rem',
    borderRadius: '4px',
    background: '#d97706',
    color: '#111827',
    fontWeight: 800
  }
};

export default EmergencyAssistant;

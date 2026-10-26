import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { bookingService } from '../../services/bookingService';
import {
  X,
  Calendar,
  Users,
  Phone,
  User,
  Mail,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const BookingDetailsModal = ({
  isOpen,
  onClose,
  onSuccess,
  item,
  roomId = null,
  roomTitle = '',
  itemType = 'Tour',
  title = '',
  subtitle = '',
  price = 0,
  maxGuests = 12,
  defaultStartDate = '',
  defaultEndDate = ''
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [fullName, setFullName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [startDate, setStartDate] = useState(defaultStartDate || todayStr);
  const [endDate, setEndDate] = useState(defaultEndDate || tomorrowStr);
  const [reservationTime, setReservationTime] = useState('19:30');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!contactPhone) setContactPhone(user.phone || '');
    }
  }, [user]);

  if (!isOpen || !item) return null;

  const isRestaurant = itemType === 'Restaurant';
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const daysDiff = Math.ceil((endD - startD) / (1000 * 60 * 60 * 24));
  const durationDays = isRestaurant ? 1 : Math.max(1, isNaN(daysDiff) ? 1 : daysDiff);

  // All prices in Rupees (INR) - exactly as defined by Super Admin
  const unitPriceInr = Math.round(Number(price || 0));
  
  let calculatedTotalInr = 0;
  if (isRestaurant) {
    calculatedTotalInr = Math.round(unitPriceInr * (Number(guests) / 2));
  } else if (itemType === 'Hotel' && roomId) {
    calculatedTotalInr = unitPriceInr * durationDays;
  } else if (itemType === 'Transport') {
    calculatedTotalInr = unitPriceInr * durationDays;
  } else {
    calculatedTotalInr = unitPriceInr * durationDays * Number(guests);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please log in to finalize your reservation.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please provide your full legal name.');
      return;
    }

    if (!contactPhone.trim()) {
      setErrorMsg('Please provide a valid contact phone number.');
      return;
    }

    if (!startDate) {
      setErrorMsg('Please select your journey / reservation start date.');
      return;
    }

    if (!isRestaurant && endDate && new Date(endDate) < new Date(startDate)) {
      setErrorMsg('Journey end date cannot be earlier than start date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        itemType,
        itemRef: item._id,
        roomId: roomId || undefined,
        fullName: fullName.trim(),
        email: user.email,
        contactPhone: contactPhone.trim(),
        startDate,
        endDate: isRestaurant ? startDate : (endDate || startDate),
        reservationTime: isRestaurant ? reservationTime : undefined,
        guests: Number(guests),
        specialRequests: specialRequests.trim()
      };

      const res = await bookingService.createBooking(payload);

      // Trigger instant real-time synchronization across Dashboard and Itineraries
      window.dispatchEvent(new CustomEvent('intellitrip:booking_updated', { detail: res.data }));
      window.dispatchEvent(new Event('booking_updated'));
      try {
        localStorage.setItem('intellitrip_last_booking_sync', Date.now().toString());
      } catch {}

      showNotification('Booking successfully confirmed! Notification dispatched to your email.', 'success');
      if (onSuccess) {
        onSuccess(res.data, res.emailConfirmation || { sent: true, recipient: user.email });
      }
      onClose();
    } catch (err) {
      const msg = err.message || 'Failed to submit booking reservation.';
      setErrorMsg(msg);
      showNotification(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="luxury-card" style={styles.modal} role="dialog" aria-modal="true">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Sparkles size={13} /> {itemType === 'Restaurant' ? 'Dining Reservation' : itemType === 'Hotel' ? 'Luxury Stay Reservation' : itemType === 'Transport' ? 'Fleet Charter' : 'Tour Booking'}
            </span>
            <h2 style={styles.modalTitle}>{title || item.title || item.name}</h2>
            {roomTitle && (
              <p style={{ color: '#d4af37', fontSize: '0.9rem', fontWeight: 700, margin: '0.2rem 0' }}>
                Suite: {roomTitle}
              </p>
            )}
            {subtitle && (
              <p style={styles.modalSub}>
                <MapPin size={13} color="#d4af37" style={{ display: 'inline', marginRight: 4 }} />
                {subtitle}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} color="#f43f5e" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email Notice Callout */}
        <div style={styles.emailNotice}>
          <Mail size={16} color="#d4af37" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#ebdceb' }}>
            <span>Booking confirmation, voucher, and details will be sent to your registered email: </span>
            <strong style={{ color: '#f7e7be', wordBreak: 'break-all' }}>{user?.email || 'Your account email'}</strong>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.twoCol}>
            {/* Full Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={13} color="#d4af37" /> PRIMARY GUEST NAME *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name as per ID"
                style={styles.input}
              />
            </div>

            {/* Contact Phone */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Phone size={13} color="#d4af37" /> CONTACT PHONE *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={styles.input}
              />
            </div>
          </div>

          {/* Registered Email (Disabled / Readonly display) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Mail size={13} color="#d4af37" /> REGISTERED EMAIL (VOUCHER RECIPIENT)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              disabled
              style={{ ...styles.input, opacity: 0.85, cursor: 'not-allowed', backgroundColor: 'rgba(21, 9, 23, 0.5)' }}
            />
            <span style={styles.inputHelp}>
              ✦ Confirmation passes, reference ID, and receipts are sent to your verified registered address.
            </span>
          </div>

          {/* Journey Dates - Fully User-Selectable Inputs */}
          <div style={styles.twoCol}>
            {/* Start Date */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Calendar size={13} color="#d4af37" /> {isRestaurant ? 'RESERVATION DATE *' : itemType === 'Hotel' ? 'CHECK-IN DATE *' : 'JOURNEY START DATE *'}
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
                style={styles.input}
              />
            </div>

            {/* End Date (for travel / stay / fleet) OR Reservation Time (for restaurants) */}
            {isRestaurant ? (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Clock size={13} color="#d4af37" /> RESERVATION TIME *
                </label>
                <input
                  type="time"
                  required
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  style={styles.input}
                />
              </div>
            ) : (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Calendar size={13} color="#d4af37" /> {itemType === 'Hotel' ? 'CHECK-OUT DATE *' : 'JOURNEY END DATE *'}
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.input}
                />
              </div>
            )}
          </div>

          {/* Number of Guests */}
          <div style={styles.twoCol}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Users size={13} color="#d4af37" /> {isRestaurant ? 'PARTY SIZE (GUESTS) *' : 'NUMBER OF TRAVELERS *'}
              </label>
              <input
                type="number"
                required
                min="1"
                max={maxGuests}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={styles.input}
              />
            </div>

            {!isRestaurant && (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Clock size={13} color="#d4af37" /> CALCULATED DURATION
                </label>
                <div style={{ ...styles.input, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(21, 9, 23, 0.4)', color: '#d4af37', fontWeight: '700' }}>
                  {durationDays} {itemType === 'Hotel' ? (durationDays === 1 ? 'Night' : 'Nights') : (durationDays === 1 ? 'Day' : 'Days')}
                </div>
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div style={styles.formGroup}>
            <label style={styles.label}>SPECIAL REQUESTS / PREFERENCES (OPTIONAL)</label>
            <textarea
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Dietary preferences, airport pickup terminal, high-floor suite, child seat, guide language preference..."
              style={styles.textarea}
            />
          </div>

          {/* Investment Summary in Rupees */}
          <div style={styles.pricingSummary}>
            <div>
              <span style={styles.summaryLabel}>
                {isRestaurant
                  ? `₹${unitPriceInr.toLocaleString('en-IN')} avg for 2 × ${guests} guests`
                  : itemType === 'Hotel' && roomId
                  ? `₹${unitPriceInr.toLocaleString('en-IN')} / night × ${durationDays} nights`
                  : itemType === 'Transport'
                  ? `₹${unitPriceInr.toLocaleString('en-IN')} / day × ${durationDays} days`
                  : `₹${unitPriceInr.toLocaleString('en-IN')} × ${durationDays} days × ${guests} guests`}
              </span>
              <span style={styles.summaryTotalLabel}>Total Amount (Rupees)</span>
            </div>
            <div style={styles.summaryPrice}>
              ₹{calculatedTotalInr.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.75rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-gold"
              style={{ flex: 1.5, padding: '0.75rem', fontWeight: '800' }}
            >
              {submitting ? 'Confirming & Sending Email...' : 'Confirm & Reserve Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(5, 2, 8, 0.88)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1400,
    padding: '1rem'
  },
  modal: {
    width: '100%',
    maxWidth: '540px',
    maxHeight: '92vh',
    overflowY: 'auto',
    background: '#1a0b1d',
    border: '1px solid rgba(212, 175, 55, 0.45)',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
    color: '#f8fafc'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.25rem'
  },
  modalTitle: {
    fontSize: '1.45rem',
    fontWeight: '800',
    fontFamily: 'var(--font-serif)',
    color: '#f7e7be',
    margin: 0,
    lineHeight: '1.25'
  },
  modalSub: {
    fontSize: '0.85rem',
    color: '#bda3c4',
    margin: '0.35rem 0 0 0'
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    color: '#f7e7be',
    borderRadius: '4px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    background: 'rgba(244, 63, 94, 0.15)',
    border: '1px solid rgba(244, 63, 94, 0.4)',
    color: '#fecdd3',
    fontSize: '0.84rem',
    marginBottom: '1rem'
  },
  emailNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.85rem 1rem',
    background: 'rgba(36, 17, 41, 0.7)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '6px',
    marginBottom: '1.25rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#d4af37',
    letterSpacing: '0.6px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  input: {
    background: 'rgba(15, 7, 18, 0.85)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: '4px',
    padding: '0.65rem 0.85rem',
    color: '#f8fafc',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  textarea: {
    background: 'rgba(15, 7, 18, 0.85)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: '4px',
    padding: '0.65rem 0.85rem',
    color: '#f8fafc',
    fontSize: '0.88rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  inputHelp: {
    fontSize: '0.72rem',
    color: '#bda3c4',
    marginTop: '0.2rem'
  },
  pricingSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    background: 'rgba(36, 17, 41, 0.85)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: '6px',
    marginTop: '0.5rem'
  },
  summaryLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#bda3c4'
  },
  summaryTotalLabel: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#f7e7be',
    marginTop: '0.15rem'
  },
  summaryPrice: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#10b981',
    fontFamily: 'var(--font-serif)'
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem'
  }
};

export default BookingDetailsModal;

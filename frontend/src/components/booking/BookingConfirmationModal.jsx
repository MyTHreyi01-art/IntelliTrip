import React, { useState } from 'react';
import {
  CheckCircle2,
  Mail,
  Calendar,
  Users,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const BookingConfirmationModal = ({
  isOpen,
  onClose,
  booking,
  emailInfo,
  itemTitle = 'Tourism Service',
  itemLocation = '',
  onViewBookings
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const referenceCode = booking._id
    ? `#INT-${booking._id.substring(booking._id.length - 8).toUpperCase()}`
    : '#INT-CONFIRMED';

  const recipientEmail = emailInfo?.recipient || booking.email || 'your registered email';

  const handleCopyRef = () => {
    if (booking._id) {
      navigator.clipboard.writeText(referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startDateFormatted = booking.startDate
    ? new Date(booking.startDate).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';

  const endDateFormatted =
    booking.endDate && booking.endDate !== booking.startDate
      ? new Date(booking.endDate).toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : '';

  const displayCurrency = '₹';
  const displayAmount = `₹${Number(booking.totalPrice || 0).toLocaleString()}`;

  return (
    <div style={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="luxury-card" style={styles.modal} role="dialog" aria-modal="true">
        {/* Close Icon */}
        <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close confirmation dialog">
          <X size={18} />
        </button>

        {/* Top Success Icon */}
        <div style={styles.iconWrapper}>
          <div style={styles.pulseCircle}>
            <CheckCircle2 size={44} color="#10b981" />
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Sparkles size={12} /> Reservation Secured
          </span>
          <h2 style={styles.title}>Booking Confirmed!</h2>
          <p style={styles.subTitle}>
            Your reservation has been successfully booked in the IntelliTrip portal.
          </p>
        </div>

        {/* Email Dispatched Alert Box */}
        <div style={styles.emailBanner}>
          <div style={styles.emailIconBox}>
            <Mail size={22} color="#d4af37" />
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#f7e7be', fontSize: '0.92rem', display: 'block', marginBottom: '0.2rem' }}>
              Confirmation Email Sent!
            </strong>
            <p style={{ fontSize: '0.82rem', color: '#ebdceb', margin: 0, lineHeight: '1.45' }}>
              We have dispatched your complete itinerary, reservation voucher, and details to your registered email:
            </p>
            <div style={styles.emailPill}>
              {recipientEmail}
            </div>

            {emailInfo?.previewUrl && (
              <a
                href={emailInfo.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.previewLink}
              >
                <span>View sent email preview (Test Inbox)</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Details Summary Card */}
        <div style={styles.detailsCard}>
          {/* Reference Row */}
          <div style={styles.referenceRow}>
            <div>
              <span style={styles.fieldLabel}>BOOKING REFERENCE</span>
              <span style={styles.refCode}>{referenceCode}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyRef}
              style={styles.copyBtn}
              title="Copy Booking Reference"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div style={styles.divider} />

          {/* Service Title */}
          <div style={{ marginBottom: '0.85rem' }}>
            <span style={styles.fieldLabel}>{booking.itemType ? `${booking.itemType.toUpperCase()} DETAILS` : 'RESERVATION'}</span>
            <h4 style={styles.itemName}>{itemTitle}</h4>
            {itemLocation && (
              <p style={styles.itemLoc}>
                <MapPin size={12} color="#d4af37" style={{ display: 'inline', marginRight: 3 }} />
                {itemLocation}
              </p>
            )}
          </div>

          {/* Grid Information */}
          <div style={styles.detailsGrid}>
            <div>
              <span style={styles.fieldLabel}>DATES</span>
              <p style={styles.fieldValue}>
                <Calendar size={13} color="#d4af37" style={{ display: 'inline', marginRight: 4 }} />
                {startDateFormatted}
                {endDateFormatted && endDateFormatted !== startDateFormatted ? ` – ${endDateFormatted}` : ''}
              </p>
            </div>

            <div>
              <span style={styles.fieldLabel}>TRAVELERS</span>
              <p style={styles.fieldValue}>
                <Users size={13} color="#d4af37" style={{ display: 'inline', marginRight: 4 }} />
                {booking.guests} Guest{booking.guests > 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <span style={styles.fieldLabel}>PRIMARY TRAVELER</span>
              <p style={styles.fieldValue}>
                {booking.fullName || 'Valued Guest'}
              </p>
              {booking.contactPhone && (
                <span style={{ fontSize: '0.75rem', color: '#bda3c4', display: 'block' }}>
                  {booking.contactPhone}
                </span>
              )}
            </div>

            <div>
              <span style={styles.fieldLabel}>PAYMENT STATUS</span>
              <span className="badge badge-warning" style={{ fontSize: '0.72rem', display: 'inline-block', marginTop: 2 }}>
                Pending on Arrival
              </span>
            </div>
          </div>

          {booking.specialRequests && (
            <div style={styles.requestsBox}>
              <span style={styles.fieldLabel}>SPECIAL REQUESTS</span>
              <p style={{ fontSize: '0.82rem', color: '#ebdceb', margin: '0.2rem 0 0 0', fontStyle: 'italic' }}>
                "{booking.specialRequests}"
              </p>
            </div>
          )}

          <div style={styles.divider} />

          {/* Total Price Row */}
          <div style={styles.totalRow}>
            <div>
              <span style={styles.fieldLabel}>TOTAL AMOUNT</span>
              <span style={{ fontSize: '0.75rem', color: '#bda3c4', display: 'block' }}>All taxes & fees included</span>
            </div>
            <div style={styles.totalAmount}>
              {displayAmount}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.75rem' }}
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onViewBookings) onViewBookings();
            }}
            className="btn btn-gold"
            style={{ flex: 1.5, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', fontWeight: '800' }}
          >
            <span>View My Bookings</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(5, 2, 8, 0.9)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
    padding: '1rem'
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '94vh',
    overflowY: 'auto',
    background: '#1a0b1d',
    border: '1px solid rgba(212, 175, 55, 0.55)',
    borderRadius: '10px',
    padding: '2rem',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.15)',
    color: '#f8fafc'
  },
  closeBtn: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.25rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    color: '#f7e7be',
    borderRadius: '4px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
    marginTop: '0.5rem'
  },
  pulseCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '2px solid rgba(16, 185, 129, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)'
  },
  title: {
    fontSize: '1.85rem',
    fontWeight: '800',
    fontFamily: 'var(--font-serif)',
    color: '#f7e7be',
    margin: '0.25rem 0',
    lineHeight: '1.2'
  },
  subTitle: {
    fontSize: '0.88rem',
    color: '#bda3c4',
    margin: 0
  },
  emailBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.85rem',
    padding: '1rem',
    background: 'linear-gradient(135deg, rgba(36, 17, 41, 0.9) 0%, rgba(56, 20, 63, 0.8) 100%)',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
  },
  emailIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: 'rgba(212, 175, 55, 0.15)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  emailPill: {
    display: 'inline-block',
    marginTop: '0.4rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '4px',
    background: 'rgba(21, 9, 23, 0.9)',
    border: '1px solid rgba(212, 175, 55, 0.45)',
    color: '#f7e7be',
    fontSize: '0.82rem',
    fontWeight: '700',
    wordBreak: 'break-all'
  },
  previewLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.5rem',
    color: '#38bdf8',
    fontSize: '0.78rem',
    textDecoration: 'none',
    fontWeight: '600'
  },
  detailsCard: {
    background: 'rgba(31, 14, 34, 0.75)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    borderRadius: '6px',
    padding: '1.25rem',
    marginBottom: '1.5rem'
  },
  referenceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  fieldLabel: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#d4af37',
    letterSpacing: '0.6px',
    display: 'block'
  },
  refCode: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#f7e7be',
    fontFamily: 'monospace',
    letterSpacing: '1px'
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'rgba(21, 9, 23, 0.8)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: '#ebdceb',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    margin: '0.85rem 0'
  },
  itemName: {
    fontSize: '1.15rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    margin: '0.2rem 0 0 0'
  },
  itemLoc: {
    fontSize: '0.82rem',
    color: '#bda3c4',
    margin: '0.2rem 0 0 0'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.85rem'
  },
  fieldValue: {
    fontSize: '0.86rem',
    fontWeight: '600',
    color: '#f8fafc',
    margin: '0.2rem 0 0 0'
  },
  requestsBox: {
    marginTop: '0.75rem',
    padding: '0.65rem 0.85rem',
    background: 'rgba(21, 9, 23, 0.6)',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.15)'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#10b981',
    fontFamily: 'var(--font-serif)'
  },
  actions: {
    display: 'flex',
    gap: '0.75rem'
  }
};

export default BookingConfirmationModal;


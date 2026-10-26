import React, { useState, useEffect } from 'react';
import { hotelService } from '../../services/hotelService';
import { experienceService } from '../../services/experienceService';
import { transportService } from '../../services/transportService';
import { destinationService } from '../../services/destinationService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { PlusCircle, Building, Sparkles, Car, Utensils, CheckCircle } from 'lucide-react';

const ManageListings = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('hotel');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hotel Form State
  const [hotelForm, setHotelForm] = useState({
    name: '',
    destination: '',
    address: '',
    city: '',
    description: '',
    startingPrice: 100,
    amenities: 'WiFi, Pool, Breakfast'
  });

  // Experience Form State
  const [expForm, setExpForm] = useState({
    title: '',
    destination: '',
    category: 'Trekking',
    description: '',
    pricePerPerson: 50,
    duration: '3 Hours'
  });

  // Transport Form State
  const [transForm, setTransForm] = useState({
    title: '',
    type: 'Car Rental',
    city: '',
    pricePerDay: 60,
    vehicleModel: ''
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await destinationService.getDestinations();
      setDestinations(res.data || []);
      if (res.data && res.data.length > 0) {
        setHotelForm(prev => ({ ...prev, destination: res.data[0]._id }));
        setExpForm(prev => ({ ...prev, destination: res.data[0]._id }));
      }
    } catch (e) {
      // Non-blocking
    }
  };

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...hotelForm,
        amenities: hotelForm.amenities.split(',').map(a => a.trim())
      };
      await hotelService.createHotel(payload);
      showNotification('Hotel listing published successfully!', 'success');
      setHotelForm({ name: '', destination: destinations[0]?._id || '', address: '', city: '', description: '', startingPrice: 100, amenities: 'WiFi, Pool, Breakfast' });
    } catch (err) {
      showNotification(err.message || 'Failed to publish hotel listing', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await experienceService.createExperience(expForm);
      showNotification('Experience activity published successfully!', 'success');
      setExpForm({ title: '', destination: destinations[0]?._id || '', category: 'Trekking', description: '', pricePerPerson: 50, duration: '3 Hours' });
    } catch (err) {
      showNotification(err.message || 'Failed to publish experience', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransport = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transportService.createTransport(transForm);
      showNotification('Vehicle rental listing published successfully!', 'success');
      setTransForm({ title: '', type: 'Car Rental', city: '', pricePerDay: 60, vehicleModel: '' });
    } catch (err) {
      showNotification(err.message || 'Failed to publish transport', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-warning">Vendor & Business Portal</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem' }}>Partner Listing Manager</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Add your hotel property, tour guided activities, or vehicle rental fleet to the IntelliTrip platform.
        </p>
      </div>

      {/* Tab Selectors */}
      <div style={styles.tabRow}>
        <button onClick={() => setActiveTab('hotel')} style={{ ...styles.tabBtn, background: activeTab === 'hotel' ? 'var(--color-primary)' : '#fff', color: activeTab === 'hotel' ? '#fff' : '#000' }}>
          <Building size={16} /> Add Hotel Property
        </button>
        <button onClick={() => setActiveTab('experience')} style={{ ...styles.tabBtn, background: activeTab === 'experience' ? 'var(--color-primary)' : '#fff', color: activeTab === 'experience' ? '#fff' : '#000' }}>
          <Sparkles size={16} /> Add Guided Experience
        </button>
        <button onClick={() => setActiveTab('transport')} style={{ ...styles.tabBtn, background: activeTab === 'transport' ? 'var(--color-primary)' : '#fff', color: activeTab === 'transport' ? '#fff' : '#000' }}>
          <Car size={16} /> Add Vehicle Rental
        </button>
      </div>

      <div className="glass-card" style={{ maxWidth: '640px', padding: '2rem' }}>
        {activeTab === 'hotel' && (
          <form onSubmit={handleCreateHotel} style={styles.form}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Register Hotel Property</h3>

            <div>
              <label style={styles.label}>Hotel Name</label>
              <input type="text" required value={hotelForm.name} onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })} placeholder="Grand Alpine Resort" style={styles.input} />
            </div>

            <div>
              <label style={styles.label}>Target Destination</label>
              <select value={hotelForm.destination} onChange={(e) => setHotelForm({ ...hotelForm, destination: e.target.value })} style={styles.input}>
                {destinations.map(d => <option key={d._id} value={d._id}>{d.name} ({d.city})</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={styles.label}>City</label>
                <input type="text" required value={hotelForm.city} onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })} placeholder="Manali" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Starting Nightly Rate ($)</label>
                <input type="number" required value={hotelForm.startingPrice} onChange={(e) => setHotelForm({ ...hotelForm, startingPrice: Number(e.target.value) })} style={styles.input} />
              </div>
            </div>

            <div>
              <label style={styles.label}>Address</label>
              <input type="text" required value={hotelForm.address} onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })} placeholder="Old Manali Road" style={styles.input} />
            </div>

            <div>
              <label style={styles.label}>Property Description</label>
              <textarea required rows={3} value={hotelForm.description} onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })} placeholder="Luxury resort overview..." style={styles.input} />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.8rem' }}>
              <PlusCircle size={18} /> {loading ? 'Publishing...' : 'Publish Hotel Listing'}
            </button>
          </form>
        )}

        {activeTab === 'experience' && (
          <form onSubmit={handleCreateExp} style={styles.form}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Publish Guided Activity</h3>

            <div>
              <label style={styles.label}>Activity Title</label>
              <input type="text" required value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} placeholder="Tandem Paragliding Flight" style={styles.input} />
            </div>

            <div>
              <label style={styles.label}>Category</label>
              <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} style={styles.input}>
                {['Trekking', 'Water Sports', 'Food Tour', 'Cultural Walk', 'Heritage Tour', 'Safari', 'Camping'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={styles.label}>Price per person ($)</label>
                <input type="number" required value={expForm.pricePerPerson} onChange={(e) => setExpForm({ ...expForm, pricePerPerson: Number(e.target.value) })} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Duration</label>
                <input type="text" value={expForm.duration} onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })} placeholder="2 Hours" style={styles.input} />
              </div>
            </div>

            <div>
              <label style={styles.label}>Description</label>
              <textarea required rows={3} value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} placeholder="Detailed activity description..." style={styles.input} />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.8rem' }}>
              <PlusCircle size={18} /> {loading ? 'Publishing...' : 'Publish Experience'}
            </button>
          </form>
        )}

        {activeTab === 'transport' && (
          <form onSubmit={handleCreateTransport} style={styles.form}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add Rental Vehicle</h3>

            <div>
              <label style={styles.label}>Vehicle / Fleet Title</label>
              <input type="text" required value={transForm.title} onChange={(e) => setTransForm({ ...transForm, title: e.target.value })} placeholder="Mahindra Thar 4x4 Convertible" style={styles.input} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={styles.label}>Vehicle Type</label>
                <select value={transForm.type} onChange={(e) => setTransForm({ ...transForm, type: e.target.value })} style={styles.input}>
                  {['Taxi', 'Bus', 'Car Rental', 'Bike Rental'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Daily Rental Rate ($)</label>
                <input type="number" required value={transForm.pricePerDay} onChange={(e) => setTransForm({ ...transForm, pricePerDay: Number(e.target.value) })} style={styles.input} />
              </div>
            </div>

            <div>
              <label style={styles.label}>City Location</label>
              <input type="text" required value={transForm.city} onChange={(e) => setTransForm({ ...transForm, city: e.target.value })} placeholder="Manali" style={styles.input} />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.8rem' }}>
              <PlusCircle size={18} /> {loading ? 'Publishing...' : 'Publish Vehicle'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  tabRow: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap'
  },
  tabBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'block',
    marginBottom: '0.3rem'
  },
  input: {
    width: '100%',
    padding: '0.7rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    fontSize: '0.85rem',
    outline: 'none',
    background: '#ffffff'
  }
};

export default ManageListings;

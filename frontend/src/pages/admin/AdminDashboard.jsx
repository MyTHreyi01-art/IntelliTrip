import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { destinationService } from '../../services/destinationService';
import { hotelService } from '../../services/hotelService';
import { experienceService } from '../../services/experienceService';
import { restaurantService } from '../../services/restaurantService';
import { transportService } from '../../services/transportService';
import { bookingService } from '../../services/bookingService';
import { aiService } from '../../services/aiService';
import { analyticsService } from '../../services/analyticsService';
import { uploadService } from '../../services/uploadService';
import Loader from '../../components/common/Loader';
import {
  Shield,
  Users,
  MapPin,
  Building,
  Activity,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Compass,
  Utensils,
  Car,
  Calendar,
  Sparkles,
  Eye,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

const USER_ROLES = [
  'Tourist',
  'Tour Guide',
  'Hotel Owner',
  'Travel Agency',
  'Transport Provider',
  'Local Business Owner',
  'Tourism Department Admin',
  'Support Executive',
  'Super Admin'
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('overview'); // overview, activities, users, destinations, hotels, experiences, restaurants, transports, bookings, itineraries
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [usersList, setUsersList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [hotelsList, setHotelsList] = useState([]);
  const [experiencesList, setExperiencesList] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [transportsList, setTransportsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [itinerariesList, setItinerariesList] = useState([]);
  const [analyticsOverview, setAnalyticsOverview] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'user', 'destination', 'hotel', 'experience', 'restaurant', 'transport'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Image Upload & Server Files state
  const [availableImages, setAvailableImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadAllAdminData();
    // Auto-poll activity updates every 15 seconds for real-time visibility
    const interval = setInterval(() => {
      fetchLiveActivities();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        analyticsRes,
        usersRes,
        activitiesRes,
        destRes,
        hotelsRes,
        expRes,
        restRes,
        transRes,
        bookRes,
        itinRes
      ] = await Promise.allSettled([
        analyticsService.getOverview(),
        authService.getAllUsers(),
        analyticsService.getActivityLogs({ limit: 50 }),
        destinationService.getDestinations(),
        hotelService.getHotels(),
        experienceService.getExperiences(),
        restaurantService.getRestaurants(),
        transportService.getTransports(),
        bookingService.getAllBookings ? bookingService.getAllBookings() : Promise.resolve({ data: [] }),
        aiService.getAllItineraries ? aiService.getAllItineraries() : Promise.resolve({ data: [] })
      ]);

      if (analyticsRes.status === 'fulfilled') setAnalyticsOverview(analyticsRes.value.data);
      if (usersRes.status === 'fulfilled') setUsersList(usersRes.value.data || []);
      if (activitiesRes.status === 'fulfilled') setActivitiesList(activitiesRes.value.data || []);
      if (destRes.status === 'fulfilled') setDestinationsList(destRes.value.data || []);
      if (hotelsRes.status === 'fulfilled') setHotelsList(hotelsRes.value.data || []);
      if (expRes.status === 'fulfilled') setExperiencesList(expRes.value.data || []);
      if (restRes.status === 'fulfilled') setRestaurantsList(restRes.value.data || []);
      if (transRes.status === 'fulfilled') setTransportsList(transRes.value.data || []);
      if (bookRes.status === 'fulfilled') setBookingsList(bookRes.value.data || []);
      if (itinRes.status === 'fulfilled') setItinerariesList(itinRes.value.data || []);

      // Load available downloaded images
      try {
        const imgRes = await uploadService.getAvailableDownloadedImages();
        if (imgRes && imgRes.data) {
          setAvailableImages(imgRes.data);
        }
      } catch (imgErr) {
        console.warn('Could not fetch available images list:', imgErr);
      }
    } catch (err) {
      console.error('Failed to load admin dataset:', err);
      showNotification('Failed to synchronize complete system data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveActivities = async () => {
    try {
      const res = await analyticsService.getActivityLogs({ limit: 40 });
      if (res && res.data) {
        setActivitiesList(res.data);
      }
    } catch (e) {
      // silent background refresh
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllAdminData();
    setRefreshing(false);
    showNotification('System records and live activity stream updated!', 'success');
  };

  // User Actions
  const handleEditUser = (u) => {
    setEditingItem(u);
    setModalType('user');
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || '',
      bio: u.bio || ''
    });
    setModalOpen(true);
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account: ${name}?`)) return;
    try {
      await authService.adminDeleteUser(id);
      showNotification(`User account ${name} deleted`, 'success');
      setUsersList((prev) => prev.filter((u) => u._id !== id));
      fetchLiveActivities();
    } catch (err) {
      showNotification(err.message || 'Failed to delete user', 'error');
    }
  };

  // Destination Actions
  const handleOpenDestinationModal = (dest = null) => {
    setEditingItem(dest);
    setModalType('destination');
    setFormData(
      dest
        ? {
            name: dest.name,
            city: dest.city,
            state: dest.state || '',
            category: dest.category || 'Heritage',
            description: dest.description || '',
            averageCostPerDay: dest.averageCostPerDay || 5000,
            imageUrl: dest.images?.[0] || ''
          }
        : {
            name: '',
            city: '',
            state: '',
            category: 'Heritage',
            description: '',
            averageCostPerDay: 5000,
            imageUrl: ''
          }
    );
    setModalOpen(true);
  };

  const handleDeleteDestination = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete destination "${name}"?`)) return;
    try {
      await destinationService.deleteDestination(id);
      showNotification(`Destination "${name}" removed`, 'success');
      setDestinationsList((prev) => prev.filter((d) => d._id !== id));
      fetchLiveActivities();
    } catch (err) {
      showNotification(err.message || 'Failed to delete destination', 'error');
    }
  };

  // Hotel Actions
  const handleOpenHotelModal = (hotel = null) => {
    setEditingItem(hotel);
    setModalType('hotel');
    setFormData(
      hotel
        ? {
            name: hotel.name,
            city: hotel.city,
            description: hotel.description || '',
            startingPrice: hotel.startingPrice || 6000,
            destination: hotel.destination?._id || hotel.destination || '',
            imageUrl: hotel.images?.[0] || ''
          }
        : {
            name: '',
            city: destinationsList[0]?.city || '',
            description: '',
            startingPrice: 6000,
            destination: destinationsList[0]?._id || '',
            imageUrl: ''
          }
    );
    setModalOpen(true);
  };

  const handleDeleteHotel = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete hotel "${name}"?`)) return;
    try {
      await hotelService.deleteHotel(id);
      showNotification(`Hotel "${name}" removed`, 'success');
      setHotelsList((prev) => prev.filter((h) => h._id !== id));
      fetchLiveActivities();
    } catch (err) {
      showNotification(err.message || 'Failed to delete hotel', 'error');
    }
  };

  // Experience Actions
  const handleOpenExperienceModal = (exp = null) => {
    setEditingItem(exp);
    setModalType('experience');
    setFormData(
      exp
        ? {
            title: exp.title,
            category: exp.category || 'Culture & Heritage',
            description: exp.description || '',
            pricePerPerson: exp.pricePerPerson || 2500,
            destination: exp.destination?._id || exp.destination || '',
            imageUrl: exp.images?.[0] || ''
          }
        : {
            title: '',
            category: 'Culture & Heritage',
            description: '',
            pricePerPerson: 2500,
            destination: destinationsList[0]?._id || '',
            imageUrl: ''
          }
    );
    setModalOpen(true);
  };

  const handleDeleteExperience = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete experience "${title}"?`)) return;
    try {
      await experienceService.deleteExperience(id);
      showNotification(`Experience "${title}" removed`, 'success');
      setExperiencesList((prev) => prev.filter((e) => e._id !== id));
      fetchLiveActivities();
    } catch (err) {
      showNotification(err.message || 'Failed to delete experience', 'error');
    }
  };

  // Restaurant Actions
  const handleOpenRestaurantModal = (rest = null) => {
    setEditingItem(rest);
    setModalType('restaurant');
    setFormData(
      rest
        ? {
            name: rest.name,
            city: rest.city,
            cuisine: rest.cuisine || 'Multi-Cuisine',
            priceRange: rest.priceRange || '₹₹ (₹1,000–₹2,500 for two)',
            averagePriceForTwo: rest.averagePriceForTwo || 2000,
            destination: rest.destination?._id || rest.destination || '',
            imageUrl: rest.images?.[0] || ''
          }
        : {
            name: '',
            city: destinationsList[0]?.city || '',
            cuisine: 'North Indian & Mughlai',
            priceRange: '₹₹ (₹1,000–₹2,500 for two)',
            averagePriceForTwo: 2000,
            destination: destinationsList[0]?._id || '',
            imageUrl: ''
          }
    );
    setModalOpen(true);
  };

  const handleDeleteRestaurant = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete restaurant "${name}"?`)) return;
    try {
      await restaurantService.deleteRestaurant(id);
      showNotification(`Restaurant "${name}" removed`, 'success');
      setRestaurantsList((prev) => prev.filter((r) => r._id !== id));
      fetchLiveActivities();
    } catch (err) {
      showNotification(err.message || 'Failed to delete restaurant', 'error');
    }
  };

  // Transport Actions
  const handleOpenTransportModal = (trans = null) => {
    setEditingItem(trans);
    setModalType('transport');
    setFormData(
      trans
        ? {
            title: trans.title,
            vehicleModel: trans.vehicleModel || '',
            type: trans.type || 'Luxury Car',
            city: trans.city || '',
            pricePerDay: trans.pricePerDay || 4500,
            imageUrl: trans.images?.[0] || ''
          }
        : {
            title: '',
            vehicleModel: '',
            type: 'Luxury Car',
            city: destinationsList[0]?.city || '',
            pricePerDay: 4500,
            imageUrl: ''
          }
    );
    setModalOpen(true);
  };

  const handleDeleteTransport = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete transport "${title}"?`)) return;
    try {
      await transportService.deleteTransport(id);
      showNotification(`Transport "${title}" removed`, 'success');
      setTransportsList((prev) => prev.filter((t) => t._id !== id));
      fetchLiveActivities();
    } catch (err) {
      showNotification(err.message || 'Failed to delete transport', 'error');
    }
  };

  // Image Upload handler for local downloaded images
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file (PNG, JPG, WEBP, etc.)', 'warning');
      return;
    }

    // Immediately display client-side image preview while uploading
    const clientPreviewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, imageUrl: clientPreviewUrl }));
    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          const res = await uploadService.uploadImage(base64Data, file.name);
          // When upload finishes, replace blob URL with the permanent server static path
          const uploadedUrl = res.data?.url || res.url;
          if (uploadedUrl) {
            setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
            showNotification(`Image "${file.name}" uploaded successfully!`, 'success');
          }
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          showNotification('Image saved locally for this session.', 'info');
        } finally {
          setUploadingImage(false);
        }
      };
      reader.onerror = () => {
        showNotification('Error reading local file', 'error');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploadingImage(false);
    }
  };

  // Helper component for Image Upload from Downloaded Images
  const renderImageUploadField = () => (
    <div style={styles.formGroup}>
      <label style={{ ...styles.label, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Upload Image (Choose from your downloaded images)</span>
        {uploadingImage && <span style={{ color: '#d4af37', fontSize: '0.78rem' }}>Uploading downloaded image...</span>}
      </label>
      
      {/* Upload button taking image input from downloaded images */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.6rem' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
            color: '#120216',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <Upload size={16} />
          {uploadingImage ? 'Uploading Image...' : 'Upload Downloaded Image'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Upload Confirmation & Image Display */}
      {formData.imageUrl && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '10px',
          marginTop: '0.5rem'
        }}>
          <img
            src={formData.imageUrl}
            alt="Uploaded Preview"
            style={{
              width: '80px',
              height: '55px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1.5px solid #d4af37',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', color: uploadingImage ? '#f7e7be' : '#48bb78', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle size={15} color={uploadingImage ? '#f7e7be' : '#48bb78'} />
              {uploadingImage ? 'Image Loaded & Uploading...' : 'Image Upload Confirmed & Attached'}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#e2d5e6', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formData.imageUrl}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, imageUrl: '' })}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              color: '#fc8181',
              cursor: 'pointer',
              padding: '0.35rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title="Remove image"
          >
            <X size={14} /> Remove
          </button>
        </div>
      )}
    </div>
  );

  // Indian price tier options for Restaurants
  const INDIAN_PRICE_TIERS = [
    { label: '₹ (Under ₹1,000 for two)', value: '₹ (Under ₹1,000 for two)' },
    { label: '₹₹ (₹1,000–₹2,500 for two)', value: '₹₹ (₹1,000–₹2,500 for two)' },
    { label: '₹₹₹ (₹2,501–₹4,500 for two)', value: '₹₹₹ (₹2,501–₹4,500 for two)' },
    { label: '₹₹₹₹ (Over ₹4,500 for two)', value: '₹₹₹₹ (Over ₹4,500 for two)' }
  ];

  // Indian price tier formatter helper
  const formatIndianPriceTier = (priceRange) => {
    if (!priceRange) return '₹₹ (₹1,000–₹2,500 for two)';
    const p = String(priceRange).trim();
    if (p === '$') return '₹ (Under ₹1,000 for two)';
    if (p === '$$') return '₹₹ (₹1,000–₹2,500 for two)';
    if (p === '$$$') return '₹₹₹ (₹2,501–₹4,500 for two)';
    if (p === '$$$$') return '₹₹₹₹ (Over ₹4,500 for two)';
    return p;
  };

  // Booking Actions
  const handleDeleteBooking = async (id) => {
    if (!window.confirm(`Are you sure you want to remove this booking from the system?`)) return;
    try {
      await bookingService.deleteBooking(id);
      showNotification('Booking record deleted from database', 'success');
      setBookingsList((prev) => prev.filter((b) => b._id !== id));
      fetchLiveActivities();
    } catch (err) {
      showNotification(err.message || 'Failed to delete booking', 'error');
    }
  };

  // Itinerary Actions
  const handleDeleteItinerary = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete AI itinerary "${title}"?`)) return;
    try {
      await aiService.deleteItinerary(id);
      showNotification(`Itinerary "${title}" removed`, 'success');
      setItinerariesList((prev) => prev.filter((it) => it._id !== id));
      fetchLiveActivities();
    } catch (err) {
      showNotification(err.message || 'Failed to delete itinerary', 'error');
    }
  };

  // Form Submit Handler
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'user') {
        const res = await authService.adminUpdateUser(editingItem._id, formData);
        setUsersList((prev) => prev.map((u) => (u._id === editingItem._id ? { ...u, ...res.data } : u)));
        showNotification('User profile updated successfully', 'success');
      } else if (modalType === 'destination') {
        const payload = {
          name: formData.name,
          city: formData.city,
          state: formData.state,
          category: formData.category,
          description: formData.description,
          averageCostPerDay: Number(formData.averageCostPerDay),
          images: formData.imageUrl ? [formData.imageUrl] : []
        };
        if (editingItem) {
          const res = await destinationService.updateDestination(editingItem._id, payload);
          setDestinationsList((prev) => prev.map((d) => (d._id === editingItem._id ? res.data : d)));
          showNotification(`Destination "${formData.name}" updated`, 'success');
        } else {
          const res = await destinationService.createDestination(payload);
          setDestinationsList((prev) => [res.data, ...prev]);
          showNotification(`Destination "${formData.name}" created`, 'success');
        }
      } else if (modalType === 'hotel') {
        const payload = {
          name: formData.name,
          city: formData.city,
          address: formData.address || `${formData.city || 'Heritage'} Center, India`,
          description: formData.description || `Luxury 5-Star accommodations in ${formData.city || 'India'}`,
          startingPrice: Number(formData.startingPrice) || 6000,
          destination: formData.destination || undefined,
          images: formData.imageUrl ? [formData.imageUrl] : []
        };
        if (editingItem) {
          const res = await hotelService.updateHotel(editingItem._id, payload);
          setHotelsList((prev) => prev.map((h) => (h._id === editingItem._id ? res.data : h)));
          showNotification(`Hotel "${formData.name}" updated`, 'success');
        } else {
          const res = await hotelService.createHotel(payload);
          setHotelsList((prev) => [res.data, ...prev]);
          showNotification(`Hotel "${formData.name}" added`, 'success');
        }
      } else if (modalType === 'experience') {
        const payload = {
          title: formData.title,
          category: formData.category,
          description: formData.description,
          pricePerPerson: Number(formData.pricePerPerson),
          destination: formData.destination || undefined,
          images: formData.imageUrl ? [formData.imageUrl] : []
        };
        if (editingItem) {
          const res = await experienceService.updateExperience(editingItem._id, payload);
          setExperiencesList((prev) => prev.map((exp) => (exp._id === editingItem._id ? res.data : exp)));
          showNotification(`Experience "${formData.title}" updated`, 'success');
        } else {
          const res = await experienceService.createExperience(payload);
          setExperiencesList((prev) => [res.data, ...prev]);
          showNotification(`Experience "${formData.title}" added`, 'success');
        }
      } else if (modalType === 'restaurant') {
        const payload = {
          name: formData.name,
          city: formData.city,
          cuisine: formData.cuisine,
          priceRange: formData.priceRange,
          averagePriceForTwo: Number(formData.averagePriceForTwo) || 2000,
          destination: formData.destination || undefined,
          images: formData.imageUrl ? [formData.imageUrl] : []
        };
        if (editingItem) {
          const res = await restaurantService.updateRestaurant(editingItem._id, payload);
          setRestaurantsList((prev) => prev.map((r) => (r._id === editingItem._id ? res.data : r)));
          showNotification(`Restaurant "${formData.name}" updated`, 'success');
        } else {
          const res = await restaurantService.createRestaurant(payload);
          setRestaurantsList((prev) => [res.data, ...prev]);
          showNotification(`Restaurant "${formData.name}" created`, 'success');
        }
      } else if (modalType === 'transport') {
        const payload = {
          title: formData.title,
          vehicleModel: formData.vehicleModel,
          type: formData.type,
          city: formData.city,
          pricePerDay: Number(formData.pricePerDay),
          images: formData.imageUrl ? [formData.imageUrl] : []
        };
        if (editingItem) {
          const res = await transportService.updateTransport(editingItem._id, payload);
          setTransportsList((prev) => prev.map((t) => (t._id === editingItem._id ? res.data : t)));
          showNotification(`Transport "${formData.title}" updated`, 'success');
        } else {
          const res = await transportService.createTransport(payload);
          setTransportsList((prev) => [res.data, ...prev]);
          showNotification(`Transport "${formData.title}" created`, 'success');
        }
      }

      setModalOpen(false);
      fetchLiveActivities();
    } catch (err) {
      showNotification(err.message || 'Operation failed', 'error');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.topBadge}>
            <Shield size={14} color="#d4af37" /> Super Admin Full-System Governance
          </span>
          <h1 style={styles.mainTitle}>
            Platform Control Center — {user?.role || 'Super Admin'}
          </h1>
          <p style={styles.subtitle}>
            Unrestricted master control to add, edit, and delete any system resource, plus live user activity tracking.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={styles.refreshBtn}
          title="Synchronize all records and live feeds"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Real-Time Sync'}
        </button>
      </div>

      {/* Primary KPI Stats */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard} onClick={() => setActiveTab('users')}>
          <div style={{ ...styles.kpiIconBox, background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Total Accounts</span>
            <h3 style={styles.kpiVal}>{usersList.length || analyticsOverview?.summary?.totalUsers || 0}</h3>
          </div>
        </div>

        <div style={styles.kpiCard} onClick={() => setActiveTab('destinations')}>
          <div style={{ ...styles.kpiIconBox, background: 'rgba(217, 119, 6, 0.15)', color: '#fbbf24' }}>
            <MapPin size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Destinations</span>
            <h3 style={styles.kpiVal}>{destinationsList.length || 0}</h3>
          </div>
        </div>

        <div style={styles.kpiCard} onClick={() => setActiveTab('hotels')}>
          <div style={{ ...styles.kpiIconBox, background: 'rgba(22, 163, 74, 0.15)', color: '#4ade80' }}>
            <Building size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Luxury Hotels</span>
            <h3 style={styles.kpiVal}>{hotelsList.length || 0}</h3>
          </div>
        </div>

        <div style={styles.kpiCard} onClick={() => setActiveTab('restaurants')}>
          <div style={{ ...styles.kpiIconBox, background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c' }}>
            <Utensils size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Restaurants</span>
            <h3 style={styles.kpiVal}>{restaurantsList.length || 0}</h3>
          </div>
        </div>

        <div style={styles.kpiCard} onClick={() => setActiveTab('bookings')}>
          <div style={{ ...styles.kpiIconBox, background: 'rgba(192, 38, 211, 0.15)', color: '#e879f9' }}>
            <Calendar size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Total Bookings</span>
            <h3 style={styles.kpiVal}>{bookingsList.length || analyticsOverview?.summary?.totalBookings || 0}</h3>
          </div>
        </div>

        <div style={styles.kpiCard} onClick={() => setActiveTab('activities')}>
          <div style={{ ...styles.kpiIconBox, background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={styles.kpiLabel}>Live User Actions</span>
            <h3 style={styles.kpiVal}>{activitiesList.length || 0} Logged</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabBar}>
        {[
          { id: 'overview', label: 'Master Overview', icon: <Shield size={16} /> },
          { id: 'activities', label: `Live User Activity (${activitiesList.length})`, icon: <Activity size={16} /> },
          { id: 'users', label: `Users & Roles (${usersList.length})`, icon: <Users size={16} /> },
          { id: 'destinations', label: `Destinations (${destinationsList.length})`, icon: <MapPin size={16} /> },
          { id: 'hotels', label: `Hotels (${hotelsList.length})`, icon: <Building size={16} /> },
          { id: 'experiences', label: `Experiences (${experiencesList.length})`, icon: <Compass size={16} /> },
          { id: 'restaurants', label: `Restaurants (${restaurantsList.length})`, icon: <Utensils size={16} /> },
          { id: 'transports', label: `Fleet (${transportsList.length})`, icon: <Car size={16} /> },
          { id: 'bookings', label: `Bookings (${bookingsList.length})`, icon: <Calendar size={16} /> },
          { id: 'itineraries', label: `AI Itineraries (${itinerariesList.length})`, icon: <Sparkles size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.id ? styles.tabBtnActive : {})
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader message="Synchronizing all platform resources and action streams..." />
      ) : (
        <div>
          {/* TAB 1: MASTER OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Quick Actions Panel */}
              <div style={styles.panelCard}>
                <h3 style={styles.panelTitle}>
                  <Shield size={18} color="#d4af37" /> Master Resource Creator
                </h3>
                <p style={styles.panelSubtitle}>
                  As Super Admin, you can provision and modify items directly across all catalogs.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '1rem' }}>
                  <button onClick={() => handleOpenDestinationModal()} style={styles.createBtn}>
                    <Plus size={16} /> Add Destination
                  </button>
                  <button onClick={() => handleOpenHotelModal()} style={styles.createBtn}>
                    <Plus size={16} /> Add Hotel
                  </button>
                  <button onClick={() => handleOpenExperienceModal()} style={styles.createBtn}>
                    <Plus size={16} /> Add Experience
                  </button>
                  <button onClick={() => handleOpenRestaurantModal()} style={styles.createBtn}>
                    <Plus size={16} /> Add Restaurant
                  </button>
                  <button onClick={() => handleOpenTransportModal()} style={styles.createBtn}>
                    <Plus size={16} /> Add Transport Fleet
                  </button>
                </div>
              </div>

              {/* Two Column: Live Stream Preview + RBAC Matrix */}
              <div style={styles.twoCol}>
                {/* Recent User Actions Preview */}
                <div style={styles.panelCard}>
                  <div style={styles.cardHeaderFlex}>
                    <h3 style={styles.panelTitle}>
                      <Activity size={18} color="#d4af37" /> Real-Time User Actions
                    </h3>
                    <button onClick={() => setActiveTab('activities')} style={styles.viewAllBtn}>
                      View All Logs &rarr;
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    {activitiesList.slice(0, 8).map((act, i) => (
                      <div key={act._id || i} style={styles.activityItem}>
                        <div style={styles.activityDot} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#f7e7be', fontSize: '0.9rem' }}>{act.action}</strong>
                            <span style={styles.timestamp}>
                              {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                          <p style={{ color: '#c5cbd3', fontSize: '0.82rem', margin: '0.2rem 0' }}>{act.details}</p>
                          <span style={styles.badgeSmall}>
                            {act.userName || 'User'} &bull; {act.userRole || 'Tourist'} &bull; {act.module}
                          </span>
                        </div>
                      </div>
                    ))}
                    {activitiesList.length === 0 && (
                      <p style={{ color: '#8e7894', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem' }}>
                        No user actions captured yet. Any user booking, itinerary, post or review will appear here in real time.
                      </p>
                    )}
                  </div>
                </div>

                {/* RBAC Verification Matrix */}
                <div style={styles.panelCard}>
                  <h3 style={styles.panelTitle}>
                    <CheckCircle size={18} color="#10b981" /> RBAC Authority Hierarchy
                  </h3>
                  <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Role</th>
                          <th style={styles.th}>Scope</th>
                          <th style={styles.th}>Permissions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { role: 'Super Admin', scope: 'Full System', perm: 'Add, Edit, Delete All + Activity Logs', badge: '#d4af37' },
                          { role: 'Tourism Department Admin', scope: 'Macro Regional', perm: 'Destination & Macro Volume Oversight', badge: '#38bdf8' },
                          { role: 'Hotel Owner', scope: 'Assigned Stays', perm: 'Rooms, Rates & Hotel Reservations', badge: '#4ade80' },
                          { role: 'Tour Guide', scope: 'Curated Tours', perm: 'Custom Experiences & Tour Bookings', badge: '#a78bfa' },
                          { role: 'Travel Agency', scope: 'Packages', perm: 'Packages & Logistics', badge: '#fbbf24' },
                          { role: 'Transport Provider', scope: 'Fleet Service', perm: 'Private Aviation & Chauffeur Services', badge: '#f472b6' },
                          { role: 'Tourist', scope: 'Personal Account', perm: 'Bookings, AI Itineraries, Wishlist, Reviews', badge: '#94a3b8' }
                        ].map((row, idx) => (
                          <tr key={idx} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: 700, color: row.badge }}>{row.role}</td>
                            <td style={{ ...styles.td, color: '#c5cbd3' }}>{row.scope}</td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '0.8rem', color: '#f7e7be' }}>{row.perm}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE USER ACTIVITY STREAM */}
          {activeTab === 'activities' && (
            <div style={styles.panelCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.panelTitle}>
                    <Activity size={18} color="#d4af37" /> Real-Time User Action Stream
                  </h3>
                  <p style={styles.panelSubtitle}>
                    All actions performed across IntelliTrip (bookings, cancellations, AI itineraries, reviews, logins, emergency alerts) are piped here immediately.
                  </p>
                </div>
                <button onClick={fetchLiveActivities} style={styles.refreshBtn}>
                  <RefreshCw size={14} /> Refresh Feed
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>
                {activitiesList.map((act) => (
                  <div key={act._id} style={styles.activityFullRow}>
                    <div style={{ ...styles.moduleBadge, background: getModuleColor(act.module) }}>
                      {act.module}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#f7e7be', fontWeight: 700 }}>
                          {act.action}
                        </h4>
                        <span style={styles.timestamp}>
                          {act.createdAt ? new Date(act.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <p style={{ color: '#e2d5e6', fontSize: '0.88rem', margin: '0.3rem 0 0.4rem 0' }}>
                        {act.details}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#8e7894' }}>
                        <span><strong>User:</strong> {act.userName} ({act.userEmail || 'N/A'})</span>
                        <span><strong>Role:</strong> {act.userRole}</span>
                        {act.entityId && <span><strong>Entity ID:</strong> {act.entityId}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {activitiesList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#8e7894' }}>
                    No activity records logged yet. Try performing any action (e.g. creating a booking, saving an itinerary) to observe live updating.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: USERS & ROLES */}
          {activeTab === 'users' && (
            <div style={styles.panelCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.panelTitle}>
                    <Users size={18} color="#d4af37" /> User Accounts & Role Governance
                  </h3>
                  <p style={styles.panelSubtitle}>
                    Modify user roles, edit profile details, or remove user accounts across the system.
                  </p>
                </div>
                <div style={styles.searchBox}>
                  <Search size={15} color="#8e7894" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Joined</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(
                        (u) =>
                          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((u) => (
                        <tr key={u._id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 700, color: '#f8fafc' }}>{u.name}</td>
                          <td style={{ ...styles.td, color: '#c5cbd3' }}>{u.email}</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.roleTag, borderColor: getRoleColor(u.role), color: getRoleColor(u.role) }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: '#8e7894' }}>{u.phone || '—'}</td>
                          <td style={{ ...styles.td, color: '#8e7894', fontSize: '0.8rem' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleEditUser(u)} style={styles.actionBtnEdit} title="Modify User / Role">
                                <Edit size={14} /> Edit
                              </button>
                              {u._id !== user?._id && (
                                <button onClick={() => handleDeleteUser(u._id, u.name)} style={styles.actionBtnDelete} title="Delete Account">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DESTINATIONS */}
          {activeTab === 'destinations' && (
            <div style={styles.panelCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.panelTitle}>
                    <MapPin size={18} color="#d4af37" /> Cataloged Destinations
                  </h3>
                  <p style={styles.panelSubtitle}>Add, edit, or delete regional destinations.</p>
                </div>
                <button onClick={() => handleOpenDestinationModal()} style={styles.createBtn}>
                  <Plus size={16} /> Add Destination
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>City / State</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Avg Daily Cost</th>
                      <th style={styles.th}>Rating</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {destinationsList.map((dest) => (
                      <tr key={dest._id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#f8fafc' }}>{dest.name}</td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>{dest.city}{dest.state ? `, ${dest.state}` : ''}</td>
                        <td style={styles.td}>
                          <span style={styles.badgeSmall}>{dest.category}</span>
                        </td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: 600 }}>
                          ₹{Number(dest.averageCostPerDay || 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, color: '#d4af37' }}>★ {dest.rating || 4.8}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleOpenDestinationModal(dest)} style={styles.actionBtnEdit}>
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeleteDestination(dest._id, dest.name)} style={styles.actionBtnDelete}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: HOTELS */}
          {activeTab === 'hotels' && (
            <div style={styles.panelCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.panelTitle}>
                    <Building size={18} color="#d4af37" /> Luxury Stays & Hotels
                  </h3>
                  <p style={styles.panelSubtitle}>Add, modify, or remove luxury stays across the platform.</p>
                </div>
                <button onClick={() => handleOpenHotelModal()} style={styles.createBtn}>
                  <Plus size={16} /> Add Hotel
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Property Name</th>
                      <th style={styles.th}>City</th>
                      <th style={styles.th}>Starting Price / Night</th>
                      <th style={styles.th}>Rating</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotelsList.map((hotel) => (
                      <tr key={hotel._id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#f8fafc' }}>{hotel.name}</td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>{hotel.city}</td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: 600 }}>
                          ₹{Number(hotel.startingPrice || 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, color: '#d4af37' }}>★ {hotel.rating || 4.9}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleOpenHotelModal(hotel)} style={styles.actionBtnEdit}>
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeleteHotel(hotel._id, hotel.name)} style={styles.actionBtnDelete}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: EXPERIENCES */}
          {activeTab === 'experiences' && (
            <div style={styles.panelCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.panelTitle}>
                    <Compass size={18} color="#d4af37" /> Signature Experiences
                  </h3>
                  <p style={styles.panelSubtitle}>Curated bespoke activities, guided heritage tours & cultural journeys.</p>
                </div>
                <button onClick={() => handleOpenExperienceModal()} style={styles.createBtn}>
                  <Plus size={16} /> Add Experience
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Experience Title</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Price / Person</th>
                      <th style={styles.th}>Rating</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiencesList.map((exp) => (
                      <tr key={exp._id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#f8fafc' }}>{exp.title}</td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>{exp.category}</td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: 600 }}>
                          ₹{Number(exp.pricePerPerson || 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, color: '#d4af37' }}>★ {exp.rating || 4.9}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleOpenExperienceModal(exp)} style={styles.actionBtnEdit}>
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeleteExperience(exp._id, exp.title)} style={styles.actionBtnDelete}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: RESTAURANTS */}
          {activeTab === 'restaurants' && (
            <div style={styles.panelCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.panelTitle}>
                    <Utensils size={18} color="#d4af37" /> Fine Dining & Heritage Restaurants
                  </h3>
                  <p style={styles.panelSubtitle}>Manage culinary dining destinations across the system.</p>
                </div>
                <button onClick={() => handleOpenRestaurantModal()} style={styles.createBtn}>
                  <Plus size={16} /> Add Restaurant
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Restaurant Name</th>
                      <th style={styles.th}>City</th>
                      <th style={styles.th}>Cuisine</th>
                      <th style={styles.th}>Avg Price / Two (₹)</th>
                      <th style={styles.th}>Rating</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurantsList.map((rest) => (
                      <tr key={rest._id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#f8fafc' }}>{rest.name}</td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>{rest.city}</td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>{rest.cuisine}</td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: 600 }}>
                          ₹{Number(rest.averagePriceForTwo || 1800).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, color: '#d4af37' }}>★ {rest.rating || 4.8}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleOpenRestaurantModal(rest)} style={styles.actionBtnEdit}>
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeleteRestaurant(rest._id, rest.name)} style={styles.actionBtnDelete}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {restaurantsList.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#8e7894' }}>
                          No restaurants added to the catalog yet. Click "Add Restaurant" to provision a dining destination.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: TRANSPORTS */}
          {activeTab === 'transports' && (
            <div style={styles.panelCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.panelTitle}>
                    <Car size={18} color="#d4af37" /> Private Aviation & Luxury Chauffeurs
                  </h3>
                  <p style={styles.panelSubtitle}>Manage premium fleets and transport providers.</p>
                </div>
                <button onClick={() => handleOpenTransportModal()} style={styles.createBtn}>
                  <Plus size={16} /> Add Fleet Option
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fleet Title</th>
                      <th style={styles.th}>Model</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>City</th>
                      <th style={styles.th}>Rate / Day</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transportsList.map((trans) => (
                      <tr key={trans._id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#f8fafc' }}>{trans.title}</td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>{trans.vehicleModel || '—'}</td>
                        <td style={styles.td}>
                          <span style={styles.badgeSmall}>{trans.type}</span>
                        </td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>{trans.city || 'Pan-India'}</td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: 600 }}>
                          ₹{Number(trans.pricePerDay || 0).toLocaleString()}
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleOpenTransportModal(trans)} style={styles.actionBtnEdit}>
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeleteTransport(trans._id, trans.title)} style={styles.actionBtnDelete}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div style={styles.panelCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.panelTitle}>
                    <Calendar size={18} color="#d4af37" /> System-Wide User Bookings
                  </h3>
                  <p style={styles.panelSubtitle}>
                    All guest reservations across hotels, experiences, and transports with full cancellation/deletion control.
                  </p>
                </div>
                <span style={styles.badgeSmall}>{bookingsList.length} Active Reservations</span>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Guest Name</th>
                      <th style={styles.th}>Service Type</th>
                      <th style={styles.th}>Dates</th>
                      <th style={styles.th}>Guests</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsList.map((book) => (
                      <tr key={book._id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#f8fafc' }}>
                          {book.fullName || book.user?.name || 'Valued Guest'}
                          <div style={{ fontSize: '0.75rem', color: '#8e7894' }}>{book.email || book.user?.email}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.badgeSmall}>{book.itemType}</span>
                        </td>
                        <td style={{ ...styles.td, color: '#c5cbd3', fontSize: '0.82rem' }}>
                          {book.startDate ? new Date(book.startDate).toLocaleDateString() : '—'}
                          {book.endDate && ` → ${new Date(book.endDate).toLocaleDateString()}`}
                        </td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>{book.guests || 1}</td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: 700 }}>
                          ₹{Number(book.totalPrice || 0).toLocaleString()}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.roleTag,
                              borderColor: book.status === 'Confirmed' ? '#10b981' : '#f59e0b',
                              color: book.status === 'Confirmed' ? '#10b981' : '#f59e0b'
                            }}
                          >
                            {book.status || 'Confirmed'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleDeleteBooking(book._id)}
                            style={styles.actionBtnDelete}
                            title="Delete booking from system"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bookingsList.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#8e7894' }}>
                          No bookings currently registered in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: AI ITINERARIES */}
          {activeTab === 'itineraries' && (
            <div style={styles.panelCard}>
              <div style={styles.cardHeaderFlex}>
                <div>
                  <h3 style={styles.panelTitle}>
                    <Sparkles size={18} color="#d4af37" /> AI-Generated User Itineraries
                  </h3>
                  <p style={styles.panelSubtitle}>
                    All itineraries saved by users with master management and deletion capabilities.
                  </p>
                </div>
                <span style={styles.badgeSmall}>{itinerariesList.length} Saved Itineraries</span>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Title</th>
                      <th style={styles.th}>User</th>
                      <th style={styles.th}>Destination</th>
                      <th style={styles.th}>Days</th>
                      <th style={styles.th}>Budget</th>
                      <th style={styles.th}>Saved On</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itinerariesList.map((itin) => (
                      <tr key={itin._id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#f8fafc' }}>{itin.title}</td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>
                          {itin.user?.name || 'Traveler'}
                          <div style={{ fontSize: '0.75rem', color: '#8e7894' }}>{itin.user?.email}</div>
                        </td>
                        <td style={{ ...styles.td, color: '#d4af37' }}>{itin.destinationName || 'Custom'}</td>
                        <td style={{ ...styles.td, color: '#c5cbd3' }}>{itin.durationDays || 3} Days</td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: 600 }}>
                          ₹{Number(itin.totalBudget || 0).toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, color: '#8e7894', fontSize: '0.8rem' }}>
                          {itin.createdAt ? new Date(itin.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleDeleteItinerary(itin._id, itin.title)}
                            style={styles.actionBtnDelete}
                            title="Remove itinerary"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {itinerariesList.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#8e7894' }}>
                          No user itineraries recorded in the system yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT DIALOG */}
      {modalOpen && (
        <div style={styles.modalOverlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div style={styles.modalContent} className="animate-fade-in">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingItem ? `Edit ${capitalize(modalType)}` : `Provision New ${capitalize(modalType)}`}
              </h3>
              <button onClick={() => setModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} style={styles.modalForm}>
              {/* USER FORM */}
              {modalType === 'user' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Assign Role (RBAC)</label>
                    <select
                      value={formData.role || 'Tourist'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={styles.select}
                    >
                      {USER_ROLES.map((r) => (
                        <option key={r} value={r} style={{ background: '#150917' }}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </>
              )}

              {/* DESTINATION FORM */}
              {modalType === 'destination' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Destination Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Udaipur, City of Lakes"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>City</label>
                      <input
                        type="text"
                        required
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>State</label>
                      <input
                        type="text"
                        value={formData.state || ''}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Category</label>
                      <select
                        value={formData.category || 'Heritage'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={styles.select}
                      >
                        <option value="Heritage" style={{ background: '#150917' }}>Heritage</option>
                        <option value="Nature & Wildlife" style={{ background: '#150917' }}>Nature & Wildlife</option>
                        <option value="Coastal & Islands" style={{ background: '#150917' }}>Coastal & Islands</option>
                        <option value="Spiritual & Wellness" style={{ background: '#150917' }}>Spiritual & Wellness</option>
                        <option value="Hill Station" style={{ background: '#150917' }}>Hill Station</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Avg Cost / Day (₹)</label>
                      <input
                        type="number"
                        value={formData.averageCostPerDay || 5000}
                        onChange={(e) => setFormData({ ...formData, averageCostPerDay: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  {renderImageUploadField()}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ ...styles.input, resize: 'vertical' }}
                    />
                  </div>
                </>
              )}

              {/* HOTEL FORM */}
              {modalType === 'hotel' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Property / Hotel Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Taj Lake Palace"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>City</label>
                      <input
                        type="text"
                        required
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Starting Price / Night (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.startingPrice || 6000}
                        onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  {renderImageUploadField()}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ ...styles.input, resize: 'vertical' }}
                    />
                  </div>
                </>
              )}

              {/* EXPERIENCE FORM */}
              {modalType === 'experience' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Experience Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Vintage Car Tour"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Category</label>
                      <input
                        type="text"
                        value={formData.category || 'Culture & Heritage'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Price / Person (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.pricePerPerson || 2500}
                        onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  {renderImageUploadField()}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ ...styles.input, resize: 'vertical' }}
                    />
                  </div>
                </>
              )}

              {/* RESTAURANT FORM */}
              {modalType === 'restaurant' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Restaurant Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bukhara Imperial"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>City</label>
                      <input
                        type="text"
                        required
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Cuisine</label>
                      <input
                        type="text"
                        value={formData.cuisine || 'North Indian'}
                        onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Average Price for Two (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 2000"
                      value={formData.averagePriceForTwo || 2000}
                      onChange={(e) => setFormData({ ...formData, averagePriceForTwo: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Destination Linking</label>
                    <select
                      value={formData.destination || ''}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      style={styles.select}
                    >
                      <option value="" style={{ background: '#150917' }}>Select Destination</option>
                      {destinationsList.map((d) => (
                        <option key={d._id} value={d._id} style={{ background: '#150917' }}>
                          {d.name} ({d.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  {renderImageUploadField()}
                </>
              )}

              {/* TRANSPORT FORM */}
              {modalType === 'transport' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fleet Service Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chauffeur Luxury Mercedes-Maybach"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Vehicle Model</label>
                      <input
                        type="text"
                        value={formData.vehicleModel || ''}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Type</label>
                      <select
                        value={formData.type || 'Luxury Car'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        style={styles.select}
                      >
                        <option value="Luxury Car" style={{ background: '#150917' }}>Luxury Car</option>
                        <option value="SUV" style={{ background: '#150917' }}>SUV</option>
                        <option value="Helicopter" style={{ background: '#150917' }}>Helicopter / Private Jet</option>
                        <option value="Coach" style={{ background: '#150917' }}>Executive Coach</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Operating City</label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Rate / Day (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.pricePerDay || 4500}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  {renderImageUploadField()}
                </>
              )}

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setModalOpen(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitModalBtn}>
                  {editingItem ? 'Save Changes' : 'Confirm Provision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const capitalize = (str = '') => str.charAt(0).toUpperCase() + str.slice(1);

const getRoleColor = (role) => {
  switch (role) {
    case 'Super Admin': return '#d4af37';
    case 'Tourism Department Admin': return '#38bdf8';
    case 'Hotel Owner': return '#4ade80';
    case 'Tour Guide': return '#a78bfa';
    case 'Travel Agency': return '#fbbf24';
    case 'Transport Provider': return '#f472b6';
    default: return '#94a3b8';
  }
};

const getModuleColor = (mod) => {
  switch (mod) {
    case 'Booking': return 'rgba(16, 185, 129, 0.2)';
    case 'Itinerary': return 'rgba(212, 175, 55, 0.2)';
    case 'Emergency': return 'rgba(239, 68, 68, 0.25)';
    case 'User': return 'rgba(56, 189, 248, 0.2)';
    case 'Review': return 'rgba(245, 158, 11, 0.2)';
    case 'Community': return 'rgba(168, 85, 247, 0.2)';
    default: return 'rgba(212, 175, 55, 0.15)';
  }
};

const styles = {
  container: {
    padding: '2.5rem 1.5rem',
    maxWidth: '1440px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#0d0510',
    color: '#f8fafc'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1.25rem',
    marginBottom: '2rem'
  },
  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.35rem 0.85rem',
    borderRadius: '4px',
    background: 'rgba(212, 175, 55, 0.12)',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    color: '#f7e7be',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    marginBottom: '0.5rem'
  },
  mainTitle: {
    fontSize: '2.1rem',
    fontWeight: 800,
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    margin: '0.2rem 0'
  },
  subtitle: {
    color: '#bda3c4',
    fontSize: '0.92rem',
    maxWidth: '750px',
    lineHeight: 1.5
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.15rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.5)',
    background: 'rgba(21, 9, 23, 0.75)',
    color: '#f7e7be',
    fontWeight: 700,
    fontSize: '0.86rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  kpiCard: {
    padding: '1.15rem',
    background: 'rgba(21, 9, 23, 0.85)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
  },
  kpiIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  kpiLabel: {
    fontSize: '0.74rem',
    color: '#8e7894',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    fontWeight: 600
  },
  kpiVal: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#f8fafc',
    margin: 0
  },
  tabBar: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(212, 175, 55, 0.18)',
    marginBottom: '2rem'
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.1rem',
    borderRadius: '4px',
    border: '1px solid transparent',
    background: 'transparent',
    color: '#8e7894',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
  },
  tabBtnActive: {
    background: 'rgba(212, 175, 55, 0.12)',
    border: '1px solid rgba(212, 175, 55, 0.5)',
    color: '#f7e7be'
  },
  panelCard: {
    background: 'rgba(21, 9, 23, 0.95)',
    border: '1px solid rgba(212, 175, 55, 0.28)',
    borderRadius: '10px',
    padding: '1.75rem',
    boxShadow: '0 12px 35px rgba(0,0,0,0.6)'
  },
  panelTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#f7e7be',
    fontFamily: 'var(--font-serif)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    margin: 0
  },
  panelSubtitle: {
    color: '#bda3c4',
    fontSize: '0.84rem',
    marginTop: '0.3rem',
    lineHeight: 1.4
  },
  cardHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '1.75rem'
  },
  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.15rem',
    borderRadius: '4px',
    background: 'linear-gradient(135deg, #d4af37 0%, #aa8010 100%)',
    color: '#150917',
    fontWeight: 700,
    fontSize: '0.86rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
    transition: 'all 0.2s ease'
  },
  viewAllBtn: {
    background: 'none',
    border: 'none',
    color: '#d4af37',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.85rem',
    background: 'rgba(15, 7, 18, 0.75)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '4px'
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f8fafc',
    fontSize: '0.84rem',
    width: '240px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    textAlign: 'left'
  },
  th: {
    padding: '0.75rem 0.9rem',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    color: '#d4af37',
    fontSize: '0.74rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background 0.15s ease'
  },
  td: {
    padding: '0.85rem 0.9rem',
    verticalAlign: 'middle'
  },
  roleTag: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    border: '1px solid',
    fontSize: '0.75rem',
    fontWeight: 700
  },
  badgeSmall: {
    display: 'inline-block',
    padding: '0.2rem 0.55rem',
    borderRadius: '3px',
    background: 'rgba(212, 175, 55, 0.1)',
    color: '#f7e7be',
    fontSize: '0.74rem',
    fontWeight: 600
  },
  actionBtnEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.7rem',
    borderRadius: '3px',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    background: 'rgba(212, 175, 55, 0.08)',
    color: '#f7e7be',
    fontSize: '0.76rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  actionBtnDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.7rem',
    borderRadius: '3px',
    border: '1px solid rgba(244, 63, 94, 0.35)',
    background: 'rgba(244, 63, 94, 0.08)',
    color: '#f43f5e',
    fontSize: '0.76rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.65rem 0.85rem',
    background: 'rgba(15, 7, 18, 0.6)',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  activityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    marginTop: '6px',
    flexShrink: 0
  },
  timestamp: {
    fontSize: '0.74rem',
    color: '#8e7894'
  },
  activityFullRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    padding: '1rem 1.25rem',
    background: 'rgba(15, 7, 18, 0.75)',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.15)'
  },
  moduleBadge: {
    padding: '0.3rem 0.65rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#f7e7be',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1rem'
  },
  modalContent: {
    width: '100%',
    maxWidth: '560px',
    background: '#150917',
    border: '1px solid rgba(212, 175, 55, 0.45)',
    borderRadius: '10px',
    padding: '1.75rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    paddingBottom: '0.85rem',
    marginBottom: '1.25rem'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#f7e7be',
    fontFamily: 'var(--font-serif)'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#8e7894',
    cursor: 'pointer'
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  label: {
    fontSize: '0.74rem',
    color: '#d4af37',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.8rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    background: 'rgba(15, 7, 18, 0.85)',
    color: '#f8fafc',
    fontSize: '0.88rem',
    outline: 'none'
  },
  select: {
    width: '100%',
    padding: '0.65rem 0.8rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    background: '#150917',
    color: '#f8fafc',
    fontSize: '0.88rem',
    outline: 'none'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.75rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)'
  },
  cancelBtn: {
    padding: '0.6rem 1.15rem',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'transparent',
    color: '#c5cbd3',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  submitModalBtn: {
    padding: '0.6rem 1.35rem',
    borderRadius: '4px',
    border: 'none',
    background: 'linear-gradient(135deg, #d4af37 0%, #aa8010 100%)',
    color: '#150917',
    fontWeight: 700,
    fontSize: '0.86rem',
    cursor: 'pointer'
  }
};

export default AdminDashboard;

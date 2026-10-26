import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Destination from '../models/Destination.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Restaurant from '../models/Restaurant.js';
import Transport from '../models/Transport.js';
import Experience from '../models/Experience.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/intellitrip';

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri);
    }
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing collection data (except users)
    await Destination.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Restaurant.deleteMany({});
    await Transport.deleteMany({});
    await Experience.deleteMany({});

    // Ensure dummy vendor user exists
    let vendor = await User.findOne({ email: 'vendor@intellitrip.com' });
    if (!vendor) {
      vendor = await User.create({
        name: 'Grand Himalayan Hospitality',
        email: 'vendor@intellitrip.com',
        password: 'Password123!',
        role: 'Hotel Owner',
        phone: '+91 9876543210'
      });
    }

    // 1. Seed Destinations
    const destinations = await Destination.create([
      {
        name: 'Manali & Solang Valley',
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        description: 'A breathtaking high-altitude Himalayan resort town known for snow-capped peaks, paragliding, skiing, and serene mountain valleys.',
        category: 'Mountain',
        bestTimeToVisit: 'October to June',
        averageCostPerDay: 65,
        images: [
          'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=1000&q=80'
        ],
        attractions: [
          { name: 'Solang Valley Adventure Zone', description: 'Hub for paragliding, zorbing, and winter skiing.' },
          { name: 'Hadimba Temple', description: 'Ancient 16th-century wooden pagoda temple surrounded by cedar forest.' },
          { name: 'Rohtang Pass', description: 'Iconic snow pass connecting Kullu Valley with Lahaul and Spiti.' }
        ],
        tags: ['Snow', 'Adventure', 'Himalayas', 'Trekking'],
        rating: 4.8,
        reviewCount: 42,
        isFeatured: true
      },
      {
        name: 'Goa Coastal Paradise',
        city: 'Panaji',
        state: 'Goa',
        country: 'India',
        description: 'Famous tropical beach state in Western India, celebrated for golden sands, vibrant nightlife, Portuguese heritage, and seafood cuisine.',
        category: 'Beach',
        bestTimeToVisit: 'November to February',
        averageCostPerDay: 85,
        images: [
          'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1000&q=80'
        ],
        attractions: [
          { name: 'Baga & Calangute Beaches', description: 'Famous energetic beach stretches offering water sports and beach shacks.' },
          { name: 'Basilica of Bom Jesus', description: 'UNESCO World Heritage site containing the mortal remains of St. Francis Xavier.' }
        ],
        tags: ['Beach', 'Nightlife', 'Seafood', 'Water Sports'],
        rating: 4.7,
        reviewCount: 56,
        isFeatured: true
      },
      {
        name: 'Jaipur Royal Pink City',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        description: 'Capital of Rajasthan renowned for grand hilltop forts, opulent palaces, vibrant bazaars, and rich royal heritage.',
        category: 'Cultural',
        bestTimeToVisit: 'October to March',
        averageCostPerDay: 55,
        images: [
          'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80'
        ],
        attractions: [
          { name: 'Amber Fort', description: 'Majestic 16th-century fortress overlooking Maota Lake.' },
          { name: 'Hawa Mahal', description: 'Palace of Winds with 953 intricate honeycomb windows.' }
        ],
        tags: ['Heritage', 'Forts', 'Architecture', 'Royalty'],
        rating: 4.6,
        reviewCount: 38,
        isFeatured: true
      },
      {
        name: 'Kerala Backwater Escape',
        city: 'Alappuzha',
        state: 'Kerala',
        country: 'India',
        description: 'A tranquil getaway with palm-lined backwaters, houseboat cruises, lagoons, and coastal cuisine.',
        category: 'Nature',
        bestTimeToVisit: 'September to March',
        averageCostPerDay: 70,
        images: [
          'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1000&q=80'
        ],
        attractions: [
          { name: 'Alappuzha Backwaters', description: 'A peaceful network of canals best explored by traditional houseboat.', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80' },
          { name: 'Marari Beach', description: 'A quiet, palm-fringed beach ideal for a slow sunset walk.', image: 'https://images.unsplash.com/photo-1602308361228-1e9a0b4f6f7a?auto=format&fit=crop&w=800&q=80' }
        ],
        tags: ['Backwaters', 'Houseboats', 'Nature', 'Wellness'],
        rating: 4.8,
        reviewCount: 31,
        isFeatured: true
      },
      {
        name: 'Agra Heritage Trail',
        city: 'Agra',
        state: 'Uttar Pradesh',
        country: 'India',
        description: 'A timeless heritage destination centered on the Taj Mahal, Mughal architecture, artisan markets, and North Indian cuisine.',
        category: 'Historical',
        bestTimeToVisit: 'October to March',
        averageCostPerDay: 50,
        images: [
          'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80'
        ],
        attractions: [
          { name: 'Taj Mahal Sunrise Visit', description: 'See the marble monument glow at sunrise before the crowds arrive.', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },
          { name: 'Agra Fort', description: 'Explore the red sandstone imperial fort and its Yamuna viewpoints.', image: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80' }
        ],
        tags: ['Taj Mahal', 'Heritage', 'Mughal', 'Architecture'],
        rating: 4.7,
        reviewCount: 47,
        isFeatured: true
      }
    ]);

    const manali = destinations[0];
    const goa = destinations[1];
    const kerala = destinations[3];
    const agra = destinations[4];

    const additionalDestinationData = [
      ['Udaipur Lake Palace Retreat', 'Udaipur', 'Rajasthan', 'Cultural'],
      ['Rishikesh River Sanctuary', 'Rishikesh', 'Uttarakhand', 'Adventure'],
      ['Ladakh High Pass Expedition', 'Leh', 'Ladakh', 'Mountain'],
      ['Andaman Bluewater Islands', 'Port Blair', 'Andaman and Nicobar', 'Beach'],
      ['Varanasi Sacred River Walks', 'Varanasi', 'Uttar Pradesh', 'Religous'],
      ['Mysore Palace & Silk Route', 'Mysore', 'Karnataka', 'Historical'],
      ['Sikkim Alpine Monasteries', 'Gangtok', 'Sikkim', 'Mountain'],
      ['Jodhpur Blue City', 'Jodhpur', 'Rajasthan', 'Historical'],
      ['Pondicherry French Quarter', 'Puducherry', 'Puducherry', 'Cultural'],
      ['Kashmir Valley & Shikara', 'Srinagar', 'Jammu and Kashmir', 'Nature'],
      ['Coorg Coffee Highlands', 'Madikeri', 'Karnataka', 'Nature'],
      ['Jim Corbett Wilderness', 'Ramnagar', 'Uttarakhand', 'Wildlife'],
      ['Hampi Stone Kingdom', 'Hampi', 'Karnataka', 'Historical'],
      ['Munnar Tea Country', 'Munnar', 'Kerala', 'Nature'],
      ['Ranthambore Tiger Country', 'Sawai Madhopur', 'Rajasthan', 'Wildlife'],
      ['Mumbai Art Deco Coast', 'Mumbai', 'Maharashtra', 'Urban'],
      ['Darjeeling Himalayan Railway', 'Darjeeling', 'West Bengal', 'Mountain'],
      ['Kutch White Desert', 'Bhuj', 'Gujarat', 'Desert'],
      ['Kodaikanal Misty Lakes', 'Kodaikanal', 'Tamil Nadu', 'Nature'],
      ['Lakshadweep Coral Isles', 'Agatti', 'Lakshadweep', 'Beach'],
      ['Mahabalipuram Shore Temples', 'Mahabalipuram', 'Tamil Nadu', 'Historical'],
      ['Nashik Vineyard Trail', 'Nashik', 'Maharashtra', 'Cultural'],
      ['Dharamshala Cedar Valleys', 'Dharamshala', 'Himachal Pradesh', 'Mountain'],
      ['Bengaluru Design District', 'Bengaluru', 'Karnataka', 'Urban'],
      ['Pench Forest Safaris', 'Seoni', 'Madhya Pradesh', 'Wildlife']
    ];
    const destinationImages = {
      Mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
      Beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      Nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80',
      Historical: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1000&q=80',
      Cultural: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1000&q=80',
      Adventure: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1000&q=80',
      Wildlife: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1000&q=80',
      Urban: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1000&q=80',
      Religous: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80',
      Desert: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1000&q=80'
    };
    const additionalDestinations = await Destination.create(additionalDestinationData.map(([name, city, state, category], index) => ({
      name,
      city,
      state,
      country: 'India',
      description: `${name} offers a carefully curated Indian escape with distinctive local culture, scenery, food, and memorable places to explore.`,
      category,
      bestTimeToVisit: index % 2 === 0 ? 'October to March' : 'September to April',
      averageCostPerDay: 45 + (index % 6) * 10,
      images: [destinationImages[category], destinationImages.Nature],
      attractions: [
        { name: `${city} Signature Landmark`, description: `A must-see highlight of ${city}.`, image: destinationImages[category] },
        { name: `${city} Local Discovery`, description: `A quieter way to experience the character of ${city}.`, image: destinationImages.Nature }
      ],
      tags: [category, 'Curated', 'India', 'Bespoke'],
      rating: 4.5 + (index % 5) / 10,
      reviewCount: 12 + index,
      isFeatured: index < 8
    })));
    const catalogDestinations = destinations.concat(additionalDestinations);

    // 2. Seed Hotels & Rooms
    const hotel1 = await Hotel.create({
      owner: vendor._id,
      destination: manali._id,
      name: 'The Grand Himalayan Resort & Spa',
      description: 'Luxury mountain resort offering panoramic river and peak views, heated indoor pool, spa services, and fine dining.',
      address: 'Old Manali Road, Near Club House',
      city: 'Manali',
      amenities: ['WiFi', 'Pool', 'Spa', 'Parking', 'Breakfast', 'Gym', 'AC', 'Restaurant'],
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'],
      startingPrice: 120,
      rating: 4.9,
      reviewCount: 29
    });

    await Room.create([
      {
        hotel: hotel1._id,
        roomType: 'Deluxe',
        title: 'Himalayan Balcony Deluxe Room',
        description: 'Spacious king-bed room with private wooden balcony facing snow peaks.',
        pricePerNight: 120,
        capacity: 2,
        amenities: ['King Bed', 'Mountain View Balcony', 'Free WiFi', 'Heater', 'Breakfast Included'],
        totalRooms: 15,
        availableRooms: 12
      },
      {
        hotel: hotel1._id,
        roomType: 'Executive Suite',
        title: 'Royal Alpine Presidential Suite',
        description: 'Luxury suite featuring living room, fireplace, Jacuzzi bathtub, and 360-degree valley view.',
        pricePerNight: 240,
        capacity: 4,
        amenities: ['Fireplace', 'Jacuzzi', 'Mini Bar', 'Butler Service', 'Private Terrace'],
        totalRooms: 5,
        availableRooms: 3
      }
    ]);

    const hotel2 = await Hotel.create({
      owner: vendor._id,
      destination: goa._id,
      name: 'Taj Exotica Beach Haven Goa',
      description: 'Beachfront resort surrounded by tropical gardens, direct beach access, pool bars, and luxury seafood dining.',
      address: 'Benaulim Beach Road',
      city: 'Panaji',
      amenities: ['WiFi', 'Pool', 'Spa', 'Parking', 'Breakfast', 'Bar', 'Airport Shuttle'],
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'],
      startingPrice: 150,
      rating: 4.8,
      reviewCount: 45
    });

    await Room.create({
      hotel: hotel2._id,
      roomType: 'Deluxe',
      title: 'Oceanfront Sunset Deluxe Villa',
      description: 'Direct sea view villa with private plunge pool and garden patio.',
      pricePerNight: 150,
      capacity: 2,
      amenities: ['Ocean View', 'Private Pool', 'Air Conditioning', 'Free Airport Transfer'],
      totalRooms: 10,
      availableRooms: 8
    });

    const hotel3 = await Hotel.create({
      owner: vendor._id,
      destination: kerala._id,
      name: 'Coconut Lagoon Backwater Retreat',
      description: 'A quiet waterfront stay with private verandas, canoe excursions, Ayurvedic treatments, and Kerala cuisine.',
      address: 'Vembanad Lake, Alappuzha',
      city: 'Alappuzha',
      amenities: ['WiFi', 'Pool', 'Spa', 'Breakfast', 'Restaurant', 'Airport Shuttle'],
      images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=80'],
      startingPrice: 95,
      rating: 4.7,
      reviewCount: 22
    });

    await Room.create({
      hotel: hotel3._id,
      roomType: 'Villa',
      title: 'Lakefront Heritage Villa',
      description: 'A spacious heritage villa with a private veranda facing the backwaters.',
      pricePerNight: 95,
      capacity: 2,
      amenities: ['Lake View', 'King Bed', 'Breakfast Included', 'Private Veranda'],
      totalRooms: 8,
      availableRooms: 6
    });

    await Hotel.create({
      owner: vendor._id,
      destination: agra._id,
      name: 'The Marble Gate Heritage Hotel',
      description: 'A comfortable heritage-inspired base near Agra landmarks with rooftop Taj views and local dining.',
      address: 'Fatehabad Road, Agra',
      city: 'Agra',
      amenities: ['WiFi', 'Breakfast', 'Restaurant', 'Parking', 'Bar'],
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'],
      startingPrice: 65,
      rating: 4.5,
      reviewCount: 18
    });

    const additionalHotels = await Hotel.create(Array.from({ length: 26 }, (_, index) => {
      const destination = catalogDestinations[index % catalogDestinations.length];
      const city = destination.city;
      return {
        owner: vendor._id,
        destination: destination._id,
        name: `${['The', 'Maison', 'Grand', 'The Royal', 'Aurum'][index % 5]} ${city} ${['Collection', 'House', 'Retreat', 'Palace', 'Reserve'][index % 5]}`,
        description: `A refined luxury stay in ${city} with attentive service, local design, and an elegant base for exploring the destination.`,
        address: `Signature District, ${city}`,
        city,
        amenities: ['WiFi', 'Breakfast', index % 2 ? 'Spa' : 'Pool', index % 3 ? 'Restaurant' : 'Bar', 'Parking'],
        images: [destination.images[0], destination.images[1]],
        startingPrice: 80 + (index % 8) * 20,
        rating: 4.4 + (index % 6) / 10,
        reviewCount: 10 + index
      };
    }));

    await Room.create(additionalHotels.map((hotel, index) => ({
      hotel: hotel._id,
      roomType: index % 2 ? 'Executive Suite' : 'Deluxe',
      title: `${hotel.city} Signature ${index % 2 ? 'Suite' : 'Room'}`,
      description: `A comfortable room with thoughtful details and a view of ${hotel.city}.`,
      pricePerNight: hotel.startingPrice,
      capacity: index % 3 === 0 ? 4 : 2,
      amenities: ['King Bed', 'Free WiFi', 'Breakfast Included'],
      totalRooms: 10,
      availableRooms: 7
    })));

    // 3. Seed Restaurants
    await Restaurant.create([
      {
        destination: manali._id,
        name: 'Johnson’s Alpine Cafe & Trout Grill',
        cuisine: 'Continental & Himachali',
        priceRange: '$$',
        averagePriceForTwo: 1600,
        address: 'Circuit House Road, Manali',
        city: 'Manali',
        description: 'Famous for fresh river trout fish, woodfired pizzas, and garden seating.',
        rating: 4.7,
        images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80']
      },
      {
        destination: goa._id,
        name: 'Fisherman’s Wharf Beach Shack',
        cuisine: 'Goan Seafood & Portuguese',
        priceRange: '$$$',
        averagePriceForTwo: 3200,
        address: 'Cavelossim Beach, Goa',
        city: 'Panaji',
        description: 'Authentic Goan fish curry, butter garlic prawns, and live guitar music.',
        rating: 4.9,
        images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80']
      }
    ]);

    await Restaurant.create(Array.from({ length: 28 }, (_, index) => {
      const destination = catalogDestinations[(index + 2) % catalogDestinations.length];
      const cuisine = ['Modern Indian', 'Regional Tasting Menu', 'Pan-Asian', 'Mediterranean', 'Farm-to-Table'][index % 5];
      return {
        destination: destination._id,
        owner: vendor._id,
        name: `${['The', 'Maison', 'Saffron', 'The Terrace', 'Culina'][index % 5]} ${destination.city} ${['Table', 'Kitchen', 'Atelier', 'Dining Room', 'House'][index % 5]}`,
        cuisine,
        priceRange: ['$$', '$$$', '$$$$', '$$$'][index % 4],
        averagePriceForTwo: [1600, 3200, 6000, 3200][index % 4],
        address: `Heritage Quarter, ${destination.city}`,
        city: destination.city,
        openingHours: '12:00 PM - 11:00 PM',
        description: `An elevated ${cuisine.toLowerCase()} dining experience inspired by the ingredients and stories of ${destination.city}.`,
        rating: 4.4 + (index % 6) / 10,
        reviewCount: 15 + index,
        images: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80'
        ],
        contactPhone: '+91 9876543210'
      };
    }));

    // 4. Seed Transport Options
    await Transport.create([
      {
        provider: vendor._id,
        type: 'Car Rental',
        title: 'Mahindra Thar 4x4 Convertible',
        vehicleModel: '2025 Thar 4x4 Automatic',
        city: 'Manali',
        pricePerDay: 75,
        capacity: 4,
        features: ['4WD Offroad', 'Convertible Soft Top', 'GPS Navigation', 'Bluetooth Audio'],
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80']
      },
      {
        provider: vendor._id,
        type: 'Bike Rental',
        title: 'Royal Enfield Himalayan 450cc',
        vehicleModel: '2024 Royal Enfield Himalayan',
        city: 'Manali',
        pricePerDay: 35,
        capacity: 2,
        features: ['Dual Helmets Included', 'Luggage Carrier', 'All India Permit'],
        images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80']
      },
      {
        provider: vendor._id,
        type: 'Private Shuttle',
        title: 'Alappuzha Private Backwater Cruise',
        vehicleModel: 'Traditional Kerala Houseboat',
        city: 'Alappuzha',
        pricePerDay: 110,
        capacity: 6,
        features: ['Captain Included', 'Lunch Included', 'Lake Sunset Route', 'Private Deck'],
        images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80']
      },
      {
        provider: vendor._id,
        type: 'Private Shuttle',
        title: 'Agra Heritage Chauffeur Sedan',
        vehicleModel: 'Toyota Innova Crysta',
        city: 'Agra',
        pricePerDay: 45,
        capacity: 5,
        features: ['English-Speaking Driver', 'Hotel Pickup', 'Child Seat on Request', 'Air Conditioning'],
        images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80']
      }
    ]);

    await Transport.create(Array.from({ length: 26 }, (_, index) => {
      const destination = catalogDestinations[(index + 4) % catalogDestinations.length];
      const type = ['Private Shuttle', 'Car Rental', 'Taxi', 'Bike Rental'][index % 4];
      return {
        provider: vendor._id,
        type,
        title: `${['Signature Chauffeur', 'Executive Cab', 'Heritage Drive', 'Explorer Fleet'][index % 4]} - ${destination.city}`,
        vehicleModel: ['Mercedes V-Class', 'Toyota Innova Crysta', 'BMW 5 Series', 'Royal Enfield Himalayan'][index % 4],
        city: destination.city,
        pricePerDay: 35 + (index % 7) * 15,
        capacity: type === 'Bike Rental' ? 2 : 4 + (index % 3),
        features: ['Professional Driver', 'Air Conditioning', 'GPS Navigation', index % 2 ? 'Hotel Pickup' : 'Flexible Route'],
        images: [
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'
        ],
        isAvailable: true,
        rating: 4.5 + (index % 5) / 10
      };
    }));

    // 5. Seed Experiences & Guided Activities
    await Experience.create([
      {
        provider: vendor._id,
        destination: manali._id,
        title: 'Solang Tandem Paragliding Flight with HD Video',
        description: 'Fly high above snow mountains with certified pilots. Includes GoPro video recording and equipment.',
        category: 'Adventure',
        duration: '1.5 Hours',
        pricePerPerson: 45,
        maxGroupSize: 8,
        includedServices: ['Certified Pilot', 'Safety Gear', 'GoPro HD Flight Video', 'Pickup from Solang Ground'],
        rating: 4.9,
        images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80']
      },
      {
        provider: vendor._id,
        destination: goa._id,
        title: 'Island Snorkeling & Wild Dolphin Cruise',
        description: 'Catamaran boat trip to Grand Island for coral reef snorkeling, swimming, wild dolphin spotting, and beach BBQ lunch.',
        category: 'Water Sports',
        duration: '6 Hours',
        pricePerPerson: 60,
        maxGroupSize: 15,
        includedServices: ['Boat Cruise', 'Snorkeling Gear', 'Seafood BBQ Lunch', 'Chilled Drinks'],
        rating: 4.8,
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80']
      }
    ]);

    await Experience.create(Array.from({ length: 28 }, (_, index) => {
      const destination = catalogDestinations[(index + 1) % catalogDestinations.length];
      const category = ['Cultural Walk', 'Food Tour', 'Heritage Tour', 'Photography', 'Adventure', 'Trekking', 'Safari'][index % 7];
      return {
        provider: vendor._id,
        destination: destination._id,
        title: `${destination.city} ${['Private Discovery', 'Sunrise Immersion', 'Signature Half-Day', 'Local Stories'][index % 4]}`,
        description: `A hosted ${category.toLowerCase()} through the character, history, and hidden details of ${destination.city}.`,
        category,
        duration: index % 2 ? '4 Hours' : '6 Hours',
        pricePerPerson: 30 + (index % 8) * 15,
        maxGroupSize: index % 3 ? 8 : 4,
        includedServices: ['Local Expert Host', 'Hotel Pickup', 'Refreshments', index % 2 ? 'All Entrance Fees' : 'Professional Photos'],
        rating: 4.5 + (index % 5) / 10,
        reviewCount: 18 + index,
        images: [
          destination.images[0],
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80'
        ]
      };
    }));

    console.log('   ✅ Phase 2 Seed Data successfully populated!');
    if (process.argv[1].includes('seedData.js')) {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    if (process.argv[1].includes('seedData.js')) {
      process.exit(1);
    }
  }
};

if (process.argv[1].includes('seedData.js')) {
  seedDatabase();
}

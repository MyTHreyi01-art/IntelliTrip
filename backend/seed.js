import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Destination from './models/Destination.js';
import Hotel from './models/Hotel.js';
import Experience from './models/Experience.js';
import Restaurant from './models/Restaurant.js';
import Transport from './models/Transport.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intellitrip';

const destinations = [
  // --- NORTH INDIA ---
  {
    name: 'Agra — Taj Mahal & Mughal Legacy',
    city: 'Agra',
    state: 'Uttar Pradesh',
    country: 'India',
    description: 'Home to the world-renowned Taj Mahal, one of the Seven Wonders of the World. Agra represents the pinnacle of Mughal architecture, featuring grand forts, imperial tombs, and bustling marble craft markets.',
    category: 'Historical',
    bestTimeToVisit: 'October to March',
    averageCostPerDay: 55,
    rating: 4.9,
    reviewCount: 3450,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587135991058-8816b028691f?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Taj Mahal', description: 'Ivory-white marble mausoleum on the south bank of the Yamuna river.', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },
      { name: 'Agra Fort', description: 'Massive red sandstone 16th-century fortress of Mughal emperors.', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80' },
      { name: 'Fatehpur Sikri', description: 'UNESCO World Heritage red sandstone ghost city built by Emperor Akbar.', image: 'https://images.unsplash.com/photo-1587135991058-8816b028691f?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Taj Mahal', 'Mughal', 'UNESCO', 'History', 'Heritage', 'Marble']
  },
  {
    name: 'Varanasi — Eternal City of Lights',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    description: 'One of the oldest continuously inhabited cities in the world. Varanasi sits on the sacred banks of the Ganges, celebrated for its spiritual ghats, evening Ganga Aarti, silk weavers, and age-old Hindu philosophy.',
    category: 'Religous',
    bestTimeToVisit: 'October to March',
    averageCostPerDay: 45,
    rating: 4.9,
    reviewCount: 2980,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Dashashwamedh Ghat', description: 'The main and most spectacular ghat hosting the mesmerizing evening Maha Aarti.', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80' },
      { name: 'Kashi Vishwanath Temple', description: 'One of the twelve revered Jyotirlingas dedicated to Lord Shiva.', image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sarnath Deer Park', description: 'Historic site where Gautama Buddha first taught the Dharma after enlightenment.', image: 'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Spiritual', 'Ganges', 'Ghats', 'Aarti', 'Heritage', 'Banarasi Silk']
  },
  {
    name: 'Jaipur — The Pink City & Royal Forts',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    description: 'Capital of Rajasthan, famed for its rose-tinted architecture, majestic hilltop forts, vibrant jewel markets, and royal palaces showcasing Rajput and Mughal artistry.',
    category: 'Cultural',
    bestTimeToVisit: 'October to March',
    averageCostPerDay: 65,
    rating: 4.8,
    reviewCount: 2650,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1477587458883-47145ed68e10?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Amber Fort', description: 'Majestic hilltop fort with the Sheesh Mahal (Mirror Palace) overlooking Maota Lake.', image: 'https://images.unsplash.com/photo-1477587458883-47145ed68e10?auto=format&fit=crop&w=800&q=80' },
      { name: 'Hawa Mahal', description: 'The iconic Palace of Winds with 953 honeycombed carved stone casements.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
      { name: 'City Palace', description: 'Royal residence with courtyards, museums, and peacock-themed gateways.', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Forts', 'Palaces', 'Culture', 'Rajputana', 'Heritage', 'Shopping']
  },
  {
    name: 'Udaipur — City of Lakes & Palaces',
    city: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    description: 'The Venice of the East, Udaipur is renowned for its romantic marble palaces floating on serene lakes, surrounded by the green Aravalli Hills and royal Rajput grandeur.',
    category: 'Historical',
    bestTimeToVisit: 'September to March',
    averageCostPerDay: 75,
    rating: 4.9,
    reviewCount: 2100,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'City Palace Udaipur', description: 'Sprawling palace complex built over 400 years on Lake Pichola.', image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80' },
      { name: 'Lake Pichola', description: 'Picturesque freshwater lake with sunset boat rides and the Lake Palace.', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80' },
      { name: 'Jag Mandir', description: 'Palace built on an island in Lake Pichola with historic stone elephants.', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Lakes', 'Palace', 'Romance', 'Royal', 'Heritage', 'Aravalli']
  },
  {
    name: 'Jaisalmer — Golden Sands of the Thar',
    city: 'Jaisalmer',
    state: 'Rajasthan',
    country: 'India',
    description: 'A desert jewel made of yellow sandstone rising from the Thar Desert. Known for its living fort, desert camel safaris, starlit camping, and intricately carved Havelis.',
    category: 'Desert',
    bestTimeToVisit: 'November to March',
    averageCostPerDay: 70,
    rating: 4.8,
    reviewCount: 1740,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1576487247299-e223a3111075?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Jaisalmer Fort (Sonar Qila)', description: 'One of the few living forts in the world where one-fourth of the city populace resides.', image: 'https://images.unsplash.com/photo-1576487247299-e223a3111075?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sam Sand Dunes', description: 'Sweeping sand dunes offering camel safaris, quad biking, and Rajasthani folk music camps.', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Patwon Ki Haveli', description: 'Five-story cluster of merchant mansions renowned for filigreed stone balconies.', image: 'https://images.unsplash.com/photo-1576487247299-e223a3111075?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Desert', 'Sand Dunes', 'Fort', 'Camel Safari', 'Thar', 'Culture']
  },
  {
    name: 'Manali — Alpine Himalayan Wonderland',
    city: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    description: 'High-altitude resort town nestled in the Kullu Valley. Manali is the adventure hub for paragliding, skiing at Solang, crossing Rohtang Pass, and tranquil apple orchard walks.',
    category: 'Mountain',
    bestTimeToVisit: 'October to June',
    averageCostPerDay: 65,
    rating: 4.9,
    reviewCount: 2890,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1589802804285-b0da9f8af8e3?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Rohtang Pass & Atal Tunnel', description: 'Snowbound gateway to Lahaul and Spiti at 3,978m altitude.', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80' },
      { name: 'Solang Valley', description: 'Adventure hub for skiing, zorbing, snow scooters, and paragliding.', image: 'https://images.unsplash.com/photo-1589802804285-b0da9f8af8e3?auto=format&fit=crop&w=800&q=80' },
      { name: 'Hadimba Temple', description: 'Pagoda-style wooden temple nestled inside ancient cedar forests.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Snow', 'Adventure', 'Trekking', 'Skiing', 'Himalaya', 'Pine Forests']
  },
  {
    name: 'Goa — Coastal Luxury & Sun-Kissed Beaches',
    city: 'Panaji',
    state: 'Goa',
    country: 'India',
    description: 'India\'s premier coastal getaway. Pristine golden beaches, Portuguese colonial villas, UNESCO churches, world-famous seafood shacks, and thrilling water sports.',
    category: 'Beach',
    bestTimeToVisit: 'November to February',
    averageCostPerDay: 75,
    rating: 4.8,
    reviewCount: 3950,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Baga & Calangute Beaches', description: 'Energetic beaches filled with water sports, beach cafes, and vibrant music.', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80' },
      { name: 'Basilica of Bom Jesus', description: 'UNESCO World Heritage 16th-century church holding relics of St. Francis Xavier.', image: 'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80' },
      { name: 'Dudhsagar Waterfalls', description: 'Awe-inspiring 4-tiered white waterfall deep in the Western Ghats.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Beach', 'Nightlife', 'Seafood', 'Water Sports', 'Portuguese', 'Relaxation']
  },
  {
    name: 'Alleppey — Kerala Backwaters & Houseboat Serenity',
    city: 'Alappuzha',
    state: 'Kerala',
    country: 'India',
    description: 'The Venetian heart of Kerala. Sail tranquil canals lined with swaying palms on handcrafted luxury houseboats, and taste traditional Sadya cuisine.',
    category: 'Nature',
    bestTimeToVisit: 'September to March',
    averageCostPerDay: 85,
    rating: 4.9,
    reviewCount: 2750,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Vembanad Lake Houseboat Cruise', description: 'Overnight luxury cruise through calm lagoons, canals, and rural hamlets.', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80' },
      { name: 'Kuttanad Below-Sea-Level Farms', description: 'Unique low-altitude agricultural delta where paddy grows below sea level.', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80' },
      { name: 'Marari Beach', description: 'Peaceful palm-fringed beach renowned for wellness retreats and fishing culture.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Backwaters', 'Houseboat', 'Ayurveda', 'Kerala', 'Nature', 'Lagoons']
  },
  {
    name: 'Leh Ladakh — The Moonland & High Mountain Passes',
    city: 'Leh',
    state: 'Ladakh',
    country: 'India',
    description: 'A breathtaking high-altitude desert framed by barren Himalayan peaks, turquoise glacial lakes like Pangong Tso, Buddhist gompas, and world-record high motorable mountain passes.',
    category: 'Adventure',
    bestTimeToVisit: 'May to September',
    averageCostPerDay: 95,
    rating: 4.9,
    reviewCount: 3100,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Pangong Tso Lake', description: 'Endorheic lake at 4,350m that changes color from deep blue to turquoise green.', image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80' },
      { name: 'Nubra Valley & Hunder Dunes', description: 'High desert valley famous for double-humped Bactrian camel rides.', image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Khardung La Pass', description: 'Legendary mountain pass connecting the Indus valley to the Shyok and Nubra valleys.', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['High Altitude', 'Adventure', 'Lakes', 'Monasteries', 'Biking', 'Himalaya']
  },
  {
    name: 'Andaman & Nicobar — Turquoise Waters & Coral Reefs',
    city: 'Port Blair',
    state: 'Andaman and Nicobar',
    country: 'India',
    description: 'Tropical archipelago in the Bay of Bengal with turquoise waters, bioluminescent beaches, vibrant coral reef scuba diving at Havelock, and historical Cellular Jail.',
    category: 'Beach',
    bestTimeToVisit: 'October to May',
    averageCostPerDay: 95,
    rating: 4.9,
    reviewCount: 2850,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Radhanagar Beach (Beach No. 7)', description: 'Voted Asia\'s best beach, famous for powder-soft white sand and turquoise surf.', image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80' },
      { name: 'Elephant Beach Scuba & Snorkeling', description: 'Pristine living coral reef teeming with colorful tropical marine life.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Cellular Jail (Kala Pani)', description: 'Historic colonial prison complex in Port Blair with stirring Light & Sound show.', image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Islands', 'Radhanagar', 'Scuba Diving', 'Coral Reefs', 'White Sand', 'Snorkeling']
  },
  {
    name: 'Jim Corbett National Park — The Tiger Haven',
    city: 'Ramnagar',
    state: 'Uttarakhand',
    country: 'India',
    description: 'India\'s oldest national park, established in 1936 to protect the endangered Bengal tiger. Rich in biodiversity, sub-Himalayan belt topography, wild elephants, and dense sal forests.',
    category: 'Wildlife',
    bestTimeToVisit: 'November to June',
    averageCostPerDay: 85,
    rating: 4.8,
    reviewCount: 1850,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Dhikala Tiger Safari', description: 'Prime wildlife zone known for Bengal tiger and wild elephant sightings.', image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80' },
      { name: 'Corbett Waterfalls', description: 'Scenic freshwater falls surrounded by dense teak forest.', image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Kosi River Walks', description: 'Serene riverside nature trails perfect for birdwatching over 500 species.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Tiger Safari', 'Wildlife', 'Jungle', 'Elephants', 'Nature', 'Birding']
  },
  {
    name: 'Srinagar — Dal Lake & Kashmiri Romance',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    country: 'India',
    description: 'Famed for Dal Lake with its iconic houseboats and shikaras, vibrant Mughal Gardens, floating vegetable markets, and snow-laden peaks of the Pir Panjal mountain range.',
    category: 'Nature',
    bestTimeToVisit: 'April to October',
    averageCostPerDay: 80,
    rating: 4.8,
    reviewCount: 2450,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Dal Lake Shikara Ride', description: 'Tranquil wooden boat ride past lotus gardens and floating bazaars.', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Mughal Gardens (Shalimar & Nishat)', description: 'Terraced Persian-style gardens with fountains and Chinar trees.', image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80' },
      { name: 'Gulmarg Gondola', description: 'One of the highest cable cars in the world offering alpine skiing.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Dal Lake', 'Houseboat', 'Snow', 'Gardens', 'Kashmir', 'Shikara']
  },
  {
    name: 'Mysore — The Royal City of Palaces',
    city: 'Mysore',
    state: 'Karnataka',
    country: 'India',
    description: 'Renowned for the opulent Mysore Palace, Chamundi Hills, fragrant sandalwood, pure silk saris, and century-old Dasara royal festivities.',
    category: 'Historical',
    bestTimeToVisit: 'October to February',
    averageCostPerDay: 55,
    rating: 4.8,
    reviewCount: 1650,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1600101090859-52d54bfe3e36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Mysore Palace', description: 'Indo-Saracenic palace illuminated with 97,000 lights on weekends.', image: 'https://images.unsplash.com/photo-1600101090859-52d54bfe3e36?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chamundi Hills Temple', description: 'Ancient temple atop the hill overlooking Mysore city.', image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=800&q=80' },
      { name: 'Brindavan Gardens', description: 'Illuminated musical fountains below the Krishnarajasagara dam.', image: 'https://images.unsplash.com/photo-1600101090859-52d54bfe3e36?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Palace', 'Heritage', 'Silk', 'Sandalwood', 'Royalty', 'Dasara']
  },
  {
    name: 'Darjeeling — Queen of the Himalayas & Champagne Tea',
    city: 'Darjeeling',
    state: 'West Bengal',
    country: 'India',
    description: 'Nestled beneath Mount Kanchenjunga (world\'s 3rd highest peak). Renowned for champagne-grade Darjeeling tea, vintage Toy Train rides, and vibrant Buddhist monasteries.',
    category: 'Mountain',
    bestTimeToVisit: 'March to May & October to December',
    averageCostPerDay: 55,
    rating: 4.8,
    reviewCount: 2200,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Tiger Hill Sunrise', description: 'Legendary panoramic sunrise illuminating Mount Kanchenjunga in gold.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' },
      { name: 'Darjeeling Himalayan Railway', description: 'UNESCO World Heritage steam engine looping through Batasia Loop.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
      { name: 'Happy Valley Tea Estate', description: 'One of the oldest tea gardens in Darjeeling producing fine black & white teas.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Kanchenjunga', 'Tea', 'Toy Train', 'Sunrise', 'Himalayas', 'Monasteries']
  },
  {
    name: 'Rishikesh — The Himalayan Yoga & Rafting Capital',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    country: 'India',
    description: 'Set at the Himalayan foothills where the emerald Ganga emerges. Rishikesh combines spiritual meditation, world-famous yoga ashrams, and thrilling Grade IV river rafting & bungee jumping.',
    category: 'Adventure',
    bestTimeToVisit: 'September to May',
    averageCostPerDay: 50,
    rating: 4.8,
    reviewCount: 2300,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1629385824037-f0ce8daca3d5?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Ganga White Water Rafting', description: 'Thrilling rapids from Shivpuri and Marine Drive down to Lakshman Jhula.', image: 'https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?auto=format&fit=crop&w=800&q=80' },
      { name: 'Triveni Ghat Maha Aarti', description: 'Sacred confluence ghat with evening lamps and chanting.', image: 'https://images.unsplash.com/photo-1629385824037-f0ce8daca3d5?auto=format&fit=crop&w=800&q=80' },
      { name: 'The Beatles Ashram', description: 'Historic ashram where The Beatles composed the White Album in 1968.', image: 'https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?auto=format&fit=crop&w=800&q=80' }
    ],
    tags: ['Yoga', 'Rafting', 'Spiritual', 'Adventure', 'Ganges', 'Bungee']
  },
  {
    name: 'Hampi — Vijayanagara Ruins',
    city: 'Hampi',
    state: 'Karnataka',
    country: 'India',
    description: 'A UNESCO-listed landscape of granite boulders, temple complexes, and the remains of the Vijayanagara capital.',
    category: 'Historical',
    bestTimeToVisit: 'October to February',
    averageCostPerDay: 45,
    images: [
      'https://images.unsplash.com/photo-1600100397608-e8c62e1f3e2e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600101090859-52d54bfe3e36?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Virupaksha Temple', description: 'A living temple whose history is closely tied to the Vijayanagara Empire.', image: 'https://images.unsplash.com/photo-1600100397608-e8c62e1f3e2e?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'Its gopuram and riverside setting anchor Hampi’s historic temple district.' },
      { name: 'Vittala Temple and Stone Chariot', description: 'A celebrated temple complex known for its sculpted stone chariot and musical pillars.', image: 'https://images.unsplash.com/photo-1600101090859-52d54bfe3e36?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'The stone chariot is one of the most recognizable works of Vijayanagara craftsmanship.' }
    ],
    tags: ['UNESCO', 'Vijayanagara', 'Temples', 'Architecture', 'History']
  },
  {
    name: 'Munnar — Western Ghats Tea Country',
    city: 'Munnar',
    state: 'Kerala',
    country: 'India',
    description: 'Highland tea estates, misty ridges, and protected shola grasslands in Kerala’s Western Ghats.',
    category: 'Nature',
    bestTimeToVisit: 'September to March',
    averageCostPerDay: 60,
    images: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Eravikulam National Park', description: 'Mountain habitat for the endangered Nilgiri tahr and the Anamudi peak.', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'It protects rare high-altitude wildlife and offers views across the Western Ghats.' },
      { name: 'Tea Museum and Estate Walk', description: 'Learn how tea shaped Munnar’s plantations and hill-station communities.', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'The estate landscape is central to Munnar’s identity and local livelihoods.' }
    ],
    tags: ['Tea', 'Western Ghats', 'Nature', 'Wildlife', 'Hiking']
  },
  {
    name: 'Mahabalipuram — Pallava Shore Temples',
    city: 'Mahabalipuram',
    state: 'Tamil Nadu',
    country: 'India',
    description: 'A coastal heritage town of Pallava-era rock-cut caves, monolithic sculptures, and shore-side temples.',
    category: 'Historical',
    bestTimeToVisit: 'November to February',
    averageCostPerDay: 50,
    images: [
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Shore Temple', description: 'An early structural temple overlooking the Bay of Bengal.', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'Its sea-facing granite towers are a landmark of South Indian temple architecture.' },
      { name: 'Pancha Rathas', description: 'Five monolithic shrines carved from single blocks of stone.', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'Each monument demonstrates a distinct form of Pallava stone carving.' }
    ],
    tags: ['Pallava', 'UNESCO', 'Shore Temple', 'Sculpture', 'History']
  },
  {
    name: 'Jodhpur — Mehrangarh and the Blue City',
    city: 'Jodhpur',
    state: 'Rajasthan',
    country: 'India',
    description: 'A historic desert city beneath Mehrangarh Fort, known for blue-painted old-town lanes and Marwar cuisine.',
    category: 'Historical',
    bestTimeToVisit: 'October to March',
    averageCostPerDay: 55,
    images: [
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1477587458883-47145ed68e10?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Mehrangarh Fort', description: 'A hilltop fort founded by Rao Jodha in 1459, now housing galleries and courtyards.', image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'The ramparts offer a clear view across the old city and its blue houses.' },
      { name: 'Jaswant Thada', description: 'A marble memorial set beside a small lake near Mehrangarh.', image: 'https://images.unsplash.com/photo-1477587458883-47145ed68e10?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'Its carved marble screens and quiet gardens contrast with the scale of the fort.' }
    ],
    tags: ['Mehrangarh', 'Marwar', 'Blue City', 'Forts', 'Heritage']
  },
  {
    name: 'Coorg — Kodagu Coffee Highlands',
    city: 'Madikeri',
    state: 'Karnataka',
    country: 'India',
    description: 'A green hill district of coffee and spice estates, forested trails, and Kodava cultural traditions.',
    category: 'Nature',
    bestTimeToVisit: 'October to March',
    averageCostPerDay: 55,
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Raja’s Seat', description: 'A garden viewpoint over the Western Ghats and surrounding valleys.', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'It is a compact, accessible stop for the region’s broad hill-country views.' },
      { name: 'Coffee Estate Walk', description: 'A guided walk through working coffee and spice plantations.', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'The estate visit connects Coorg’s scenery with the crops and livelihoods that define it.' }
    ],
    tags: ['Coffee', 'Kodagu', 'Nature', 'Plantations', 'Western Ghats']
  },
  {
    name: 'Mumbai — Art Deco Coast and City Icons',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    description: 'A waterfront metropolis blending historic trading districts, Art Deco architecture, street food, and contemporary arts.',
    category: 'Urban',
    bestTimeToVisit: 'November to February',
    averageCostPerDay: 80,
    images: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'Gateway of India', description: 'The basalt waterfront arch completed in 1924 beside Mumbai Harbour.', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'It frames the city’s harbour history and remains a defining public landmark.' },
      { name: 'Oval Maidan Art Deco District', description: 'A UNESCO-listed ensemble of Victorian Gothic and Art Deco buildings.', image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'The streetscape shows two major architectural periods side by side.' }
    ],
    tags: ['Art Deco', 'Architecture', 'Coast', 'Food', 'Urban']
  },
  {
    name: 'Puducherry — French Quarter and Promenade',
    city: 'Puducherry',
    state: 'Puducherry',
    country: 'India',
    description: 'A coastal town with a compact French-era heritage quarter, Tamil neighborhoods, and a walkable seaside promenade.',
    category: 'Cultural',
    bestTimeToVisit: 'October to March',
    averageCostPerDay: 60,
    images: [
      'https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80'
    ],
    attractions: [
      { name: 'White Town Heritage Walk', description: 'A walk through French-era streets, restored villas, and the Tamil quarter.', image: 'https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'The nearby neighborhoods reveal the town’s layered French and Tamil history.' },
      { name: 'Rock Beach Promenade', description: 'A seafront promenade lined with civic landmarks and public spaces.', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80', whyNotMiss: 'It is the easiest place to experience Puducherry’s coastal public life at sunset.' }
    ],
    tags: ['French Quarter', 'Tamil Culture', 'Coast', 'Architecture', 'Promenade']
  }
];

const destinationFactsByCity = {
  Agra: ['Mughal monuments, marble inlay craft, and the Taj Mahal.', 'The Mughal court made Agra an imperial capital; the Taj Mahal was built by Shah Jahan in the 17th century.'],
  Varanasi: ['Ganges riverfront ghats, Hindu pilgrimage, Banarasi silk, and classical music.', 'Varanasi is one of South Asia’s oldest continuously inhabited cities and a major center of learning and pilgrimage.'],
  Jaipur: ['Rajput forts, planned-city architecture, crafts, and jewelry markets.', 'Founded in 1727 by Sawai Jai Singh II, Jaipur is notable for its planned urban grid and rose-colored historic buildings.'],
  Udaipur: ['Mewar palaces, Lake Pichola, miniature painting, and lakefront views.', 'Udaipur was founded in 1559 by Maharana Udai Singh II and became the Mewar kingdom’s new capital.'],
  Jaisalmer: ['A living sandstone fort, desert trade routes, and carved merchant havelis.', 'Founded in 1156, Jaisalmer grew as a fortified settlement on historic caravan routes through the Thar Desert.'],
  Manali: ['Kullu Valley scenery, Himalayan temples, trekking, and winter sports.', 'Manali sits on historic Himalayan routes and takes its name from the sage Manu in local tradition.'],
  Panaji: ['Goan beaches, Portuguese-era architecture, seafood, and coastal culture.', 'Goa’s history reflects centuries of maritime trade and Portuguese rule, which ended in 1961.'],
  Alappuzha: ['Kerala backwaters, houseboats, coir craft, and coastal cuisine.', 'Alappuzha developed as a planned port town in the 18th century and became a center of Kerala’s backwater trade.'],
  Leh: ['Ladakhi Buddhist monasteries, high-altitude landscapes, and Silk Route heritage.', 'Leh grew as a key stop on Central Asian trade routes linking Tibet, Kashmir, and the Indian plains.'],
  'Port Blair': ['Andaman beaches, marine life, and the Cellular Jail memorial.', 'The Cellular Jail recalls the British colonial penal system and the imprisonment of Indian independence activists.'],
  Ramnagar: ['Bengal tigers, sal forests, river habitat, and guided safaris.', 'Established in 1936 as Hailey National Park, Corbett was India’s first national park.'],
  Srinagar: ['Dal Lake, houseboats, Mughal gardens, Kashmiri crafts, and cuisine.', 'Srinagar has been shaped by Kashmir’s successive kingdoms and Mughal-era garden building.'],
  Mysore: ['The Wadiyar palace, Dasara celebrations, silk, and sandalwood.', 'Mysore served as the capital of the Kingdom of Mysore under the Wadiyar dynasty for centuries.'],
  Darjeeling: ['Tea estates, Kanchenjunga views, and the UNESCO-listed mountain railway.', 'The hill station expanded during British rule in the 19th century; its railway opened in 1881.'],
  Rishikesh: ['Yoga and meditation centers, Ganges river activities, and Himalayan foothills.', 'Rishikesh has long been a pilgrimage and study center along the Ganges at the Himalayan foothills.'],
  Hampi: ['Vijayanagara ruins, temple architecture, and a boulder-strewn landscape.', 'Hampi was the ceremonial and commercial heart of the Vijayanagara Empire before its 16th-century decline.'],
  Munnar: ['Tea estates, highland scenery, and Nilgiri tahr habitat.', 'Munnar’s large tea estates expanded during the colonial period and continue to shape the region’s economy.'],
  Mahabalipuram: ['Pallava rock-cut monuments, shore temples, and stone sculpture.', 'The Pallava dynasty developed Mahabalipuram as a port and artistic center between the 7th and 8th centuries.'],
  Jodhpur: ['Mehrangarh Fort, blue old-town lanes, Marwar cuisine, and desert crafts.', 'Rao Jodha founded Jodhpur in 1459 and built Mehrangarh Fort above the settlement.'],
  Madikeri: ['Kodava culture, coffee and spice estates, and Western Ghats landscapes.', 'Kodagu’s local history is closely tied to its distinct Kodava communities and long-standing coffee cultivation.'],
  Mumbai: ['Harbour landmarks, film and food culture, and Victorian Gothic and Art Deco districts.', 'Mumbai grew from a group of islands into a major port city under successive Indian, Portuguese, and British administrations.'],
  Puducherry: ['French-era streets, Tamil heritage, the promenade, and nearby spiritual communities.', 'The former French trading settlement joined the Indian Union in 1954, leaving a distinctive architectural legacy.'],
  Nashik: ['Vineyards, the Godavari riverfront, and important Hindu pilgrimage sites.', 'Nashik has been a regional pilgrimage center for centuries and is one of India’s best-known wine-growing regions.'],
  Dharamshala: ['Tibetan culture, the Dalai Lama’s residence, and Dhauladhar mountain trails.', 'The town became a major Tibetan cultural center after the Dalai Lama and Tibetan government-in-exile arrived in 1959.'],
  Bengaluru: ['Technology, gardens, regional food, and a growing design and arts scene.', 'Bengaluru developed from a 16th-century fortified town into a major administrative and technology center.'],
  Seoni: ['Pench tiger reserve, teak forests, and central Indian wildlife.', 'The Pench landscape is shared by Madhya Pradesh and Maharashtra and inspired settings in Kipling’s Jungle Book.'],
  Bhuj: ['Kutch embroidery, craft villages, salt desert scenery, and Gujarati culture.', 'Bhuj was a historic capital of the Kutch region and preserves palaces and crafts shaped by local rulers and communities.'],
  Agatti: ['Lakshadweep lagoons, coral reefs, and island communities.', 'Lakshadweep’s islands have long been connected by Indian Ocean seafaring and trade routes.'],
  'Sawai Madhopur': ['Ranthambore tiger habitat, dry deciduous forest, and the historic hill fort.', 'Ranthambore Fort and its surrounding forests reflect centuries of regional rule and the area’s later wildlife protection.'],
  Gangtok: ['Sikkimese Buddhist monasteries, Himalayan views, and mountain culture.', 'Gangtok grew as the capital of the former Kingdom of Sikkim and remains a center of Tibetan Buddhist culture.']
};

destinations.forEach((destination) => {
  const [knownFor, historicalBackground] = destinationFactsByCity[destination.city];
  destination.knownFor = knownFor;
  destination.historicalBackground = historicalBackground;
  destination.attractions = destination.attractions.map((attraction) => ({
    ...attraction,
    whyNotMiss: attraction.whyNotMiss || attraction.description
  }));
});

// Rich, authentic, unique experiences per destination
const bespokeExperiencesData = [
  {
    cityName: 'Agra',
    title: 'VIP Sunrise Taj Mahal & Master Craftsmen Tour',
    category: 'Heritage Tour',
    description: 'Exclusive dawn entry to the Taj Mahal before the crowds arrive, followed by private access to 5th-generation marble inlay artisans and a champagne breakfast overlooking the Yamuna.',
    duration: '4 Hours',
    pricePerPerson: 75,
    rating: 4.9,
    maxGroupSize: 8,
    includedServices: ['VIP skip-the-line permits', 'Government certified historian', 'Yamuna riverside breakfast', 'Private luxury transfer'],
    images: ['https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Agra',
    title: 'Mughal Imperial Royal Dining & Cooking Masterclass',
    category: 'Food Tour',
    description: 'Learn ancient royal recipes handed down through Mughal court lineages, incorporating saffron, edible gold leaf, and rare spices in a restored colonial courtyard.',
    duration: '3.5 Hours',
    pricePerPerson: 55,
    rating: 4.8,
    maxGroupSize: 6,
    includedServices: ['Multi-course royal feast', 'Recipe book and spice kit', 'Wine and sherbet pairing'],
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Varanasi',
    title: 'Private Ganga Maha Aarti Ceremony & Sacred Ghat Cruise',
    category: 'Cultural Walk',
    description: 'Sail along the 84 illuminated ghats of Varanasi aboard a private teakwood boat, placing floating oil lamps on the holy river while observing the grand evening Aarti.',
    duration: '3 Hours',
    pricePerPerson: 40,
    rating: 4.9,
    maxGroupSize: 10,
    includedServices: ['Private wooden boat charter', 'Live sitar accompanist', 'Floral puja offering', 'Local priest blessing'],
    images: ['https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Jaipur',
    title: 'Royal Vintage Car Tour & Private Amber Fort Access',
    category: 'Heritage Tour',
    description: 'Cruise through the Pink City in a 1930s vintage convertible with exclusive after-hours access to the Sheesh Mahal mirror palace inside Amber Fort.',
    duration: '4.5 Hours',
    pricePerPerson: 120,
    rating: 5.0,
    maxGroupSize: 4,
    includedServices: ['Chauffeured vintage car', 'Amber Fort private entry', 'Royal high tea in palace courtyard'],
    images: ['https://images.unsplash.com/photo-1477587458883-47145ed68e10?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Jaipur',
    title: 'Sunrise Hot Air Balloon Safari over Aravalli Forts',
    category: 'Adventure',
    description: 'Drift serenely above Jaipur’s hilltop palaces, ancient stepwells, and rustic Rajput villages bathed in golden morning light.',
    duration: '3 Hours',
    pricePerPerson: 190,
    rating: 4.9,
    maxGroupSize: 8,
    includedServices: ['60-minute hot air balloon flight', 'Champagne celebration landing', 'Flight certificate', 'Hotel pickup'],
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Udaipur',
    title: 'Lake Pichola Sunset Royal Shikara & Jagmandir Dinner',
    category: 'Heritage Tour',
    description: 'Gliding on Lake Pichola in a silk-draped royal boat with live flute melodies, arriving at Jagmandir Island Palace for a candlelit 4-course royal dinner.',
    duration: '4 Hours',
    pricePerPerson: 140,
    rating: 4.9,
    maxGroupSize: 6,
    includedServices: ['Private Shikara cruise', '4-course candlelit dinner', 'Live classical musicians'],
    images: ['https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Goa',
    title: 'Grand Island Private Yacht Charter & Scuba Safari',
    category: 'Water Sports',
    description: 'Board a 42-foot luxury catamaran to Grand Island for certified scuba diving among shipwrecks, dolphin sightings, and fresh grilled lobster on board.',
    duration: '6 Hours',
    pricePerPerson: 130,
    rating: 4.9,
    maxGroupSize: 12,
    includedServices: ['Private luxury catamaran', 'PADI certified scuba gear & instructor', 'Gourmet seafood BBQ lunch', 'Unlimited beverages'],
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Goa',
    title: 'Historic Fontainhas Heritage Walk & Fado Music Dinner',
    category: 'Cultural Walk',
    description: 'Walk through Latin Quarter pastel villas with an architectural conservationist, ending at an 18th-century Portuguese manor with live Fado guitar performance.',
    duration: '3.5 Hours',
    pricePerPerson: 45,
    rating: 4.8,
    maxGroupSize: 10,
    includedServices: ['Heritage guide', 'Goan-Portuguese tapas tasting', 'Fado live musical performance'],
    images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Manali',
    title: 'Solang Valley High Altitude Tandem Paragliding & Snow Trek',
    category: 'Paragliding',
    description: 'Take flight at 8,000 feet above snow-capped Himalayan peaks with an international certified tandem pilot, capturing 4K GoPro aerial footage.',
    duration: '2.5 Hours',
    pricePerPerson: 65,
    rating: 4.9,
    maxGroupSize: 6,
    includedServices: ['High-glide paragliding session', '4K GoPro action footage', 'Certified Swiss harness gear', 'Valley transfers'],
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Alappuzha',
    title: 'Luxury Eco-Houseboat Backwater Cruise with Master Chef',
    category: 'Heritage Tour',
    description: 'Glide through palm-shaded lagoons and lotus fields on a traditional cedarwood houseboat featuring an open-air upper sundeck and authentic Karimeen Pollichathu cuisine.',
    duration: '6 Hours',
    pricePerPerson: 90,
    rating: 4.9,
    maxGroupSize: 8,
    includedServices: ['Private air-conditioned houseboat', 'Chef prepared 5-course Kerala feast', 'Village kayak excursion'],
    images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Leh',
    title: 'Khardung La Pass Royal Enfield 450 Biking Expedition',
    category: 'Adventure',
    description: 'Ascend to the highest motorable road in the world at 18,380 feet with support backup vehicle, paramedic, and oxygen support.',
    duration: '8 Hours',
    pricePerPerson: 110,
    rating: 5.0,
    maxGroupSize: 10,
    includedServices: ['Royal Enfield Himalayan bike & fuel', 'Lead captain and backup vehicle', 'Oxygen cylinders & mechanic', 'Buffet lunch in Nubra'],
    images: ['https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Jaisalmer',
    title: 'Thar Desert Royal Glamping, Camel Caravan & Folk Sangeet',
    category: 'Camping',
    description: 'Overnight in luxury Swiss royal tents under millions of stars in the Thar Desert, complete with sunset camel rides and Kalbeliya fire dancers.',
    duration: 'Overnight',
    pricePerPerson: 85,
    rating: 4.9,
    maxGroupSize: 15,
    includedServices: ['Luxury air-conditioned tent stay', 'Sunset camel safari', 'Rajasthani cultural dance show', 'Gourmet dinner & breakfast'],
    images: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Port Blair',
    title: 'Havelock Deep Sea Scuba & Bioluminescent Night Kayaking',
    category: 'Water Sports',
    description: 'Dive among sea turtles and living coral reefs during the day, then paddle across calm mangrove lagoons glowing with sparkling bioluminescent plankton at night.',
    duration: '5 Hours',
    pricePerPerson: 115,
    rating: 5.0,
    maxGroupSize: 8,
    includedServices: ['PADI master certified scuba dive', 'Night illuminated kayak gear', 'HD underwater footage', 'Refreshments'],
    images: ['https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Ramnagar',
    title: 'Jim Corbett Royal Bengal Tiger Dawn Jeep Safari',
    category: 'Safari',
    description: 'Track majestic Bengal tigers and Asian elephants across the prime Dhikala zone in an open 4x4 Gypsy with a chief naturalist.',
    duration: '4 Hours',
    pricePerPerson: 60,
    rating: 4.8,
    maxGroupSize: 6,
    includedServices: ['Permits for prime core zone', 'Open 4x4 Gypsy with naturalist', 'High-powered binoculars provided'],
    images: ['https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80']
  },
  {
    cityName: 'Rishikesh',
    title: 'Ganges Grade IV White Water Rafting & Cliff Jump',
    category: 'Adventure',
    description: 'Conquer the legendary rapids "The Wall" and "Roller Coaster" with international whitewater safety kayakers, followed by a 25-foot cliff plunge.',
    duration: '4 Hours',
    pricePerPerson: 35,
    rating: 4.9,
    maxGroupSize: 12,
    includedServices: ['Grade IV rafting equipment', 'Rescue kayaker supervision', 'GoPro HD video recordings', 'Riverside snacks'],
    images: ['https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?auto=format&fit=crop&w=800&q=80']
  }
];

// Rich, authentic regional restaurants
const restaurantsData = [
  {
    cityName: 'Agra',
    name: 'Peshawri at ITC Mughal',
    cuisine: 'North Indian & Mughal',
    priceRange: '$$$$',
    address: 'Taj Ganj, Fatehabad Road, Agra',
    city: 'Agra',
    openingHours: '12:30 PM - 11:30 PM',
    description: 'Renowned for its rustic earthenware tandoors, legendary Sikandari Raan, Dal Bukhara simmered for 18 hours, and royal Mughal ambience.',
    rating: 4.9,
    reviewCount: 1420,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 562 402 1700'
  },
  {
    cityName: 'Agra',
    name: 'Pinch of Spice',
    cuisine: 'Mughlai & Continental',
    priceRange: '$$',
    address: '1076/2, Fatehabad Road, Agra',
    city: 'Agra',
    openingHours: '11:00 AM - 11:00 PM',
    description: 'Voted one of Agra’s best casual fine dining spots, celebrated for its butter chicken, murg boti tikka, and paneer lababdar.',
    rating: 4.7,
    reviewCount: 980,
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 562 404 0300'
  },
  {
    cityName: 'Jaipur',
    name: '1135 AD at Amber Fort',
    cuisine: 'Royal Rajasthani & Awadhi',
    priceRange: '$$$$',
    address: 'Level 2, Jaleb Chowk, Amber Fort, Jaipur',
    city: 'Jaipur',
    openingHours: '12:00 PM - 10:30 PM',
    description: 'Dine inside the historic walls of Amber Fort with silver dinnerware, hand-painted gold ceilings, and live classical sitar music.',
    rating: 4.9,
    reviewCount: 1250,
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 141 253 0798'
  },
  {
    cityName: 'Jaipur',
    name: 'Chokhi Dhani Heritage Dining',
    cuisine: 'Authentic Rajasthani Thali',
    priceRange: '$$',
    address: '12 Miles, Tonk Road, Jaipur',
    city: 'Jaipur',
    openingHours: '05:00 PM - 11:00 PM',
    description: 'Immersive Rajasthani cultural village with traditional floor seating, royal Daal Baati Churma, Ker Sangri, and live folk performances.',
    rating: 4.8,
    reviewCount: 2800,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 141 516 5000'
  },
  {
    cityName: 'Goa',
    name: 'The Fisherman\'s Wharf',
    cuisine: 'Goan Coastal & Seafood',
    priceRange: '$$$',
    address: 'Mobor Beach Road, Cavelossim, South Goa',
    city: 'Panaji',
    openingHours: '12:00 PM - 11:30 PM',
    description: 'Riverside dining overlooking fishing trawlers on the Sal river. Renowned for butter garlic crab, Kingfish peri-peri, and Goan prawn curry.',
    rating: 4.8,
    reviewCount: 3100,
    images: ['https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 832 287 1317'
  },
  {
    cityName: 'Goa',
    name: 'Martin\'s Corner',
    cuisine: 'Traditional Goan & Continental',
    priceRange: '$$',
    address: 'Binwaddo, Betalbatim, Salcete, Goa',
    city: 'Panaji',
    openingHours: '11:30 AM - 11:00 PM',
    description: 'Legendary Goan haunt frequented by celebrities for its fresh Lobster thermidor, Pork Vindaloo, and homemade Bebinca dessert.',
    rating: 4.7,
    reviewCount: 2650,
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 832 288 0413'
  },
  {
    cityName: 'Manali',
    name: 'The Johnson\'s Cafe & Bar',
    cuisine: 'European, Trout & Himalayan',
    priceRange: '$$$',
    address: 'Circuit House Road, Siyal, Manali',
    city: 'Manali',
    openingHours: '09:00 AM - 11:00 PM',
    description: 'Charming mountain cafe set in lush apple orchards, famous for pan-fried Himalayan rainbow trout, wood-fired pizzas, and cozy fireplaces.',
    rating: 4.8,
    reviewCount: 1600,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 98160 32058'
  },
  {
    cityName: 'Alappuzha',
    name: 'Thaff Delicacy Kerala Restaurant',
    cuisine: 'Kerala Seafood & Malabar',
    priceRange: '$$',
    address: 'General Hospital Junction, Alappuzha',
    city: 'Alappuzha',
    openingHours: '10:00 AM - 10:30 PM',
    description: 'Beloved local gem serving authentic Karimeen Pollichathu (pearl spot fish in banana leaf), spicy duck roast, and Malabar chicken biryani.',
    rating: 4.7,
    reviewCount: 1850,
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 477 225 1582'
  },
  {
    cityName: 'Udaipur',
    name: 'Tribute by the Lake',
    cuisine: 'North Indian & Rajasthani',
    priceRange: '$$$',
    address: 'Fateh Sagar Lake, Rang Sagar, Udaipur',
    city: 'Udaipur',
    openingHours: '11:00 AM - 11:00 PM',
    description: 'Panoramic lakeside open-air restaurant celebrating Mewari royal warriors, serving authentic Laal Maas and smoked kebabs by the sunset waters.',
    rating: 4.8,
    reviewCount: 1940,
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 294 243 0086'
  },
  {
    cityName: 'Varanasi',
    name: 'Baati Chokha Heritage Restaurant',
    cuisine: 'Bhojpuri & Banarasi Satvik',
    priceRange: '$',
    address: 'Anand Mandir Cinema Road, Teliyabag, Varanasi',
    city: 'Varanasi',
    openingHours: '11:00 AM - 10:30 PM',
    description: 'Rustic mud-walled restaurant serving wood-charcoal roasted Sattu Litti Baati, aromatic Baingan Chokha, and clay pot curd.',
    rating: 4.8,
    reviewCount: 2200,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
    contactPhone: '+91 542 220 7824'
  }
];

// Rich, diverse transport & fleet options
const transportData = [
  {
    type: 'Car Rental',
    title: 'Mercedes-Benz S-Class VIP Chauffeur',
    vehicleModel: 'Mercedes S-Class 2024 (Executive Pack)',
    city: 'Goa',
    pricePerDay: 90,
    capacity: 3,
    features: ['Leather Massage Recliners', 'Complimentary Champagne & Mineral Water', 'English Speaking Chauffeur', 'WiFi & iPad on board'],
    images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9
  },
  {
    type: 'Taxi',
    title: 'Toyota Innova Crysta Luxury Intercity Cab',
    vehicleModel: 'Toyota Innova Crysta ZX 7-Seater',
    city: 'Jaipur',
    pricePerDay: 45,
    capacity: 6,
    features: ['Dual Zone AC', 'Captain Reclining Seats', 'Toll & State Tax Included', 'Verified Police-Checked Driver'],
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8
  },
  {
    type: 'Car Rental',
    title: 'Audi Q7 All-Terrain Luxury SUV',
    vehicleModel: 'Audi Q7 Quattro Turbo Diesel',
    city: 'Manali',
    pricePerDay: 75,
    capacity: 5,
    features: ['Quattro 4x4 Snow Drive', 'Panoramic Sunroof', 'Snow Chains & Mountain Kit', 'Heated Seats'],
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9
  },
  {
    type: 'Bike Rental',
    title: 'Royal Enfield Himalayan 450 Mountain Cruiser',
    vehicleModel: 'Royal Enfield Himalayan 450 (Tubeless Spoke)',
    city: 'Leh',
    pricePerDay: 25,
    capacity: 2,
    features: ['Panniers & Saddle Bags Included', 'Phone Mount with Fast Charger', 'Full Protective Riding Armor', 'Medical Oxygen Canister'],
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'],
    rating: 5.0
  },
  {
    type: 'Private Shuttle',
    title: 'Rolls-Royce Vintage Royal Heritage Car',
    vehicleModel: '1938 Rolls-Royce Phantom Vintage',
    city: 'Udaipur',
    pricePerDay: 100,
    capacity: 4,
    features: ['Original Royal Mewar Coach', 'Trained White-Glove Chauffeur', 'Red Carpet Arrival Experience', 'Photo Session Privileges'],
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'],
    rating: 5.0
  },
  {
    type: 'Bus',
    title: 'Volvo B11R Multi-Axle Luxury Sleeper Coach',
    vehicleModel: 'Volvo B11R 9600 Luxury Sleeper',
    city: 'Agra',
    pricePerDay: 35,
    capacity: 32,
    features: ['Private AC Sleeper Pods', 'Individual LED Screen Entertainment', 'Washroom On Board', 'Snack & Beverage Box'],
    images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'],
    rating: 4.7
  },
  {
    type: 'Private Shuttle',
    title: 'Private Airport Express & Luxury Speedboat',
    vehicleModel: 'Yamaha 250 Twin-Engine Speedboat',
    city: 'Port Blair',
    pricePerDay: 80,
    capacity: 8,
    features: ['Direct Island Transfer', 'Life Jackets & First Aid', 'Luggage Porterage Included', 'Cool Drinks on Board'],
    images: ['https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9
  }
];

// Luxury hotels templates
const luxuryHotelTemplates = [
  {
    suffix: 'The Grand Palace & Spa',
    description: 'An ultra-opulent 5-star palace hotel offering imperial royal suites, personal butler service, private plunge pools, and Michelin-inspired royal banquet dining.',
    amenities: ['WiFi', 'Pool', 'Spa', 'Breakfast', 'Restaurant', 'Parking', 'Gym', 'Bar', 'Airport Shuttle'],
    price: 320,
    rating: 4.9
  },
  {
    suffix: 'Bespoke Luxury Villas & Private Pools',
    description: 'Exclusive private villas featuring panoramic valley/sea vistas, private temperature-controlled infinity pools, and organic Ayurvedic dining.',
    amenities: ['WiFi', 'Pool', 'Spa', 'Breakfast', 'Restaurant', 'Parking', 'Bar'],
    price: 210,
    rating: 4.8
  },
  {
    suffix: 'Royal Heritage Haveli & Suites',
    description: 'A restored 19th-century royal mansion featuring courtyard fountains, intricate jharokhas, candlelit rooftop terraces, and live sitar concerts.',
    amenities: ['WiFi', 'AC', 'Breakfast', 'Parking', 'Restaurant'],
    price: 130,
    rating: 4.7
  }
];

const additionalDestinations = [
  ['Nashik Vineyard Trail', 'Nashik', 'Maharashtra', 'Cultural'],
  ['Dharamshala Cedar Valleys', 'Dharamshala', 'Himachal Pradesh', 'Mountain'],
  ['Bengaluru Design District', 'Bengaluru', 'Karnataka', 'Urban'],
  ['Pench Forest Safaris', 'Seoni', 'Madhya Pradesh', 'Wildlife'],
  ['Kutch White Desert', 'Bhuj', 'Gujarat', 'Desert'],
  ['Lakshadweep Coral Isles', 'Agatti', 'Lakshadweep', 'Beach'],
  ['Ranthambore Tiger Country', 'Sawai Madhopur', 'Rajasthan', 'Wildlife'],
  ['Sikkim Alpine Monasteries', 'Gangtok', 'Sikkim', 'Mountain']
];

const catalogImages = {
  Mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  Beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  Nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
  Historical: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80',
  Cultural: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  Wildlife: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=80',
  Urban: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
  Desert: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200&q=80'
};

const foodImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80'
];

const fleetImages = [
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=80'
];

const roundRating = (rating) => Number(Number(rating || 0).toFixed(1));
const uniqueImage = (image, collection, index) => `${image}&sig=${collection}-${index}`;

const expandCatalogToThirty = () => {
  const existingCities = new Set(destinations.map((destination) => destination.city.toLowerCase()));
  additionalDestinations.forEach(([name, city, state, category], index) => {
    if (existingCities.has(city.toLowerCase())) return;
    existingCities.add(city.toLowerCase());
    const image = catalogImages[category];
    const [knownFor, historicalBackground] = destinationFactsByCity[city];
    destinations.push({
      name,
      city,
      state,
      country: 'India',
      description: `${name} is a curated Indian escape combining local culture, memorable scenery, and thoughtful luxury travel experiences.`,
      knownFor,
      historicalBackground,
      category,
      bestTimeToVisit: index % 2 ? 'September to April' : 'October to March',
      averageCostPerDay: 50 + (index % 6) * 10,
      rating: roundRating(4.6 + (index % 4) / 10),
      reviewCount: 700 + index * 83,
      isFeatured: index < 6,
      images: [uniqueImage(image, 'destination', index), uniqueImage(catalogImages.Nature, 'destination-nature', index)],
      attractions: [
        { name: `${city} Signature Landmark`, description: `A defining highlight of ${city}.`, image, whyNotMiss: `See a landmark that helps explain what makes ${city} distinctive.` },
        { name: `${city} Local Discovery`, description: `A slower, more intimate way to experience ${city}.`, image: catalogImages.Nature, whyNotMiss: `Experience local scenery and daily life beyond the main landmark.` }
      ],
      tags: [category, 'Bespoke', 'India', 'Curated']
    });
  });

  while (bespokeExperiencesData.length < 30) {
    const index = bespokeExperiencesData.length;
    const destination = destinations[index % destinations.length];
    bespokeExperiencesData.push({
      cityName: destination.city,
      title: `${destination.city} Private ${['Discovery', 'Sunrise', 'Heritage', 'Culinary'][index % 4]} Experience`,
      category: ['Cultural Walk', 'Food Tour', 'Heritage Tour', 'Photography', 'Adventure'][index % 5],
      description: `A hosted, highly personal journey through the distinctive places, stories, and flavors of ${destination.city}.`,
      duration: index % 2 ? '4 Hours' : '6 Hours',
      pricePerPerson: 45 + (index % 7) * 15,
      rating: roundRating(4.6 + (index % 4) / 10),
      maxGroupSize: index % 3 ? 8 : 4,
      includedServices: ['Local expert host', 'Hotel pickup', 'Refreshments', index % 2 ? 'Entrance fees' : 'Professional photos'],
      images: [uniqueImage(destination.images[0], 'experience', index), uniqueImage(catalogImages.Nature, 'experience-nature', index)]
    });
  }

  while (restaurantsData.length < 30) {
    const index = restaurantsData.length;
    const destination = destinations[(index + 3) % destinations.length];
    restaurantsData.push({
      cityName: destination.city,
      name: `${['The', 'Maison', 'Saffron', 'Culina'][index % 4]} ${destination.city} ${['Table', 'Kitchen', 'Atelier', 'House'][index % 4]}`,
      cuisine: ['Modern Indian', 'Regional Tasting Menu', 'Pan-Asian', 'Farm-to-Table'][index % 4],
      priceRange: ['$$', '$$$', '$$$$', '$$$'][index % 4],
      address: `Heritage Quarter, ${destination.city}`,
      city: destination.city,
      openingHours: '12:00 PM - 11:00 PM',
      description: `Elevated dining inspired by the ingredients and stories of ${destination.city}.`,
      rating: roundRating(4.5 + (index % 4) / 10),
      reviewCount: 500 + index * 41,
      images: [
        uniqueImage(foodImages[index % foodImages.length], 'restaurant', index),
        uniqueImage(foodImages[(index + 1) % foodImages.length], 'restaurant-secondary', index)
      ],
      contactPhone: '+91 9876543210'
    });
  }

  while (transportData.length < 30) {
    const index = transportData.length;
    const destination = destinations[(index + 5) % destinations.length];
    const type = ['Private Shuttle', 'Car Rental', 'Taxi', 'Bike Rental'][index % 4];
    transportData.push({
      type,
      title: `${['Signature Chauffeur', 'Executive Cab', 'Heritage Drive', 'Explorer Fleet'][index % 4]} - ${destination.city}`,
      vehicleModel: ['Mercedes V-Class', 'Toyota Innova Crysta', 'BMW 5 Series', 'Royal Enfield Himalayan'][index % 4],
      city: destination.city,
      pricePerDay: 25 + (index % 6) * 8,
      capacity: type === 'Bike Rental' ? 2 : 4 + (index % 3),
      features: ['Professional driver', 'Air conditioning', 'GPS navigation', index % 2 ? 'Hotel pickup' : 'Flexible route'],
      images: [
        uniqueImage(fleetImages[index % fleetImages.length], 'transport', index),
        uniqueImage(fleetImages[(index + 1) % fleetImages.length], 'transport-secondary', index)
      ],
      rating: roundRating(4.5 + (index % 4) / 10)
    });
  }
};

async function seedDatabase() {
  try {
    console.log('\n[IntelliTrip Opulence Seeder] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[IntelliTrip Opulence Seeder] Connected to MongoDB.\n');

    if (process.argv.includes('--catalog-only')) {
      expandCatalogToThirty();
      const existingCities = new Set((await Destination.find().select('city').lean()).map((destination) => destination.city.toLowerCase()));
      const missingDestinations = destinations.filter((destination) => !existingCities.has(destination.city.toLowerCase()));
      if (missingDestinations.length) await Destination.insertMany(missingDestinations);

      for (const [city, [knownFor, historicalBackground]] of Object.entries(destinationFactsByCity)) {
        const destination = await Destination.findOne({ city });
        if (!destination) continue;
        const catalogEntry = destinations.find((entry) => entry.city === city);
        let changed = false;
        if (catalogEntry && /curated Indian escape/i.test(destination.description)) {
          destination.name = catalogEntry.name;
          destination.description = catalogEntry.description;
          destination.bestTimeToVisit = catalogEntry.bestTimeToVisit;
          destination.images = catalogEntry.images;
          destination.attractions = catalogEntry.attractions;
          destination.tags = catalogEntry.tags;
          changed = true;
        }
        if (!destination.knownFor) {
          destination.knownFor = knownFor;
          changed = true;
        }
        if (!destination.historicalBackground) {
          destination.historicalBackground = historicalBackground;
          changed = true;
        }
        destination.attractions = destination.attractions.map((attraction) => {
          if (attraction.whyNotMiss) return attraction;
          changed = true;
          attraction.whyNotMiss = attraction.description;
          return attraction;
        });
        if (changed) await destination.save();
      }

      console.log(`[IntelliTrip Seeder] Added ${missingDestinations.length} missing destinations and filled missing history facts without deleting catalog data.`);
      process.exit(0);
    }

    // Clear existing collections
    await Destination.deleteMany({});
    await Hotel.deleteMany({});
    await Experience.deleteMany({});
    await Restaurant.deleteMany({});
    await Transport.deleteMany({});
    console.log('[IntelliTrip Opulence Seeder] Cleared previous records.\n');

    // Get or create super admin user
    let adminUser = await User.findOne({ role: 'Super Admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'IntelliTrip Concierge',
        email: 'concierge@intellitrip.com',
        password: 'admin123456',
        role: 'Super Admin'
      });
      console.log(`[IntelliTrip Opulence Seeder] Created concierge admin user.`);
    }

    expandCatalogToThirty();

    // Insert destinations
    console.log(`[IntelliTrip Opulence Seeder] Seeding ${destinations.length} destinations...`);
    const createdDestinations = await Destination.insertMany(destinations.map((destination, index) => ({
      ...destination,
      rating: roundRating(destination.rating),
      images: destination.images.map((image, imageIndex) => uniqueImage(image, 'destination-existing', `${index}-${imageIndex}`)),
      attractions: destination.attractions.map((attraction, attractionIndex) => ({
        ...attraction,
        image: uniqueImage(attraction.image, 'attraction', `${index}-${attractionIndex}`)
      }))
    })));
    console.log(`[IntelliTrip Opulence Seeder] ✅ Inserted ${createdDestinations.length} destinations.`);

    // Map destinations by city for relationships
    const destMap = {};
    createdDestinations.forEach(d => {
      destMap[d.city] = d._id;
    });

    // Insert one luxury stay per destination = 30 stays
    console.log('\n[IntelliTrip Opulence Seeder] Seeding luxury hotels...');
    const hotelsToInsert = [];
    for (const dest of createdDestinations) {
      const tmpl = luxuryHotelTemplates[hotelsToInsert.length % luxuryHotelTemplates.length];
      {
        hotelsToInsert.push({
          owner: adminUser._id,
          destination: dest._id,
          name: `${dest.city} ${tmpl.suffix}`,
          description: tmpl.description,
          address: `Royal Boulevard, Palace Enclave, ${dest.city}`,
          city: dest.city,
          amenities: tmpl.amenities,
          startingPrice: tmpl.price,
          rating: roundRating(tmpl.rating),
          reviewCount: Math.floor(Math.random() * 300) + 70,
          images: [
            uniqueImage(dest.images[0], 'hotel', hotelsToInsert.length),
            uniqueImage(dest.images[1] || dest.images[0], 'hotel-secondary', hotelsToInsert.length)
          ],
          contactPhone: '+91 1800 890 0000',
          contactEmail: `concierge@${dest.city.toLowerCase().replace(/[^a-z0-9]/g, '')}-luxury.com`,
          isActive: true
        });
      }
    }
    const createdHotels = await Hotel.insertMany(hotelsToInsert);
    console.log(`[IntelliTrip Opulence Seeder] ✅ Inserted ${createdHotels.length} luxury hotels.`);

    // Insert unique bespoke experiences
    console.log('\n[IntelliTrip Opulence Seeder] Seeding unique bespoke experiences...');
    const experiencesToInsert = [];
    for (const exp of bespokeExperiencesData) {
      const destId = destMap[exp.cityName] || createdDestinations[0]._id;
      experiencesToInsert.push({
        provider: adminUser._id,
        destination: destId,
        title: exp.title,
        description: exp.description,
        category: exp.category,
        duration: exp.duration,
        pricePerPerson: exp.pricePerPerson,
        maxGroupSize: exp.maxGroupSize,
        includedServices: exp.includedServices,
        rating: roundRating(exp.rating),
        reviewCount: Math.floor(Math.random() * 250) + 60,
        images: exp.images.map((image, imageIndex) => uniqueImage(image, 'experience-existing', `${experiencesToInsert.length}-${imageIndex}`))
      });
    }
    const createdExperiences = await Experience.insertMany(experiencesToInsert);
    console.log(`[IntelliTrip Opulence Seeder] ✅ Inserted ${createdExperiences.length} unique curated experiences.`);

    // Insert restaurants
    console.log('\n[IntelliTrip Opulence Seeder] Seeding iconic gourmet restaurants...');
    const restaurantsToInsert = [];
    for (const rest of restaurantsData) {
      const destId = destMap[rest.cityName] || createdDestinations[0]._id;
      restaurantsToInsert.push({
        destination: destId,
        owner: adminUser._id,
        name: rest.name,
        cuisine: rest.cuisine,
        priceRange: rest.priceRange,
        averagePriceForTwo: rest.averagePriceForTwo || ({ $: 800, $$: 1600, $$$: 3200, $$$$: 6000 }[rest.priceRange] || 1800),
        address: rest.address,
        city: rest.city,
        openingHours: rest.openingHours,
        description: rest.description,
        rating: roundRating(rest.rating),
        reviewCount: rest.reviewCount,
        images: rest.images.map((image, imageIndex) => uniqueImage(image, 'restaurant-existing', `${restaurantsToInsert.length}-${imageIndex}`)),
        contactPhone: rest.contactPhone
      });
    }
    const createdRestaurants = await Restaurant.insertMany(restaurantsToInsert);
    console.log(`[IntelliTrip Opulence Seeder] ✅ Inserted ${createdRestaurants.length} gourmet restaurants.`);

    // Insert transport fleet
    console.log('\n[IntelliTrip Opulence Seeder] Seeding luxury transport fleet...');
    const transportToInsert = [];
    for (const trans of transportData) {
      transportToInsert.push({
        provider: adminUser._id,
        type: trans.type,
        title: trans.title,
        vehicleModel: trans.vehicleModel,
        city: trans.city,
        pricePerDay: trans.pricePerDay,
        capacity: trans.capacity,
        features: trans.features,
        images: trans.images.map((image, imageIndex) => uniqueImage(image, 'transport-existing', `${transportToInsert.length}-${imageIndex}`)),
        isAvailable: true,
        rating: roundRating(trans.rating)
      });
    }
    const createdTransport = await Transport.insertMany(transportToInsert);
    console.log(`[IntelliTrip Opulence Seeder] ✅ Inserted ${createdTransport.length} luxury transport & fleet vehicles.`);

    console.log('\n============================================================');
    console.log('👑 IntelliTrip Luxury Opulence Seed Completed Successfully!');
    console.log('============================================================');
    console.log(`  📍 Destinations       : ${createdDestinations.length}`);
    console.log(`  🏨 Luxury Hotels      : ${createdHotels.length}`);
    console.log(`  🎟️ Unique Experiences : ${createdExperiences.length}`);
    console.log(`  🍽️ Gourmet Dining     : ${createdRestaurants.length}`);
    console.log(`  🚗 Transport Fleet    : ${createdTransport.length}`);
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[IntelliTrip Opulence Seeder Error]', error);
    process.exit(1);
  }
}

seedDatabase();

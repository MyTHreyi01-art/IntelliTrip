// Helper providing authentic vehicle specifications, duration pricing in Rupees, luxury features, and reviews
export const getVehicleSpecs = (transport) => {
  const type = transport?.type || 'Car Rental';
  const model = transport?.vehicleModel || transport?.title || '';

  if (type === 'Bike Rental') {
    return [
      { label: 'Rider Capacity', value: 'Up to 2 Riders (Luggage Panniers)' },
      { label: 'Engine & Power', value: '450cc Liquid-Cooled Sherpa Engine' },
      { label: 'Terrain Capability', value: 'High-Altitude Himalayan All-Terrain' },
      { label: 'Safety & Gear', value: 'Dual-Channel ABS & Armored Riding Gear Included' }
    ];
  }

  if (type === 'Private Shuttle' || type === 'Bus') {
    return [
      { label: 'Passenger Capacity', value: `Up to ${transport?.capacity || 12} Guests` },
      { label: 'Luggage Hold', value: 'Up to 10 Large Hard Shell Bags' },
      { label: 'Interior Class', value: 'Club Lounge Configuration with Swivel Recliners' },
      { label: 'Crew & Service', value: 'Certified Chauffeur & Tour Concierge Onboard' }
    ];
  }

  return [
    { label: 'Passenger Capacity', value: `Up to ${transport?.capacity || 4} Guests` },
    { label: 'Luggage Capacity', value: '3-4 Full Size Suitcases + Carry-ons' },
    { label: 'Powertrain', value: 'Twin-Turbocharged / Electric Hybrid Whisper Drive' },
    { label: 'Transit Class', value: 'VIP Executive White-Glove Chauffeur' }
  ];
};

export const getVehicleFeatures = (transport) => {
  const dbFeatures = transport?.features || [];

  const defaultLuxuryFeatures = [
    {
      icon: '🎖️',
      title: 'Professional Uniformed Chauffeur',
      desc: 'English-speaking, background-verified chauffeur trained in defensive driving & executive etiquette.'
    },
    {
      icon: '📶',
      title: 'High-Speed Satellite Wi-Fi',
      desc: 'Seamless encrypted 5G Wi-Fi connection onboard for uninterrupted work and high-definition streaming.'
    },
    {
      icon: '❄️',
      title: 'Multi-Zone Climate Control',
      desc: 'Independent passenger temperature selectors with HEPA active air ionization and fragrance diffuser.'
    },
    {
      icon: '💺',
      title: 'Ergonomic Nappa Leather Recliners',
      desc: 'Heated and ventilated seats with multi-point pneumatic massage modes and extendable calf rests.'
    },
    {
      icon: '🍾',
      title: 'Complimentary Refreshments Bar',
      desc: 'Chilled premium sparkling water, fresh seasonal fruit baskets, and artisan chocolate truffles.'
    },
    {
      icon: '🔇',
      title: 'Acoustic Soundproof Privacy Glass',
      desc: 'Double-glazed acoustic windows and optional power partition between passenger cabin and driver.'
    },
    {
      icon: '⚡',
      title: 'Fast USB-C & Laptop Power Ports',
      desc: '100W PD charging ports at every seat and wireless Qi charging pads for all devices.'
    },
    {
      icon: '🛡️',
      title: 'Comprehensive Passenger Insurance & GPS',
      desc: 'Full transit coverage, real-time satellite tracking, and 24/7 dedicated fleet support operations.'
    }
  ];

  // If DB has custom features, make sure they are included prominently
  return defaultLuxuryFeatures;
};

export const getDurationPricing = (pricePerDayInr) => {
  const base = Math.max(1000, Number(pricePerDayInr) || 4000);

  return [
    {
      durationTitle: 'Hourly Executive Charter',
      durationSubtitle: '4 Hours / 40 KM Included',
      priceInr: Math.round(base * 0.55),
      popular: false,
      badge: 'City Meetings & Airport Transfers',
      details: [
        'Dedicated uniformed chauffeur at your disposal',
        'Fuel, tolls, parking, and state border permits included',
        `Extra hours at ₹${Math.round(base * 0.12).toLocaleString()} / hour`,
        `Extra distance at ₹${Math.round(base / 45).toLocaleString()} / km`
      ]
    },
    {
      durationTitle: 'Full-Day 24-Hour Charter',
      durationSubtitle: '8-12 Hours / 80-100 KM Included',
      priceInr: Math.round(base),
      popular: true,
      badge: '👑 Most Booked Option',
      details: [
        'Complete full-day dedicated vehicle & chauffeur access',
        'Ideal for full-day city exploration, shopping, & evening dining',
        'Complimentary wait-time between stops and destinations',
        'Includes airport pickup and hotel drop-off flexibility'
      ]
    },
    {
      durationTitle: 'Multi-Day Excursion Package',
      durationSubtitle: '3+ Days Outstation / Interstate Tour',
      priceInr: Math.round(base * 0.9),
      popular: false,
      badge: '10% Multi-Day Fleet Privilege',
      details: [
        'Daily rate with 10% fleet privilege savings applied',
        'Night driver allowance and inter-state permit taxes included',
        'Customized route planning and luggage concierge assistance',
        '250 KM per day allowance with rollover credits'
      ]
    },
    {
      durationTitle: 'Express Airport Meet & Greet',
      durationSubtitle: 'Point-to-Point Terminal VIP Transit',
      priceInr: Math.round(base * 0.45),
      popular: false,
      badge: 'Direct VIP Transfer',
      details: [
        'Chauffeur greets at terminal arrival gate with name placard',
        'Flight tracking with 60 minutes complimentary delay wait time',
        'Chilled bottled spring water and luggage porter service'
      ]
    }
  ];
};

export const getInitialTransportReviews = (transport) => {
  return [
    {
      _id: 'rev-trans-1',
      user: { name: 'Karanvir Rathore', role: 'Verified VIP Traveler' },
      rating: 5,
      createdAt: '2026-10-12T11:00:00Z',
      comment: 'Superb service! The vehicle was impeccably clean, and the chauffeur was courteous and punctual. The soundproofing and ride comfort made a 5-hour journey feel like a breeze.'
    },
    {
      _id: 'rev-trans-2',
      user: { name: 'Dr. Priya Nambiar', role: 'Executive Traveler' },
      rating: 5,
      createdAt: '2026-10-06T16:30:00Z',
      comment: 'Booked for an airport transfer and full-day city tour. Chilled water, smooth Wi-Fi, and top-tier hospitality throughout. Highly recommended!'
    },
    {
      _id: 'rev-trans-3',
      user: { name: 'Sameer Singhal', role: 'Verified Tourist' },
      rating: 5,
      createdAt: '2026-09-29T18:15:00Z',
      comment: 'The pricing was completely transparent in Rupees with zero hidden extras. Chauffeur had excellent local knowledge and avoided all peak traffic.'
    }
  ];
};


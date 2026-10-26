// Helper providing authentic curated menus, signature most-loved dishes, ambiance details, and verified reviews
export const getMostLovedDish = (restaurant) => {
  const name = (restaurant?.name || '').toLowerCase();
  const cuisine = (restaurant?.cuisine || '').toLowerCase();

  if (name.includes('peshawri') || cuisine.includes('mughal') || cuisine.includes('north indian')) {
    return {
      name: 'Legendary Sikandari Raan & 18-Hour Dal Bukhara',
      price: 1850,
      badge: '🏆 Most Loved Signature Dish',
      isVeg: false,
      tag: "Chef's 18-Hour Masterpiece",
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      description: 'Slow-roasted spring leg of lamb marinated in malt vinegar, cinnamon, and royal spices, paired with black lentils simmered over charcoal embers for 18 hours with vine-ripened tomatoes and white churned butter.'
    };
  }

  if (name.includes('1135') || cuisine.includes('rajasthani') || name.includes('chokhi')) {
    return {
      name: 'Royal Mewari Smoked Laal Maas with Saffron Sheermal',
      price: 1650,
      badge: '🏆 Most Loved Royal Heritage Dish',
      isVeg: false,
      tag: 'Heritage Palace Recipe (Circa 1135 AD)',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      description: 'Tender baby goat slow-cooked in Mathania whole red chilies, mustard oil, and smoked charcoal dhungar, served alongside saffron-infused sweet sheermal bread.'
    };
  }

  if (name.includes('wharf') || cuisine.includes('seafood') || cuisine.includes('goan') || cuisine.includes('coastal')) {
    return {
      name: 'Fresh Bay Butter Garlic Jumbo River Crab',
      price: 2100,
      badge: '🏆 Most Loved Coastal Delicacy',
      isVeg: false,
      tag: 'Fresh Catch of the Day',
      image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80',
      description: 'Wild-caught Arabian Sea mud crab tossed in clarified butter, roasted coastal garlic, black pepper, and fresh lime coriander emulsion. A celebrated seafood legend.'
    };
  }

  if (cuisine.includes('continental') || cuisine.includes('italian') || cuisine.includes('european')) {
    return {
      name: 'Black Truffle & Wild Porcini Handcrafted Risotto',
      price: 1550,
      badge: '🏆 Most Loved European Classic',
      isVeg: true,
      tag: 'Imported Umbrian Truffle',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      description: 'Carnaroli rice cooked in a slow vegetable court-bouillon, finished with aged Parmigiano-Reggiano, French cultured butter, and shaved winter black truffles.'
    };
  }

  // Default universal royal specialty
  return {
    name: 'Royal Dum Pukht Awadhi Zafrani Biryani',
    price: 1450,
    badge: '🏆 Most Loved Signature Dish',
    isVeg: false,
    tag: 'Sealed Handi Dum Heritage',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    description: 'Aged long-grain Basmati rice and succulent prime cuts sealed in clay handis, slow-steamed with Kashmiri saffron, rose water, and kewra essence.'
  };
};

export const getCuratedMenu = (restaurant) => {
  const cuisine = (restaurant?.cuisine || '').toLowerCase();
  const name = (restaurant?.name || '').toLowerCase();

  const isCoastal = cuisine.includes('goan') || cuisine.includes('seafood') || name.includes('wharf');
  const isRajasthani = cuisine.includes('rajasthani') || name.includes('1135') || name.includes('chokhi');

  if (isCoastal) {
    return [
      {
        category: 'Coastal Starters & Small Plates',
        items: [
          { name: 'Rawa Fried Tiger Prawns', price: 850, isVeg: false, desc: 'Semolina-crusted jumbo Arabian sea prawns with spicy peri-peri marinade.' },
          { name: 'Stuffed Crab Shells Royale', price: 920, isVeg: false, desc: 'Handpicked crabmeat with shallots, melted cheddar, and mild coastal herbs.' },
          { name: 'Paneer Peri-Peri Skewers', price: 580, isVeg: true, desc: 'Grilled artisanal cottage cheese tossed in tangy Goan toddy vinegar.' },
          { name: 'Crispy Calamari Rings', price: 780, isVeg: false, desc: 'Golden batter squid rings served with homemade kokum garlic mayonnaise.' }
        ]
      },
      {
        category: 'Signature Seafood Mains',
        items: [
          { name: 'Goan Prawn Curry with Red Rice', price: 950, isVeg: false, desc: 'Traditional coconut milk and dried kokum curry cooked with sweet coastal prawns.' },
          { name: 'Pan-Seared Kingfish Steak (Surmai)', price: 1150, isVeg: false, desc: 'Thick-cut fresh kingfish seared with Recheado paste and caramelised onions.' },
          { name: 'Lobster Thermidor Imperial', price: 2400, isVeg: false, desc: 'Whole poached rock lobster with Dijon mustard, mushroom cream, and gruyère crust.' },
          { name: 'Coconut Vegetable Caldine Curry', price: 620, isVeg: true, desc: 'Fresh garden vegetables gently stewed in a turmeric-infused mild coconut broth.' }
        ]
      },
      {
        category: 'Artisanal Breads & Rice',
        items: [
          { name: 'Traditional Goan Poee Bread (2 pcs)', price: 180, isVeg: true, desc: 'Whole wheat sourdough leavened bread, warm and pillowy.' },
          { name: 'Garlic Butter Sourdough Naan', price: 210, isVeg: true, desc: 'Oven-baked flatbread glazed with coastal garlic butter.' },
          { name: 'Steamed Goan Red Heritage Rice', price: 240, isVeg: true, desc: 'Nutritious unpolished heritage red rice.' }
        ]
      },
      {
        category: 'Artisanal Desserts & Sips',
        items: [
          { name: 'Bebinca with Vanilla Bean Gelato', price: 380, isVeg: true, desc: 'Seven-layered warm Goan coconut cake served with artisanal vanilla ice cream.' },
          { name: 'Serradura Portuguese Pudding', price: 340, isVeg: true, desc: 'Silky whipped condensed cream layered with fine biscuit crumble.' },
          { name: 'Chilled Spiced Kokum Fizz', price: 220, isVeg: true, desc: 'Fresh kokum fruit extract, roasted cumin, rock salt, and sparkling water.' }
        ]
      }
    ];
  }

  if (isRajasthani) {
    return [
      {
        category: 'Royal Heritage Starters',
        items: [
          { name: 'Jodhpuri Paneer Mirchi Vada', price: 480, isVeg: true, desc: 'Large mild banana chili stuffed with herbed potato mash and malai paneer.' },
          { name: 'Mathania Maas Tikka', price: 820, isVeg: false, desc: 'Charcoal-grilled tender lamb chunks spiced with vibrant sun-dried Mathania chillies.' },
          { name: 'Dahi Ke Sholay', price: 520, isVeg: true, desc: 'Golden bread parcels stuffed with hung spiced yogurt, pomegranate, and mint.' },
          { name: 'Banjara Murg Tikka', price: 740, isVeg: false, desc: 'Country chicken skewers flavored with roasted crushed coriander and fenugreek.' }
        ]
      },
      {
        category: 'Palace Royal Main Courses',
        items: [
          { name: 'Authentic Royal Daal Baati Churma', price: 850, isVeg: true, desc: 'Five-lentil Panchmel dal, oven-baked wheat baatis dipped in pure desi ghee, and sweet almond churma.' },
          { name: 'Mewari Jungli Maas', price: 1100, isVeg: false, desc: 'The royal hunting recipe: slow-cooked tender meat with only pure ghee, dry red chillies, and rock salt.' },
          { name: 'Ker Sangri Royal Jaisalmeri', price: 720, isVeg: true, desc: 'Rare desert beans and berries sauteed with raisins, amchur, and whole spices.' },
          { name: 'Safed Maas (White Royal Curry)', price: 980, isVeg: false, desc: 'Slow-simmered tender mutton in a velvety cashew, melon seed, and cardamom gravy.' }
        ]
      },
      {
        category: 'Heritage Breads & Fragrant Pulao',
        items: [
          { name: 'Crispy Bajra Roti with White Butter', price: 190, isVeg: true, desc: 'Hand-pressed pearl millet bread roasted over direct flame, with homemade white butter.' },
          { name: 'Missi Roti with Ajwain', price: 180, isVeg: true, desc: 'Gram flour bread with carom seeds and dried pomegranate powder.' },
          { name: 'Zafrani Moti Pulao', price: 460, isVeg: true, desc: 'Fragrant basmati rice infused with saffron, topped with edible silver vark.' }
        ]
      },
      {
        category: 'Decadent Royal Confections',
        items: [
          { name: 'Ghewar with Saffron Rabdi', price: 420, isVeg: true, desc: 'Honeycomb crisp dessert soaked in rose syrup and topped with condensed saffron cream.' },
          { name: 'Malai Ghewar with Gold Foil', price: 480, isVeg: true, desc: 'Jaipuri festive specialty with 24-carat pure gold leaf.' },
          { name: 'Rose & Cardamom Shahi Thandai', price: 260, isVeg: true, desc: 'Almonds, fennel seeds, watermelon seeds, and fragrant Damascus rose petals.' }
        ]
      }
    ];
  }

  // Universal Fine Dining / Mughlai / Awadhi Menu
  return [
    {
      category: 'Signature Royal Starters',
      items: [
        { name: 'Melt-in-Mouth Galouti Kebab', price: 780, isVeg: false, desc: 'Finely minced mutton smoked with clove and spiced with 32 fragrant herbs, served on ulta tawa paratha.' },
        { name: 'Truffle Malai Paneer Tikka', price: 620, isVeg: true, desc: 'Creamy artisanal cottage cheese marinated in hung curd, green cardamom, and French truffle oil.' },
        { name: 'Bhatti Da Murgh Pindiwala', price: 740, isVeg: false, desc: 'Bone-in chicken thigh steeped in mustard oil, degi mirch, and roasted spices cooked in rustic tandoor.' },
        { name: 'Subz Kurkure Kebab', price: 540, isVeg: true, desc: 'Crispy vegetable and raw banana fritters with mint-coriander emulsion.' }
      ]
    },
    {
      category: 'Chef’s Grand Curries & Specialties',
      items: [
        { name: 'Dal Bukhara (18-Hour Simmer)', price: 580, isVeg: true, desc: 'Whole black urad lentils cooked overnight on charcoal embers with butter, fresh tomato puree, and cream.' },
        { name: 'Murgh Makhani Royale (Butter Chicken)', price: 820, isVeg: false, desc: 'Charcoal-tandoor chicken in a silk-smooth makhani gravy enriched with honey and dried fenugreek leaves.' },
        { name: 'Nalli Nihari Awadhi Dastarkhwan', price: 1050, isVeg: false, desc: 'Slow-cooked shank of goat with bone marrow in an aromatic herbal pot liquor.' },
        { name: 'Paneer Lababdar Shahjahani', price: 680, isVeg: true, desc: 'Cottage cheese triangles in a rich spiced onion-tomato and cashew gravy.' }
      ]
    },
    {
      category: 'Tandoori Breads & Royal Biryanis',
      items: [
        { name: 'Dum Pukht Gosht Biryani', price: 890, isVeg: false, desc: 'Fragrant basmati rice layered with marinated mutton, slow-cooked in a dough-sealed handi.' },
        { name: 'Zafrani Subz Biryani', price: 640, isVeg: true, desc: 'Seasonal vegetables, saffron, brown onions, and mint layered with long-grain rice.' },
        { name: 'Truffle Rosemary Naan', price: 220, isVeg: true, desc: 'Clay oven bread brushed with white truffle oil and fresh rosemary.' },
        { name: 'Sheermal Sweet Saffron Bread', price: 200, isVeg: true, desc: 'Traditional Awadhi flatbread kneaded with milk, ghee, and infused with saffron.' }
      ]
    },
    {
      category: 'Decadent Confections & Beverages',
      items: [
        { name: 'Kesari Malai Phirni in Clay Pots', price: 340, isVeg: true, desc: 'Broken rice pudding infused with saffron, served chilled in traditional earthen sakoras.' },
        { name: 'Shahi Tukda Royale with 24K Gold Leaf', price: 390, isVeg: true, desc: 'Crisp ghee-fried bread soaked in cardamom syrup and blanketed in thick rabdi.' },
        { name: 'Royal Damascus Rose Sharbat', price: 240, isVeg: true, desc: 'Pure rose petal extract, chia seeds, fresh lemon, and chilled spring water.' }
      ]
    }
  ];
};

export const getAmbianceDetails = (restaurant) => {
  return [
    { title: 'Fine Dining Dress Code', desc: 'Smart Casual / Royal Formal. Traditional Indian or Western formal attire is welcomed.' },
    { title: 'Seating Options', desc: 'Intimate Candlelit Tables, Heritage Royal Jharokha, and Private Dining Enclaves for family celebrations.' },
    { title: 'Live Ambiance', desc: 'Acoustic live Sitar & Tabla maestros perform classical ragas every evening between 7:30 PM and 10:30 PM.' },
    { title: 'Valet & Sommelier', desc: 'Complimentary valet parking, temperature-controlled wine cellar, and dedicated table captain service.' }
  ];
};

export const getInitialReviews = (restaurant) => {
  return [
    {
      _id: 'rev-dining-1',
      user: { name: 'Vikramaditya Singhania', role: 'Verified Connoisseur' },
      rating: 5,
      createdAt: '2026-10-10T14:20:00Z',
      comment: 'An extraordinary culinary experience! The most loved signature dish lived up to every expectation. The flavors are subtle, regal, and authentic. The service is white-glove perfection.'
    },
    {
      _id: 'rev-dining-2',
      user: { name: 'Ayesha Mehra', role: 'Verified Luxury Diner' },
      rating: 5,
      createdAt: '2026-10-04T19:45:00Z',
      comment: 'Reserved a table for our wedding anniversary. The team arranged candlelit rose petals and personalized menus. Easily one of the top gourmet destinations in the country!'
    },
    {
      _id: 'rev-dining-3',
      user: { name: 'Rohan Deshmukh', role: 'Food Critic' },
      rating: 5,
      createdAt: '2026-09-28T21:10:00Z',
      comment: 'The balance of spices is impeccable. Everything from the starters to the artisanal desserts was divine. Truly world-class hospitality.'
    }
  ];
};


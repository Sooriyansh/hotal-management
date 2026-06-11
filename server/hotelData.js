export const hotelData = {
  hotel: {
    name: "Grand Luxury Hotel & Restaurant",
    address: "Central Avenue, Luxury District",
    phone: "9691368925",
    email: "india@ideaclap@gmail.com",
    restaurantTiming: "7:00 AM to 11:30 PM"
  },
  rooms: [
    { id: "deluxe", name: "Deluxe Room", category: "Deluxe", price: 8500, availability: "available", capacity: 2, rating: 4.8, amenities: ["King bed", "City view", "Rain shower", "Smart concierge"], images: ["deluxe-room"] },
    { id: "executive", name: "Executive Room", category: "Executive", price: 12000, availability: "available", capacity: 2, rating: 4.9, amenities: ["Workspace", "Club lounge", "Nespresso", "Airport transfer"], images: ["executive-room"] },
    { id: "family", name: "Family Room", category: "Family", price: 15000, availability: "available", capacity: 4, rating: 4.8, amenities: ["Two bedrooms", "Kids menu", "Balcony", "Laundry care"], images: ["family-room"] },
    { id: "suite", name: "Luxury Suite", category: "Suite", price: 25000, availability: "limited", capacity: 3, rating: 5, amenities: ["Private terrace", "Butler service", "Jacuzzi", "Dining salon"], images: ["luxury-suite"] },
    { id: "presidential", name: "Presidential Suite", category: "Presidential", price: 50000, availability: "limited", capacity: 6, rating: 5, amenities: ["Panoramic floor", "Chef on call", "Boardroom", "Spa bath"], images: ["presidential-suite"] }
  ],
  restaurant: [
    { id: "f1", name: "Paneer Tikka", category: "Indian Cuisine", price: 349, description: "Paneer, tandoori spices, mint chutney", availability: "available", ingredients: ["Paneer", "Tandoori spices", "Mint chutney"], rating: 4.9, tags: ["Chef Special", "Vegetarian"] },
    { id: "f2", name: "Veg Biryani", category: "Indian Cuisine", price: 299, description: "Basmati rice, vegetables, saffron", availability: "available", ingredients: ["Basmati rice", "Vegetables", "Saffron"], rating: 4.9, tags: ["Popular", "Dinner"] },
    { id: "f3", name: "Hakka Noodles", category: "Chinese Cuisine", price: 279, description: "Noodles, vegetables, wok sauce", availability: "available", ingredients: ["Noodles", "Vegetables", "Wok sauce"], rating: 4.8, tags: ["Lunch", "Favorite"] },
    { id: "f4", name: "Dim Sum Imperial Basket", category: "Chinese Cuisine", price: 449, description: "Prawn, chive, sesame dipping sauce", availability: "available", ingredients: ["Prawn", "Chive", "Sesame"], rating: 4.7, tags: ["Shareable", "Lunch"] },
    { id: "f5", name: "Gold Leaf Chocolate Torte", category: "Desserts", price: 399, description: "Dark chocolate, almond praline, gold leaf", availability: "available", ingredients: ["Dark chocolate", "Almond", "Gold leaf"], rating: 4.9, tags: ["Dessert", "Signature"] },
    { id: "f6", name: "Sunrise Wellness Bowl", category: "Breakfast", price: 249, description: "Greek yogurt, berries, granola", availability: "available", ingredients: ["Greek yogurt", "Berries", "Granola"], rating: 4.7, tags: ["Breakfast", "Healthy"] },
    { id: "f7", name: "Sparkling Rose Mocktail", category: "Beverages", price: 199, description: "Rose, citrus, sparkling water", availability: "available", ingredients: ["Rose", "Citrus", "Sparkling water"], rating: 4.8, tags: ["Beverage", "Refreshing"] },
    { id: "f8", name: "Tandoori Platter", category: "Dinner", price: 699, description: "Tandoori kebabs, chutney, salad", availability: "available", ingredients: ["Tandoori kebabs", "Chutney", "Salad"], rating: 5, tags: ["Dinner", "Chef Special"] }
  ],
  reservations: [
    { table: "T1", status: "available", date: "today" },
    { table: "T2", status: "booked", date: "today" },
    { table: "T3", status: "reserved", date: "today" },
    { table: "T4", status: "available", date: "today" },
    { table: "T5", status: "available", date: "today" },
    { table: "T6", status: "booked", date: "today" }
  ],
  events: [
    { id: "wedding", name: "Wedding Hall Booking", category: "Wedding", price: 150000, availability: "available", description: "Luxury hall, dedicated coordinator, premium setup" },
    { id: "conference", name: "Conference Hall Booking", category: "Conference", price: 75000, availability: "available", description: "Boardroom setup, AV support, tea service" },
    { id: "birthday", name: "Birthday Party Packages", category: "Birthday", price: 45000, availability: "available", description: "Decor, cake table, curated dining menu" },
    { id: "corporate", name: "Corporate Event Packages", category: "Corporate", price: 60000, availability: "limited", description: "Networking setup, presentation support, buffet options" }
  ],
  spa: [
    { id: "aroma", name: "Aroma Gold Massage", price: 15000, availability: "available", description: "Aroma therapy massage with gold wellness oil" },
    { id: "couples", name: "Couples Ritual", price: 22500, availability: "available", description: "Private couples therapy suite and wellness tea" },
    { id: "thermal", name: "Thermal Wellness Day", price: 30000, availability: "limited", description: "Thermal circuit, steam, sauna, relaxation lounge" },
    { id: "executive", name: "Executive Recovery Package", price: 37500, availability: "available", description: "Deep tissue recovery and guided relaxation" }
  ],
  offers: [
    { id: "grand20", name: "GRAND20", type: "coupon", discount: "20% demo discount", status: "active", details: "Apply GRAND20 during food checkout." },
    { id: "chef-table", name: "Chef Table Combo", type: "dining", discount: "15% off demo combo", status: "active", details: "Paneer Tikka, Veg Biryani, and Chocolate Torte pairing." }
  ],
  analytics: {
    popularRooms: [
      { name: "Luxury Suite", value: 42 },
      { name: "Executive Room", value: 31 },
      { name: "Family Room", value: 24 }
    ],
    popularFoods: [
      { name: "Paneer Tikka", value: 58 },
      { name: "Veg Biryani", value: 44 },
      { name: "Hakka Noodles", value: 39 }
    ],
    bookingTrends: [
      { month: "Jan", bookings: 128, revenue: 180 },
      { month: "Feb", bookings: 148, revenue: 220 },
      { month: "Mar", bookings: 176, revenue: 260 },
      { month: "Apr", bookings: 205, revenue: 310 },
      { month: "May", bookings: 242, revenue: 390 },
      { month: "Jun", bookings: 286, revenue: 460 }
    ],
    customerPreferences: ["Suite stays", "Indian dinner", "Couples spa", "Wedding package"]
  }
};

export function getAvailableRooms() {
  return hotelData.rooms.filter((room) => room.availability !== "sold out");
}

export function getRestaurantMenu() {
  return hotelData.restaurant.filter((item) => item.availability === "available");
}

export function getAvailableTables() {
  return hotelData.reservations.filter((table) => table.status === "available");
}

export function getWeddingPackages() {
  return hotelData.events.filter((event) => event.category.toLowerCase() === "wedding");
}

export function getActiveOffers() {
  return hotelData.offers.filter((offer) => offer.status === "active");
}

export function getSpaServices() {
  return hotelData.spa.filter((service) => service.availability !== "sold out");
}

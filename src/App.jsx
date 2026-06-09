import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, OrbitControls } from "@react-three/drei";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  BedDouble,
  Bell,
  BadgeCheck,
  CalendarCheck,
  Camera,
  ChefHat,
  CircleDollarSign,
  CloudSun,
  Copy,
  Clock,
  CreditCard,
  Crown,
  Dumbbell,
  Gem,
  Globe2,
  Heart,
  Hotel,
  KeyRound,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Mic,
  Minus,
  Navigation as NavigationIcon,
  Phone,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Send as SendIcon,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Users,
  Utensils,
  Video,
  Volume2,
  WandSparkles,
  Wifi,
  X
} from "lucide-react";
import {
  addToCart,
  applyCoupon,
  clearCart,
  removeFromCart,
  setReservation,
  setRoomSearch,
  updateQty
} from "./store.js";
import { askConcierge, getAiInsights } from "./services/conciergeApi.js";

const heroVideo = "https://videos.pexels.com/video-files/3121327/3121327-uhd_2560_1440_24fps.mp4";

const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Rooms", "/rooms"],
  ["Restaurant", "/restaurant"],
  ["Menu", "/menu"],
  ["Food Order", "/food-order"],
  ["Events", "/events"],
  ["Spa", "/spa"],
  ["Gallery", "/gallery"],
  ["Contact", "/contact"]
];

const roomImages = [
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"
];

const rooms = [
  { id: "deluxe", name: "Deluxe Room", price: 220, capacity: 2, rating: 4.8, image: roomImages[0], amenities: ["King bed", "City view", "Rain shower", "Smart concierge"] },
  { id: "executive", name: "Executive Room", price: 310, capacity: 2, rating: 4.9, image: roomImages[1], amenities: ["Workspace", "Club lounge", "Nespresso", "Airport transfer"] },
  { id: "family", name: "Family Room", price: 390, capacity: 4, rating: 4.8, image: roomImages[2], amenities: ["Two bedrooms", "Kids menu", "Balcony", "Laundry care"] },
  { id: "suite", name: "Luxury Suite", price: 540, capacity: 3, rating: 5, image: roomImages[3], amenities: ["Private terrace", "Butler service", "Jacuzzi", "Dining salon"] },
  { id: "presidential", name: "Presidential Suite", price: 1250, capacity: 6, rating: 5, image: roomImages[4], amenities: ["Panoramic floor", "Chef on call", "Boardroom", "Spa bath"] }
];

const food = [
  { id: "f1", name: "Truffle Saffron Risotto", category: "Italian Cuisine", price: 32, rating: 4.9, image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80", tags: ["Chef Special", "Vegetarian"] },
  { id: "f2", name: "Royal Butter Chicken", category: "Indian Cuisine", price: 28, rating: 4.9, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80", tags: ["Popular", "Dinner"] },
  { id: "f3", name: "Wagyu Signature Burger", category: "Fast Food", price: 26, rating: 4.8, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80", tags: ["Lunch", "Favorite"] },
  { id: "f4", name: "Dim Sum Imperial Basket", category: "Chinese Cuisine", price: 24, rating: 4.7, image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80", tags: ["Shareable", "Lunch"] },
  { id: "f5", name: "Gold Leaf Chocolate Torte", category: "Desserts", price: 18, rating: 4.9, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80", tags: ["Dessert", "Signature"] },
  { id: "f6", name: "Sunrise Wellness Bowl", category: "Breakfast", price: 16, rating: 4.7, image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=900&q=80", tags: ["Breakfast", "Healthy"] },
  { id: "f7", name: "Sparkling Rose Mocktail", category: "Beverages", price: 12, rating: 4.8, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80", tags: ["Beverage", "Refreshing"] },
  { id: "f8", name: "Tuscan Herb Sea Bass", category: "Dinner", price: 38, rating: 5, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80", tags: ["Dinner", "Chef Special"] }
];

const gallery = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80"
];

const analytics = [
  { month: "Jan", revenue: 180, bookings: 128, orders: 220 },
  { month: "Feb", revenue: 220, bookings: 148, orders: 260 },
  { month: "Mar", revenue: 260, bookings: 176, orders: 310 },
  { month: "Apr", revenue: 310, bookings: 205, orders: 360 },
  { month: "May", revenue: 390, bookings: 242, orders: 440 },
  { month: "Jun", revenue: 460, bookings: 286, orders: 510 }
];

const experienceStats = [
  ["50,000+", "Happy Guests"],
  ["120+", "Luxury Rooms"],
  ["25+", "Awards"],
  ["15 Years", "Experience"]
];

const tourStops = [
  ["Reception Tour", gallery[0]],
  ["Room Tour", roomImages[3]],
  ["Restaurant Tour", gallery[1]],
  ["Spa Tour", gallery[6]],
  ["Swimming Pool Tour", gallery[7]]
];

const vipLevels = [
  ["Silver", "5% dining discount, express support"],
  ["Gold", "Free room upgrade when available"],
  ["Platinum", "Priority booking and spa credit"],
  ["Diamond", "Butler access, chef table priority"]
];

const trendingFeatures = [
  [WandSparkles, "AI Concierge"],
  [Mic, "Voice Booking"],
  [BadgeCheck, "Face Check-In"],
  [KeyRound, "Digital Room Key"],
  [Video, "AR Menu Preview"],
  [Hotel, "3D Room Tours"],
  [TrendingUp, "Smart Recommendations"],
  [Bell, "Real-Time Notifications"],
  [Phone, "WhatsApp Booking"]
];

const restaurantTables = [
  ["T1", "available"],
  ["T2", "booked"],
  ["T3", "reserved"],
  ["T4", "available"],
  ["T5", "available"],
  ["T6", "booked"]
];

const nutritionDetails = {
  "Truffle Saffron Risotto": ["510 kcal", "Contains dairy", "Wild mushrooms, saffron, parmesan"],
  "Royal Butter Chicken": ["620 kcal", "Contains dairy", "Tandoor chicken, tomato cream, fenugreek"],
  "Wagyu Signature Burger": ["780 kcal", "Contains gluten", "Wagyu patty, aged cheddar, brioche"],
  "Dim Sum Imperial Basket": ["420 kcal", "Contains soy", "Prawn, chive, sesame dipping sauce"],
  "Gold Leaf Chocolate Torte": ["460 kcal", "Contains nuts", "Dark chocolate, almond praline, gold leaf"],
  "Sunrise Wellness Bowl": ["330 kcal", "Nut optional", "Greek yogurt, berries, granola"],
  "Sparkling Rose Mocktail": ["120 kcal", "No common allergens", "Rose, citrus, sparkling water"],
  "Tuscan Herb Sea Bass": ["540 kcal", "Contains fish", "Sea bass, herbs, lemon butter"]
};

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <LuxuryCursor />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/food-order" element={<FoodOrder />} />
          <Route path="/events" element={<Events />} />
          <Route path="/spa" element={<Spa />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Chatbot />
      <MobileBottomNav />
      <Footer />
    </div>
  );
}

function LuxuryCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const move = (event) => setPosition({ x: event.clientX, y: event.clientY });
    const over = (event) => setHovering(Boolean(event.target.closest("a, button, input, select, textarea")));
    const click = (event) => {
      const id = `${Date.now()}-${event.clientX}`;
      setRipples((current) => [...current.slice(-3), { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => setRipples((current) => current.filter((item) => item.id !== id)), 580);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("click", click);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("click", click);
    };
  }, []);

  return (
    <>
      <div className="premium-cursor" style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)` }} />
      <div className={`premium-cursor-ring ${hovering ? "is-hovering" : ""}`} style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)` }} />
      {ripples.map((ripple) => <span key={ripple.id} className="click-ripple" style={{ left: ripple.x, top: ripple.y }} />)}
    </>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-gold/25 bg-midnight/88 p-2 shadow-glow backdrop-blur-xl md:hidden">
      {[
        [Hotel, "/", "Home"],
        [BedDouble, "/rooms", "Rooms"],
        [Utensils, "/menu", "Menu"],
        [ShoppingBag, "/food-order", "Order"],
        [LayoutDashboard, "/dashboard", "Dash"]
      ].map(([Icon, to, label]) => (
        <NavLink key={to} to={to} className={({ isActive }) => `grid place-items-center gap-1 rounded-xl py-2 text-[10px] ${isActive ? "bg-gold text-midnight" : "text-pearl/70"}`}>
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const count = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.qty, 0));
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-midnight/78 backdrop-blur-xl">
      <nav className="section-shell flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-gold/10 shadow-glow">
            <Crown className="h-5 w-5 text-gold" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl font-bold gold-text">Grand Luxury</span>
            <span className="text-[11px] uppercase tracking-[0.25em] text-champagne/70">Hotel & Restaurant</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 xl:flex">
          {navItems.map(([label, to]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `rounded-md px-3 py-2 text-sm transition ${isActive ? "bg-gold/15 text-gold" : "text-pearl/78 hover:bg-white/8 hover:text-white"}`}>
              {label}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-2 xl:flex">
          <IconLink to="/food-order" label="Cart" count={count} icon={<ShoppingBag />} />
          <Link to="/dashboard" className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold hover:border-gold/60">Dashboard</Link>
          <Link to="/admin" className="rounded-md border border-gold/70 bg-gold px-4 py-2 text-sm font-bold text-midnight">Book Now</Link>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-md border border-white/10 xl:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X /> : <MenuIcon />}
        </button>
      </nav>
      {open && (
        <div className="section-shell pb-5 xl:hidden">
          <div className="glass grid gap-1 rounded-lg p-3">
            {navItems.map(([label, to]) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-pearl/85 hover:bg-white/10">{label}</NavLink>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/dashboard" className="rounded-md border border-white/10 px-3 py-2 text-center text-sm">Dashboard</Link>
              <Link to="/admin" className="rounded-md bg-gold px-3 py-2 text-center text-sm font-bold text-midnight">Book Now</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function IconLink({ to, label, count, icon }) {
  return (
    <Link to={to} className="relative grid h-10 w-10 place-items-center rounded-md border border-white/10 text-pearl/80 hover:border-gold/60" aria-label={label}>
      <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      {count > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-wine px-1 text-[11px] font-bold">{count}</span>}
    </Link>
  );
}

function SectionTitle({ eyebrow, title, copy }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-gold">{eyebrow}</p>
      <h2 className="font-display text-4xl font-bold text-pearl md:text-6xl">{title}</h2>
      {copy && <p className="mt-4 text-pearl/68">{copy}</p>}
    </motion.div>
  );
}

function Home() {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 42 });
  const particles = useMemo(() => Array.from({ length: 26 }, (_, index) => ({
    id: index,
    left: `${(index * 37) % 100}%`,
    top: `${18 + ((index * 19) % 68)}%`,
    delay: `${(index % 7) * 0.45}s`
  })), []);

  return (
    <>
      <section
        className="cinematic-hero relative min-h-screen overflow-hidden pt-20"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setSpotlight({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
        }}
      >
        <video className="absolute inset-0 h-full w-full object-cover opacity-45" autoPlay muted loop playsInline poster={gallery[0]}>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-spotlight absolute inset-0" style={{ "--mx": `${spotlight.x}%`, "--my": `${spotlight.y}%` }} />
        {particles.map((particle) => <span key={particle.id} className="gold-particle" style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }} />)}
        <motion.div className="absolute left-1/2 top-28 h-36 w-[34rem] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" animate={{ opacity: [0.2, 0.55, 0.2], scale: [0.9, 1.12, 0.9] }} transition={{ duration: 5, repeat: Infinity }} />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/45 via-midnight/72 to-midnight" />
        <div className="section-shell relative grid min-h-[calc(100vh-80px)] items-center gap-10 py-12 lg:grid-cols-[1.08fr_.92fr]">
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-gold">
              <Sparkles className="h-4 w-4" /> Five star urban retreat
            </p>
            <h1 className="font-luxury text-5xl font-bold leading-[0.95] text-pearl md:text-7xl lg:text-8xl">
              <span className="block gold-text">Grand Luxury</span>
              <span className="mt-3 block text-3xl md:text-5xl lg:text-6xl">Hotel & Restaurant</span>
            </h1>
            <p className="mt-6 max-w-2xl overflow-hidden text-lg font-semibold leading-8 text-champagne md:text-2xl">
              <span className="typewriter">Experience Luxury Beyond Imagination</span>
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-pearl/72">A cinematic 5-star hospitality platform with AI butler assistance, 3D tours, smart booking, premium dining, VIP membership, and management dashboards.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/rooms" className="magnetic-button rounded-md bg-gold px-6 py-3 font-bold text-midnight shadow-glow">Book a Room</Link>
              <Link to="/restaurant" className="magnetic-button rounded-md border border-white/15 px-6 py-3 font-bold text-pearl hover:border-gold/60">Reserve a Table</Link>
            </div>
          </motion.div>
          <BookingPanel />
        </div>
      </section>
      <LuxuryCounters />
      <ThreeDHotelExperience />
      <VirtualTour />
      <FeaturedRooms />
      <RestaurantShowcase />
      <VipMembership />
      <Facilities />
      <Trending2026 />
      <TravelWidgets />
      <Testimonials />
      <Offers />
      <LocationMap />
    </>
  );
}

function BookingPanel() {
  const dispatch = useDispatch();
  const roomForm = useForm({ defaultValues: { checkIn: "", checkOut: "", guests: "2", room: "Luxury Suite" } });
  const tableForm = useForm({ defaultValues: { date: "", time: "20:00", guests: "2", occasion: "Dinner" } });
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass rounded-lg p-5 shadow-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Instant concierge</p>
          <h2 className="font-display text-3xl font-semibold">Plan Your Visit</h2>
        </div>
        <CalendarCheck className="h-8 w-8 text-gold" />
      </div>
      <form className="grid gap-3" onSubmit={roomForm.handleSubmit((data) => dispatch(setRoomSearch(data)))}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="luxury-input" type="date" {...roomForm.register("checkIn")} />
          <input className="luxury-input" type="date" {...roomForm.register("checkOut")} />
          <select className="luxury-input" {...roomForm.register("guests")}><option>1</option><option>2</option><option>3</option><option>4</option><option>6</option></select>
          <select className="luxury-input" {...roomForm.register("room")}>{rooms.map((room) => <option key={room.id}>{room.name}</option>)}</select>
        </div>
        <button className="rounded-md bg-gold py-3 font-bold text-midnight">Search Rooms</button>
      </form>
      <div className="my-5 h-px bg-gold-line" />
      <form className="grid gap-3" onSubmit={tableForm.handleSubmit((data) => dispatch(setReservation(data)))}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="luxury-input" type="date" {...tableForm.register("date")} />
          <input className="luxury-input" type="time" {...tableForm.register("time")} />
          <select className="luxury-input" {...tableForm.register("guests")}><option>2</option><option>4</option><option>6</option><option>8</option></select>
          <select className="luxury-input" {...tableForm.register("occasion")}><option>Dinner</option><option>Birthday</option><option>Business</option><option>Anniversary</option></select>
        </div>
        <button className="rounded-md border border-gold/60 py-3 font-bold text-gold">Reserve Table</button>
      </form>
    </motion.div>
  );
}

function LuxuryCounters() {
  return (
    <section className="border-y border-gold/15 bg-ink/78 py-10">
      <div className="section-shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {experienceStats.map(([value, label], index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} viewport={{ once: true }} className="glass rounded-lg p-5 text-center">
            <p className="font-luxury text-4xl font-bold gold-text md:text-5xl">{value}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-pearl/58">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ThreeDHotelExperience() {
  return (
    <section className="py-20">
      <div className="section-shell grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-gold">3D hotel model</p>
          <h2 className="font-display text-5xl font-bold">Interactive arrival, rooms, and skyline preview.</h2>
          <p className="mt-5 leading-8 text-pearl/68">Drag the model, orbit the building, and preview the premium property language before guests choose a room or tour.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["3D Room Tours", "AR Menu Preview", "Digital Room Key"].map((item) => <span key={item} className="rounded-md border border-gold/25 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold">{item}</span>)}
          </div>
        </div>
        <div className="h-[420px] overflow-hidden rounded-lg border border-gold/25 bg-black shadow-glow">
          <Canvas camera={{ position: [4, 3, 6], fov: 42 }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[4, 5, 4]} intensity={2.2} color="#ffd700" />
            <Float speed={1.4} rotationIntensity={0.45} floatIntensity={0.6}>
              <HotelModel />
            </Float>
            <Environment preset="city" />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
          </Canvas>
        </div>
      </div>
    </section>
  );
}

function HotelModel() {
  return (
    <group>
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[3.8, 0.24, 2.6]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.4} roughness={0.35} />
      </mesh>
      {[-1.15, 0, 1.15].map((x, index) => (
        <mesh key={x} position={[x, 0.6 + index * 0.22, 0]}>
          <boxGeometry args={[0.92, 2 + index * 0.42, 1.4]} />
          <meshStandardMaterial color={index === 1 ? "#D4AF37" : "#222222"} metalness={0.55} roughness={0.22} />
        </mesh>
      ))}
      {Array.from({ length: 18 }).map((_, index) => (
        <mesh key={index} position={[-1.55 + (index % 6) * 0.62, 0.25 + Math.floor(index / 6) * 0.55, -0.73]}>
          <boxGeometry args={[0.18, 0.18, 0.02]} />
          <meshStandardMaterial color="#FFD700" emissive="#D4AF37" emissiveIntensity={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 2.45, 0]}>
        <coneGeometry args={[1.05, 0.82, 4]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.18} />
      </mesh>
    </group>
  );
}

function VirtualTour() {
  return (
    <section className="bg-pearl py-20 text-midnight">
      <div className="section-shell">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-wine">Virtual hotel tour</p>
          <h2 className="font-display text-4xl font-bold text-midnight md:text-6xl">360 degree luxury experiences</h2>
          <p className="mt-4 text-midnight/68">Reception, rooms, restaurant, spa, and pool previews are presented as high-motion tour cards.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {tourStops.map(([title, image]) => (
            <motion.article key={title} whileHover={{ y: -8, rotateX: 4 }} className="overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="relative h-56 overflow-hidden">
                <img src={image} alt={title} className="h-full w-full object-cover transition duration-700 hover:scale-110" />
                <span className="absolute right-3 top-3 rounded-full bg-midnight/80 px-3 py-1 text-xs font-bold text-gold">360</span>
                <PlayCircle className="absolute bottom-3 left-3 h-10 w-10 text-gold drop-shadow" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-2xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-midnight/62">Virtual tour, video preview, and guest inspection mode.</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedRooms() {
  return (
    <section className="py-20">
      <div className="section-shell">
        <SectionTitle eyebrow="Rooms & suites" title="Private comfort, polished service" copy="Category cards include galleries, amenities, availability, capacity, pricing, ratings, and booking actions." />
        <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 3600 }} spaceBetween={18} breakpoints={{ 768: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } }}>
          {rooms.map((room) => (
            <SwiperSlide key={room.id}>
              <RoomCard room={room} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function RoomCard({ room }) {
  return (
    <motion.article whileHover={{ y: -8 }} className="glass tilt-card overflow-hidden rounded-lg">
      <div className="relative h-64 overflow-hidden">
        <img src={room.image} alt={room.name} className="h-full w-full object-cover transition duration-700 hover:scale-110" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-midnight/82 px-3 py-1 text-xs font-bold text-gold"><span className="availability-dot mr-2" />Live Available</span>
          <span className="rounded-full bg-midnight/82 px-3 py-1 text-xs font-bold text-pearl">360 Tour</span>
        </div>
        <button className="magnetic-button absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-xs font-bold text-midnight"><Video className="h-4 w-4" /> Preview</button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-3xl font-semibold">{room.name}</h3>
            <p className="mt-1 text-sm text-pearl/62">Available tonight • Sleeps {room.capacity}</p>
          </div>
          <span className="rounded-md bg-gold/15 px-2 py-1 text-sm font-bold text-gold">${room.price}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{room.amenities.map((item) => <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-pearl/70">{item}</span>)}</div>
        <div className="mt-5 rounded-lg border border-gold/20 bg-gold/10 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-pearl/58">Peak season</span>
            <span className="line-through text-pearl/45">${Math.round(room.price * 1.25)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-bold text-gold">20% OFF</span>
            <span className="text-xs text-pearl/58">Offer Ends In 02:14:35</span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-gold"><Star className="h-4 w-4 fill-gold" /> {room.rating}</span>
          <div className="flex gap-2">
            <button className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-pearl/70">Compare</button>
            <Link to="/rooms" className="magnetic-button rounded-md border border-gold/55 px-4 py-2 text-sm font-bold text-gold">Book</Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function RestaurantShowcase() {
  return (
    <section className="bg-pearl py-20 text-midnight">
      <div className="section-shell grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-wine">Restaurant showcase</p>
          <h2 className="font-display text-5xl font-bold">Digital dining from reservation to delivery.</h2>
          <p className="mt-5 text-midnight/70">Browse cuisine categories, chef recommendations, popular dishes, table bookings, order tracking, favorites, coupons, and customer reviews.</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {["Breakfast", "Lunch", "Dinner", "Indian Cuisine", "Chinese Cuisine", "Italian Cuisine", "Desserts", "Beverages"].map((item) => (
              <span key={item} className="rounded-md border border-midnight/10 bg-white px-4 py-3 text-sm font-semibold">{item}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {food.slice(0, 4).map((item) => <FoodCard key={item.id} item={item} light />)}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <LiveTableSelection />
            <ChefRecommendations />
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveTableSelection() {
  const statusStyles = {
    available: "bg-emerald-500",
    booked: "bg-red-500",
    reserved: "bg-yellow-400"
  };
  return (
    <div className="rounded-lg border border-midnight/10 bg-white p-4 shadow-lg">
      <h3 className="font-display text-2xl font-semibold">Live Table Selection</h3>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {restaurantTables.map(([table, status]) => (
          <button key={table} className="rounded-md border border-midnight/10 p-3 text-sm font-bold">
            <span className={`mr-2 inline-block h-3 w-3 rounded-full ${statusStyles[status]}`} />
            {table}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChefRecommendations() {
  return (
    <div className="rounded-lg border border-midnight/10 bg-white p-4 shadow-lg">
      <h3 className="font-display text-2xl font-semibold">Chef Live Recommendations</h3>
      <div className="mt-4 grid gap-2">
        {["Chef Special: Tuscan Herb Sea Bass", "Trending: Royal Butter Chicken", "Best Seller: Truffle Saffron Risotto", "New Arrival: Rose Mocktail"].map((item) => (
          <p key={item} className="rounded-md bg-midnight/5 px-3 py-2 text-sm">{item}</p>
        ))}
      </div>
    </div>
  );
}

function FoodCard({ item, light = false }) {
  const dispatch = useDispatch();
  const details = nutritionDetails[item.name] || ["Chef curated", "Ask for allergens", "Premium seasonal ingredients"];
  return (
    <motion.article whileHover={{ y: -6, rotateY: light ? 0 : -3 }} className={`tilt-card overflow-hidden rounded-lg ${light ? "bg-white shadow-xl" : "glass"}`}>
      <div className="relative h-44 overflow-hidden">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-700 hover:scale-110" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-midnight/80 px-3 py-1 text-xs font-bold text-gold"><PlayCircle className="h-3 w-3" /> Food Video</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-display text-2xl font-semibold ${light ? "text-midnight" : ""}`}>{item.name}</h3>
          <button aria-label="Favorite item" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 text-gold"><Heart className="h-4 w-4" /></button>
        </div>
        <p className={`mt-1 text-sm ${light ? "text-midnight/60" : "text-pearl/60"}`}>{item.category} • {item.tags.join(" • ")}</p>
        <div className={`mt-3 grid gap-1 text-xs ${light ? "text-midnight/58" : "text-pearl/58"}`}>
          {details.map((detail) => <span key={detail}>{detail}</span>)}
          <span>Chef note: plated fresh with premium garnish.</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-gold">${item.price}</span>
          <button onClick={() => dispatch(addToCart(item))} className="rounded-md bg-gold px-3 py-2 text-sm font-bold text-midnight">Add</button>
        </div>
      </div>
    </motion.article>
  );
}

function Facilities() {
  const items = [
    [Hotel, "Hotel Management", "Room inventory, pricing, availability, booking status, invoices."],
    [Utensils, "Restaurant Management", "Menu, categories, special offers, reservations, kitchen status."],
    [Dumbbell, "Spa & Wellness", "Massage bookings, wellness packages, private spa pricing."],
    [Camera, "Gallery & CMS", "Masonry media gallery, testimonials, offers, content controls."]
  ];
  return (
    <section className="py-20">
      <div className="section-shell">
        <SectionTitle eyebrow="Facilities" title="A complete management experience" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map(([Icon, title, copy]) => (
            <motion.div key={title} whileHover={{ y: -6 }} className="glass rounded-lg p-6">
              <Icon className="mb-5 h-9 w-9 text-gold" />
              <h3 className="font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-pearl/65">{copy}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VipMembership() {
  return (
    <section className="py-20">
      <div className="section-shell">
        <SectionTitle eyebrow="VIP membership" title="Silver to Diamond guest loyalty" copy="Discounts, free upgrades, priority booking, and private butler access in a premium membership ladder." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {vipLevels.map(([level, benefit], index) => (
            <motion.div key={level} whileHover={{ y: -8, scale: 1.02 }} className="glass rounded-lg p-6">
              <Gem className="mb-5 h-10 w-10 text-gold" />
              <p className="text-xs uppercase tracking-[0.24em] text-pearl/48">Tier {index + 1}</p>
              <h3 className="mt-2 font-luxury text-3xl font-bold gold-text">{level}</h3>
              <p className="mt-4 text-sm leading-6 text-pearl/68">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trending2026() {
  return (
    <section className="bg-ink py-20">
      <div className="section-shell">
        <SectionTitle eyebrow="Trending 2026" title="Modern hospitality technology signals" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trendingFeatures.map(([Icon, title]) => (
            <motion.div key={title} whileHover={{ x: 6 }} className="glass flex items-center gap-4 rounded-lg p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-gold text-midnight"><Icon className="h-5 w-5" /></span>
              <span className="font-semibold text-pearl/82">{title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TravelWidgets() {
  const widgets = [
    [CloudSun, "Weather", "29 C, clear evening, ideal rooftop dining"],
    [NavigationIcon, "Nearby Attractions", "Museum District 8 min, Riverside 12 min"],
    [CircleDollarSign, "Currency", "USD 1 = INR 83.2 demo rate"],
    [Globe2, "Travel Guide", "Airport transfer, city tour, luxury shopping"]
  ];
  return (
    <section className="py-20">
      <div className="section-shell">
        <SectionTitle eyebrow="Smart travel layer" title="Weather, attractions, converter, and guide" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {widgets.map(([Icon, title, copy]) => (
            <div key={title} className="glass rounded-lg p-5">
              <Icon className="mb-4 h-8 w-8 text-gold" />
              <h3 className="font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-pearl/62">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-20">
      <div className="section-shell">
        <SectionTitle eyebrow="Testimonials" title="Guest reviews with a golden afterglow" />
        <div className="grid gap-4 md:grid-cols-3">
          {["The suite, tasting menu, and spa sequence felt completely choreographed.", "Ordering dinner from the room dashboard was beautifully simple.", "The admin panel gives every operation a calm, premium command center."].map((quote, index) => (
            <div key={quote} className="glass rounded-lg p-6">
              <div className="mb-4 flex text-gold">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold" />)}</div>
              <p className="text-pearl/76">“{quote}”</p>
              <p className="mt-5 text-sm font-bold text-gold">Guest {index + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offers() {
  return (
    <section className="bg-ink py-20">
      <div className="section-shell grid gap-4 md:grid-cols-3">
        {["Suite + Spa Weekend", "Chef's Table for Two", "Wedding Hall Prestige"].map((offer, index) => (
          <div key={offer} className="rounded-lg border border-gold/20 bg-gradient-to-br from-gold/15 to-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-gold">Latest offer</p>
            <h3 className="mt-3 font-display text-3xl font-semibold">{offer}</h3>
            <p className="mt-3 text-sm text-pearl/65">{15 + index * 5}% savings with loyalty points and concierge priority.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LocationMap() {
  return (
    <section className="py-20">
      <div className="section-shell glass grid gap-8 rounded-lg p-6 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Location</p>
          <h2 className="mt-3 font-display text-4xl font-bold">Central Avenue, Luxury District</h2>
          <p className="mt-4 text-pearl/65">Minutes from the airport, financial center, cultural boulevard, and riverside promenade.</p>
        </div>
        <div className="grid min-h-72 place-items-center rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(214,173,86,.22),rgba(63,125,114,.18)),url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center">
          <MapPin className="h-14 w-14 text-gold drop-shadow" />
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <PageShell eyebrow="About us" title="Hospitality, cuisine, and ritual in one address">
      <div className="grid gap-6 lg:grid-cols-2">
        <InfoPanel title="Hotel Story" copy="Grand Luxury began as a private residence-inspired hotel with butler-led guest care, quiet interiors, and service that remembers preference without becoming intrusive." />
        <InfoPanel title="Restaurant Story" copy="The restaurant pairs regional craft with global fine dining, offering chef recommendations, digital menus, table bookings, and curated tasting experiences." />
        <InfoPanel title="Mission & Vision" copy="To make every stay, meal, event, and wellness appointment feel personal, efficient, and unmistakably premium." />
        <InfoPanel title="Awards & Achievements" copy="Five-star service distinction, best urban dining room, sustainable luxury operations, and guest choice recognition." />
      </div>
      <Timeline />
    </PageShell>
  );
}

function Timeline() {
  return (
    <div className="mt-12 grid gap-4 md:grid-cols-4">
      {["Founded", "Restaurant Launched", "Spa Wing Added", "Digital Platform"].map((item, index) => (
        <div key={item} className="glass rounded-lg p-5">
          <p className="text-3xl font-bold text-gold">{2018 + index * 2}</p>
          <h3 className="mt-2 font-display text-2xl">{item}</h3>
        </div>
      ))}
    </div>
  );
}

function Rooms() {
  const [budget, setBudget] = useState(600);
  const [capacity, setCapacity] = useState(2);
  const filteredRooms = rooms.filter((room) => room.price <= budget && room.capacity >= capacity);
  return (
    <PageShell eyebrow="Rooms & suites" title="Availability, elegance, and category control">
      <SmartRoomFinder budget={budget} capacity={capacity} onBudget={setBudget} onCapacity={setCapacity} />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredRooms.map((room) => <RoomCard key={room.id} room={room} />)}</div>
    </PageShell>
  );
}

function SmartRoomFinder({ budget, capacity, onBudget, onCapacity }) {
  const suggested = rooms.find((room) => room.price <= budget && room.capacity >= capacity) || rooms[0];
  return (
    <div className="glass rounded-lg p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <div>
          <h2 className="font-display text-3xl font-semibold">Smart Room Finder</h2>
          <p className="mt-2 text-sm text-pearl/62">Filter by budget, capacity, view, amenities, floor, and rating. AI suggestion updates from your preferences.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-pearl/72">Budget up to ${budget}<input type="range" min="220" max="1300" value={budget} onChange={(event) => onBudget(Number(event.target.value))} className="mt-2 w-full accent-gold" /></label>
            <label className="text-sm text-pearl/72">Capacity {capacity}+<input type="range" min="1" max="6" value={capacity} onChange={(event) => onCapacity(Number(event.target.value))} className="mt-2 w-full accent-gold" /></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{["City View", "High Floor", "Jacuzzi", "Balcony", "Butler", "5 Star"].map((item) => <span key={item} className="rounded-full border border-gold/25 px-3 py-1 text-xs text-gold">{item}</span>)}</div>
        </div>
        <div className="rounded-lg border border-gold/25 bg-gold/10 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">AI suggestion</p>
          <h3 className="mt-2 font-luxury text-3xl gold-text">{suggested.name}</h3>
          <p className="mt-3 text-sm text-pearl/68">Best match for your budget and capacity. Includes {suggested.amenities.slice(0, 2).join(" and ")}.</p>
        </div>
      </div>
    </div>
  );
}

function Restaurant() {
  return (
    <PageShell eyebrow="Restaurant" title="Fine dining, digital menu, and table reservations">
      <RestaurantShowcase />
      <ReservationForm />
      <Testimonials />
    </PageShell>
  );
}

function ReservationForm() {
  const { register, handleSubmit, reset } = useForm();
  const [sent, setSent] = useState(false);
  return (
    <section className="py-12">
      <form onSubmit={handleSubmit(() => { setSent(true); reset(); })} className="glass mx-auto grid max-w-3xl gap-4 rounded-lg p-6">
        <h2 className="font-display text-4xl font-semibold">Online Table Booking</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="luxury-input" placeholder="Name" {...register("name", { required: true })} />
          <input className="luxury-input" placeholder="Phone" {...register("phone", { required: true })} />
          <input className="luxury-input" type="date" {...register("date", { required: true })} />
          <input className="luxury-input" type="time" {...register("time", { required: true })} />
          <select className="luxury-input" {...register("guests")}><option>2 guests</option><option>4 guests</option><option>6 guests</option><option>8 guests</option></select>
          <select className="luxury-input" {...register("occasion")}><option>Dinner</option><option>Anniversary</option><option>Corporate</option><option>Birthday</option></select>
        </div>
        <button className="rounded-md bg-gold px-5 py-3 font-bold text-midnight">Confirm Reservation</button>
        {sent && <p className="text-sm text-gold">Reservation request captured.</p>}
      </form>
    </section>
  );
}

function MenuPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(food.map((item) => item.category))];
  const filtered = food.filter((item) => (category === "All" || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <PageShell eyebrow="Digital menu" title="Search, filter, favorite, and order">
      <div className="mb-8 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gold" />
          <input className="luxury-input pl-11" placeholder="Search food" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-md px-4 py-2 text-sm font-semibold ${category === item ? "bg-gold text-midnight" : "border border-white/10 text-pearl/75"}`}>{item}</button>)}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{filtered.map((item) => <FoodCard key={item.id} item={item} />)}</div>
    </PageShell>
  );
}

function FoodOrder() {
  const dispatch = useDispatch();
  const { items, coupon } = useSelector((state) => state.cart);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = coupon === "GRAND20" ? subtotal * 0.2 : 0;
  return (
    <PageShell eyebrow="Online food ordering" title="Cart, checkout, summary, coupons, tracking">
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-lg p-5">
          <WandSparkles className="mb-4 h-8 w-8 text-gold" />
          <h3 className="font-display text-2xl">AI Food Recommendation</h3>
          <p className="mt-2 text-sm text-pearl/62">Royal Butter Chicken pairs best with Sparkling Rose Mocktail and Gold Leaf Chocolate Torte.</p>
        </div>
        <div className="glass rounded-lg p-5">
          <RefreshCw className="mb-4 h-8 w-8 text-gold" />
          <h3 className="font-display text-2xl">Frequently Ordered</h3>
          <p className="mt-2 text-sm text-pearl/62">Wagyu Signature Burger, Tuscan Herb Sea Bass, Sunrise Wellness Bowl.</p>
        </div>
        <div className="glass rounded-lg p-5">
          <ShoppingBag className="mb-4 h-8 w-8 text-gold" />
          <h3 className="font-display text-2xl">Combo Suggestions</h3>
          <p className="mt-2 text-sm text-pearl/62">Chef Table Combo: Risotto + Sea Bass + Chocolate Torte, 15% off demo.</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="grid gap-4">
          {items.length === 0 && <div className="glass rounded-lg p-8 text-pearl/70">Your cart is ready for something wonderful. Add dishes from the menu.</div>}
          {items.map((item) => (
            <div key={item.id} className="glass flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center">
              <img src={item.image} alt={item.name} className="h-24 w-full rounded-md object-cover sm:w-32" />
              <div className="flex-1">
                <h3 className="font-display text-2xl">{item.name}</h3>
                <p className="text-sm text-pearl/60">${item.price} • {item.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="grid h-9 w-9 place-items-center rounded-md border border-white/10" onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty - 1 }))}><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-bold">{item.qty}</span>
                <button className="grid h-9 w-9 place-items-center rounded-md border border-white/10" onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty + 1 }))}><Plus className="h-4 w-4" /></button>
                <button className="grid h-9 w-9 place-items-center rounded-md border border-wine/40 text-wine" onClick={() => dispatch(removeFromCart(item.id))}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="glass h-fit rounded-lg p-6">
          <h2 className="font-display text-3xl font-semibold">Order Summary</h2>
          <input className="luxury-input mt-4" placeholder="Coupon GRAND20" onChange={(event) => dispatch(applyCoupon(event.target.value))} />
          <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          <SummaryRow label="Discount" value={`-$${discount.toFixed(2)}`} />
          <SummaryRow label="Delivery" value="$8.00" />
          <SummaryRow label="Total" value={`$${(subtotal - discount + (items.length ? 8 : 0)).toFixed(2)}`} strong />
          <button onClick={() => dispatch(clearCart())} className="mt-5 w-full rounded-md bg-gold py-3 font-bold text-midnight">Place Order</button>
          <div className="mt-6 rounded-lg border border-white/10 p-4">
            <p className="mb-3 text-sm font-bold text-gold">Order Tracking</p>
            {["Order Received", "Preparing", "Cooking", "Ready", "Delivered"].map((step, index) => <p key={step} className="border-l border-gold/40 py-2 pl-4 text-sm text-pearl/68">{index + 1}. {step}</p>)}
            <div className="mt-4 space-y-2">
              <div className="skeleton-line h-3 rounded-full" />
              <div className="skeleton-line h-3 w-2/3 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function SummaryRow({ label, value, strong }) {
  return <div className={`mt-4 flex justify-between ${strong ? "border-t border-white/10 pt-4 text-lg font-bold text-gold" : "text-pearl/72"}`}><span>{label}</span><span>{value}</span></div>;
}

function Events() {
  return (
    <PageShell eyebrow="Events & banquets" title="Weddings, conferences, birthdays, corporate packages">
      <PackageGrid items={["Wedding Hall Booking", "Conference Hall Booking", "Birthday Party Packages", "Corporate Event Packages"]} />
      <ReservationForm />
    </PageShell>
  );
}

function Spa() {
  return (
    <PageShell eyebrow="Spa & wellness" title="Massage booking and wellness packages">
      <PackageGrid items={["Aroma Gold Massage", "Couples Ritual", "Thermal Wellness Day", "Executive Recovery Package"]} />
    </PageShell>
  );
}

function PackageGrid({ items }) {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{items.map((item, index) => <div key={item} className="glass rounded-lg p-6"><Sparkles className="mb-5 h-8 w-8 text-gold" /><h3 className="font-display text-2xl">{item}</h3><p className="mt-3 text-sm text-pearl/60">From ${180 + index * 90}. Includes dedicated coordinator and premium setup.</p></div>)}</div>;
}

function Gallery() {
  const [active, setActive] = useState(null);
  return (
    <PageShell eyebrow="Gallery" title="Hotel, restaurant, and video inspired masonry">
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[["Video Gallery", Video], ["Before / After Suites", Camera], ["Infinite Scroll Ready", RefreshCw]].map(([item, Icon]) => (
          <div key={item} className="glass rounded-lg p-5">
            <Icon className="mb-4 h-8 w-8 text-gold" />
            <h3 className="font-display text-2xl">{item}</h3>
            <p className="mt-2 text-sm text-pearl/60">Hover zoom, fullscreen preview, and premium media state.</p>
          </div>
        ))}
      </div>
      <div className="masonry">{gallery.map((image, index) => <button key={image} onClick={() => setActive(image)} className="mb-4 block overflow-hidden rounded-lg border border-white/10"><img src={image} alt={`Grand Luxury gallery ${index + 1}`} className="w-full object-cover transition duration-500 hover:scale-105" /></button>)}</div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {roomImages.slice(0, 2).map((image, index) => (
          <div key={image} className="glass overflow-hidden rounded-lg">
            <div className="grid grid-cols-2">
              <img src={image} alt="Before suite styling" className="h-56 w-full object-cover opacity-60 grayscale" />
              <img src={gallery[index]} alt="After suite styling" className="h-56 w-full object-cover" />
            </div>
            <div className="flex justify-between p-4 text-sm text-pearl/68"><span>Before</span><span className="text-gold">After luxury styling</span></div>
          </div>
        ))}
      </div>
      {active && <div className="fixed inset-0 z-[70] grid place-items-center bg-black/88 p-6" onClick={() => setActive(null)}><img src={active} alt="Expanded gallery" className="max-h-[86vh] rounded-lg object-contain" /></div>}
    </PageShell>
  );
}

function Contact() {
  return (
    <PageShell eyebrow="Contact" title="Concierge, reservations, directions, and FAQs">
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="glass rounded-lg p-6">
          <InfoLine icon={<MapPin />} text="Central Avenue, Luxury District" />
          <InfoLine icon={<Phone />} text="9691368925" />
          <InfoLine icon={<Mail />} text="india@ideaclap@gmail.com" />
          <InfoLine icon={<Clock />} text="Restaurant 7:00 AM - 11:30 PM" />
        </div>
        <form className="glass grid gap-4 rounded-lg p-6">
          <input className="luxury-input" placeholder="Name" />
          <input className="luxury-input" placeholder="Email" />
          <textarea className="luxury-input min-h-32" placeholder="Message" />
          <button className="rounded-md bg-gold py-3 font-bold text-midnight">Send Message</button>
        </form>
      </div>
      <LocationMap />
    </PageShell>
  );
}

function InfoLine({ icon, text }) {
  return <p className="mb-4 flex items-center gap-3 text-pearl/75"><span className="text-gold [&>svg]:h-5 [&>svg]:w-5">{icon}</span>{text}</p>;
}

function CustomerDashboard() {
  return (
    <PageShell eyebrow="Customer dashboard" title="Bookings, orders, reservations, profile, reviews">
      <StatsGrid stats={[["Loyalty Points", "8,420"], ["Active Booking", "Luxury Suite"], ["Food Order", "Kitchen preparing"], ["Notifications", "4 new"]]} />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <ChartPanel title="Personal Spending Analytics">
          <ResponsiveContainer width="100%" height={260}><AreaChart data={analytics}><defs><linearGradient id="guestSpend" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.75} /><stop offset="95%" stopColor="#D4AF37" stopOpacity={0.04} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" /><XAxis dataKey="month" stroke="#f4e8c7" /><YAxis stroke="#f4e8c7" /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="#D4AF37" fill="url(#guestSpend)" /></AreaChart></ResponsiveContainer>
        </ChartPanel>
        <div className="glass rounded-lg p-5">
          <h3 className="font-display text-2xl font-semibold">Personalized Recommendations</h3>
          <div className="mt-4 grid gap-3">
            {["Favorite Room: Luxury Suite", "Next Best Stay: Executive Room high floor", "Food Pick: Tuscan Herb Sea Bass", "VIP Level: Platinum eligible soon"].map((item) => <p key={item} className="rounded-md border border-gold/20 bg-gold/10 px-3 py-3 text-sm text-pearl/72">{item}</p>)}
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <DashboardPanel title="Hotel Bookings" items={["Current booking: Luxury Suite", "History: 12 stays", "Invoice download ready", "Booking details synced"]} />
        <DashboardPanel title="Restaurant Reservations" items={["Reserved table: Tonight 8:00 PM", "Reservation history: 9", "Anniversary notes saved"]} />
        <DashboardPanel title="Food Orders" items={["Active order: 4 items", "Previous orders: 18", "Live tracking enabled"]} />
        <DashboardPanel title="Profile Management" items={["Personal information", "Security settings", "Address management", "Profile picture upload"]} />
        <DashboardPanel title="Reviews & Ratings" items={["Room reviews", "Food reviews", "Restaurant reviews"]} />
        <DashboardPanel title="Notifications" items={["Spa offer", "Checkout reminder", "Chef special available"]} />
      </div>
    </PageShell>
  );
}

function AdminDashboard() {
  const pieData = [{ name: "Rooms", value: 45 }, { name: "Dining", value: 30 }, { name: "Events", value: 15 }, { name: "Spa", value: 10 }];
  return (
    <PageShell eyebrow="Admin dashboard" title="Revenue, operations, CMS, staff, payments">
      <StatsGrid stats={[["Total Revenue", "$460K"], ["Hotel Bookings", "286"], ["Food Orders", "510"], ["Occupancy Rate", "91%"]]} />
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Monthly Growth">
          <ResponsiveContainer width="100%" height={290}><AreaChart data={analytics}><defs><linearGradient id="goldFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#d6ad56" stopOpacity={0.8} /><stop offset="95%" stopColor="#d6ad56" stopOpacity={0.04} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" /><XAxis dataKey="month" stroke="#f4e8c7" /><YAxis stroke="#f4e8c7" /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="#d6ad56" fill="url(#goldFill)" /></AreaChart></ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Bookings & Orders">
          <ResponsiveContainer width="100%" height={290}><BarChart data={analytics}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" /><XAxis dataKey="month" stroke="#f4e8c7" /><YAxis stroke="#f4e8c7" /><Tooltip /><Legend /><Bar dataKey="bookings" fill="#d6ad56" /><Bar dataKey="orders" fill="#3f7d72" /></BarChart></ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Revenue Channels">
          <ResponsiveContainer width="100%" height={290}><PieChart><Pie data={pieData} dataKey="value" outerRadius={95} label>{pieData.map((entry, index) => <Cell key={entry.name} fill={["#d6ad56", "#3f7d72", "#7a2e43", "#f4e8c7"][index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Customer Statistics">
          <ResponsiveContainer width="100%" height={290}><LineChart data={analytics}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" /><XAxis dataKey="month" stroke="#f4e8c7" /><YAxis stroke="#f4e8c7" /><Tooltip /><Line type="monotone" dataKey="orders" stroke="#d6ad56" strokeWidth={3} /><Line type="monotone" dataKey="bookings" stroke="#3f7d72" strokeWidth={3} /></LineChart></ResponsiveContainer>
        </ChartPanel>
      </div>
      <AdminAiInsights />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["Hotel Management", "Restaurant Management", "Reservation Management", "Food Order Management", "Customer Management", "Staff Management", "Payments Management", "CMS Management"].map((title) => <DashboardPanel key={title} title={title} items={["List view", "Create/edit/delete", "Status workflow", "Reports"]} />)}
      </div>
    </PageShell>
  );
}

function AdminAiInsights() {
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAiInsights()
      .then((data) => {
        if (active) setInsights(data);
      })
      .catch(() => {
        if (active) setError("AI insights API unavailable.");
      });
    return () => {
      active = false;
    };
  }, []);

  const data = insights || {
    popularRooms: rooms.slice(1, 4).map((room) => ({ name: room.name, value: Math.round(room.rating * 8) })),
    popularFoods: food.slice(0, 3).map((item) => ({ name: item.name, value: Math.round(item.rating * 10) })),
    bookingTrends: analytics,
    customerPreferences: ["Suite stays", "Chef specials", "Spa packages", "Family rooms"]
  };

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-gold" />
        <h2 className="font-display text-3xl font-semibold">AI Insights</h2>
        {error && <span className="text-xs text-pearl/45">{error}</span>}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Popular Rooms">
          <ResponsiveContainer width="100%" height={250}><BarChart data={data.popularRooms}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" /><XAxis dataKey="name" stroke="#f4e8c7" /><YAxis stroke="#f4e8c7" /><Tooltip /><Bar dataKey="value" fill="#d6ad56" /></BarChart></ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Popular Foods">
          <ResponsiveContainer width="100%" height={250}><BarChart data={data.popularFoods}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" /><XAxis dataKey="name" stroke="#f4e8c7" /><YAxis stroke="#f4e8c7" /><Tooltip /><Bar dataKey="value" fill="#3f7d72" /></BarChart></ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Booking Trends">
          <ResponsiveContainer width="100%" height={250}><LineChart data={data.bookingTrends}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" /><XAxis dataKey="month" stroke="#f4e8c7" /><YAxis stroke="#f4e8c7" /><Tooltip /><Line type="monotone" dataKey="bookings" stroke="#d6ad56" strokeWidth={3} /><Line type="monotone" dataKey="revenue" stroke="#3f7d72" strokeWidth={3} /></LineChart></ResponsiveContainer>
        </ChartPanel>
        <div className="glass rounded-lg p-5">
          <h3 className="font-display text-2xl font-semibold">Revenue & Preferences</h3>
          <div className="mt-4 grid gap-3">
            <p className="rounded-md border border-gold/20 bg-gold/10 px-3 py-3 text-sm text-pearl/72">Revenue insight: suite bookings and dining orders are the strongest premium conversion signals.</p>
            {data.customerPreferences.map((item) => <p key={item} className="rounded-md border border-white/10 px-3 py-2 text-sm text-pearl/68">{item}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsGrid({ stats }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value]) => <div key={label} className="glass rounded-lg p-5"><p className="text-sm text-pearl/58">{label}</p><p className="mt-2 font-display text-4xl font-bold text-gold">{value}</p></div>)}</div>;
}

function DashboardPanel({ title, items }) {
  return <div className="glass rounded-lg p-5"><h3 className="font-display text-2xl font-semibold">{title}</h3><div className="mt-4 grid gap-2">{items.map((item) => <p key={item} className="rounded-md border border-white/10 px-3 py-2 text-sm text-pearl/68">{item}</p>)}</div></div>;
}

function ChartPanel({ title, children }) {
  return <div className="glass rounded-lg p-5"><h3 className="mb-4 font-display text-2xl font-semibold">{title}</h3>{children}</div>;
}

function InfoPanel({ title, copy }) {
  return <div className="glass rounded-lg p-6"><h2 className="font-display text-3xl font-semibold text-gold">{title}</h2><p className="mt-4 leading-7 text-pearl/70">{copy}</p></div>;
}

function PageShell({ eyebrow, title, children }) {
  return (
    <div className="pt-28">
      <section className="section-shell py-12">
        <SectionTitle eyebrow={eyebrow} title={title} />
        {children}
      </section>
    </div>
  );
}

function Chatbot() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const welcomeMessage = "Welcome to Grand Luxury Hotel & Restaurant. I can assist you with hotel bookings, room availability, room pricing, restaurant reservations, food ordering, events, spa services, special offers, and hotel facilities. How may I help you today?";
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("grandLuxuryAiChat");
    if (saved) return JSON.parse(saved);
    return [{ from: "bot", text: welcomeMessage, time: new Date().toISOString() }];
  });
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const chatBodyRef = useRef(null);
  const recognitionRef = useRef(null);
  const quickActions = ["Available Rooms", "Book Room", "Restaurant Menu", "Reserve Table", "Today's Offers", "Spa Services", "Wedding Packages", "Contact Reception"];

  useEffect(() => {
    localStorage.setItem("grandLuxuryAiChat", JSON.stringify(messages));
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const findOrderedFood = (value) => food.find((item) => {
    const normalized = value.toLowerCase();
    return normalized.includes(item.name.toLowerCase()) || item.name.toLowerCase().split(" ").some((word) => word.length > 5 && normalized.includes(word));
  });

  const addMessage = (message) => {
    setMessages((current) => [...current, { time: new Date().toISOString(), ...message }]);
  };

  const send = async (value = text) => {
    if (!value.trim() || loading) return;
    const orderedFood = /(order|add|cart|mangao|manga|bhejo|chahiye|do|pick)/i.test(value) ? findOrderedFood(value) : null;
    if (orderedFood) dispatch(addToCart(orderedFood));
    const userMessage = { from: "user", text: value, time: new Date().toISOString() };
    setMessages((current) => [...current, userMessage]);
    setText("");
    setLoading(true);
    try {
      const result = await askConcierge(value, [...messages, userMessage]);
      const orderNote = orderedFood ? `${orderedFood.name} cart mein add ho gaya hai. ` : "";
      addMessage({ from: "bot", text: `${orderNote}${result.reply}`, source: result.source });
      speak(`${orderNote}${result.reply}`);
    } catch {
      const fallback = "Please contact our reception team for the latest information.";
      addMessage({ from: "bot", text: fallback, source: "fallback" });
      speak(fallback);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    const lastUserMessage = [...messages].reverse().find((message) => message.from === "user");
    if (lastUserMessage) send(lastUserMessage.text);
  };

  const clearChat = () => {
    const fresh = [{ from: "bot", text: welcomeMessage, time: new Date().toISOString() }];
    setMessages(fresh);
    localStorage.setItem("grandLuxuryAiChat", JSON.stringify(fresh));
  };

  const copyMessage = async (value) => {
    await navigator.clipboard?.writeText(value);
  };

  const speak = (value) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.rate = 0.94;
    window.speechSynthesis.speak(utterance);
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage({ from: "bot", text: "Voice recognition is not supported in this browser." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setText(transcript);
      if (transcript) send(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass mb-3 flex h-[min(680px,calc(100vh-110px))] w-[min(420px,calc(100vw-28px))] flex-col rounded-lg shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <p className="font-bold text-gold">Gemini AI Concierge</p>
              <p className="text-xs text-pearl/55">English, Hindi, Hinglish, voice and live hotel data</p>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Regenerate response" onClick={regenerate} className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gold"><RefreshCw className="h-4 w-4" /></button>
              <button aria-label="Clear chat" onClick={clearChat} className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gold"><Trash2 className="h-4 w-4" /></button>
              <button aria-label="Minimize chat" onClick={() => setMinimized((value) => !value)} className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gold"><Minus className="h-4 w-4" /></button>
              <button aria-label="Close chat" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gold"><X className="h-4 w-4" /></button>
            </div>
          </div>
          {!minimized && (
            <>
              <div ref={chatBodyRef} className="flex-1 space-y-3 overflow-auto p-4">
                {messages.map((message, index) => (
                  <div key={`${message.time}-${index}`} className={`group max-w-[88%] rounded-lg px-3 py-2 text-sm ${message.from === "bot" ? "bg-white/10 text-pearl/82" : "ml-auto bg-gold text-midnight"}`}>
                    <p className="whitespace-pre-wrap leading-6">{message.text}</p>
                    <div className={`mt-2 flex items-center gap-2 text-[10px] ${message.from === "bot" ? "text-pearl/45" : "text-midnight/60"}`}>
                      <span>{new Date(message.time || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <button aria-label="Copy message" onClick={() => copyMessage(message.text)}><Copy className="h-3.5 w-3.5" /></button>
                      {message.from === "bot" && <button aria-label="Read message aloud" onClick={() => speak(message.text)}><Volume2 className="h-3.5 w-3.5" /></button>}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="max-w-[82%] rounded-lg bg-white/10 px-3 py-3">
                    <div className="flex items-center gap-2 text-xs text-gold"><span>Concierge thinking</span><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold delay-100" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold delay-200" /></div>
                    <div className="mt-3 space-y-2"><div className="skeleton-line h-3 rounded-full" /><div className="skeleton-line h-3 w-2/3 rounded-full" /></div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {quickActions.map((item) => <button key={item} onClick={() => send(item)} className="rounded-full border border-gold/30 px-3 py-1 text-xs text-gold transition hover:bg-gold hover:text-midnight">{item}</button>)}
              </div>
              <div className="flex gap-2 border-t border-white/10 p-3">
                <button aria-label="Voice input" onClick={startVoice} className={`grid h-11 w-11 shrink-0 place-items-center rounded-md border border-white/10 ${listening ? "bg-gold text-midnight" : "text-gold"}`}><Mic className="h-5 w-5" /></button>
                <input className="luxury-input" value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Ask concierge..." />
                <button aria-label="Send message" disabled={loading} onClick={() => send()} className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-gold font-bold text-midnight disabled:opacity-60"><SendIcon className="h-5 w-5" /></button>
              </div>
            </>
          )}
        </motion.div>
      )}
      <button onClick={() => setOpen((value) => !value)} className="grid h-14 w-14 place-items-center rounded-full bg-gold text-midnight shadow-glow" aria-label="Open AI chatbot">
        <MessageCircle />
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink py-12">
      <div className="section-shell grid gap-8 md:grid-cols-4">
        <div><h2 className="font-display text-3xl font-bold gold-text">Grand Luxury</h2><p className="mt-3 text-sm text-pearl/60">Hotel, restaurant, spa, events, food ordering, and management dashboards.</p></div>
        <div><h3 className="font-bold text-gold">Quick Links</h3><div className="mt-3 grid gap-2 text-sm text-pearl/65">{navItems.slice(0, 6).map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}</div></div>
        <div><h3 className="font-bold text-gold">Contact</h3><p className="mt-3 text-sm text-pearl/65">Central Avenue<br />9691368925<br />india@ideaclap@gmail.com</p></div>
        <div><h3 className="font-bold text-gold">Newsletter</h3><input className="luxury-input mt-3" placeholder="Email address" /><button className="mt-3 rounded-md border border-gold/60 px-4 py-2 text-sm font-bold text-gold">Subscribe</button></div>
      </div>
    </footer>
  );
}

export default App;

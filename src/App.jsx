import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Toaster, toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
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
  CheckCircle2,
  CircleDollarSign,
  CloudSun,
  Copy,
  Clock,
  CreditCard,
  Crown,
  Download,
  Dumbbell,
  Gem,
  Globe2,
  Heart,
  Hotel,
  IndianRupee,
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
  QrCode,
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
  VolumeX,
  WandSparkles,
  Wifi,
  X
} from "lucide-react";
import heroVideo from "../video/video.mp4";
import {
  addToCart,
  applyCoupon,
  cancelBooking,
  clearCart,
  createBooking,
  createOrder,
  createPayment,
  createReservation,
  removeFromCart,
  setReservation,
  setRoomSearch,
  updateBookingStatus,
  updateOrderStatus,
  updatePaymentStatus,
  updateReservationStatus,
  updateQty,
  closeAuthModal,
  closeBookingModal,
  closeReservationModal,
  hydrateStore,
  markNotificationRead,
  openAuthModal,
  openBookingModal,
  openReservationModal,
  setAuth,
  setActiveDialog,
  setNotifications,
  setReviews,
  setWishlist
} from "./store.js";
import { askConcierge, getAiInsights } from "./services/conciergeApi.js";
import {
  createBooking as apiCreateBooking,
  createOrder as apiCreateOrder,
  createPayment as apiCreatePayment,
  createReservation as apiCreateReservation,
  createReview as apiCreateReview,
  createNotification as apiCreateNotification,
  getBootstrap,
  getProfile,
  login as apiLogin,
  markNotificationsRead as apiMarkNotificationsRead,
  register as apiRegister,
  resetPassword as apiResetPassword,
  forgotPassword as apiForgotPassword,
  toggleWishlist as apiToggleWishlist
} from "./services/appApi.js";

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
  { id: "deluxe", name: "Deluxe Room", price: 8500, capacity: 2, rating: 4.8, image: roomImages[0], amenities: ["King bed", "City view", "Rain shower", "Smart concierge"] },
  { id: "executive", name: "Executive Room", price: 12000, capacity: 2, rating: 4.9, image: roomImages[1], amenities: ["Workspace", "Club lounge", "Nespresso", "Airport transfer"] },
  { id: "family", name: "Family Room", price: 15000, capacity: 4, rating: 4.8, image: roomImages[2], amenities: ["Two bedrooms", "Kids menu", "Balcony", "Laundry care"] },
  { id: "suite", name: "Luxury Suite", price: 25000, capacity: 3, rating: 5, image: roomImages[3], amenities: ["Private terrace", "Butler service", "Jacuzzi", "Dining salon"] },
  { id: "presidential", name: "Presidential Suite", price: 50000, capacity: 6, rating: 5, image: roomImages[4], amenities: ["Panoramic floor", "Chef on call", "Boardroom", "Spa bath"] }
];

const food = [
  { id: "f1", name: "Paneer Tikka", category: "Indian Cuisine", price: 349, rating: 4.9, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80", tags: ["Chef Special", "Vegetarian"] },
  { id: "f2", name: "Veg Biryani", category: "Indian Cuisine", price: 299, rating: 4.9, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=900&q=80", tags: ["Popular", "Dinner"] },
  { id: "f3", name: "Hakka Noodles", category: "Chinese Cuisine", price: 279, rating: 4.8, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80", tags: ["Lunch", "Favorite"] },
  { id: "f4", name: "Dim Sum Imperial Basket", category: "Chinese Cuisine", price: 449, rating: 4.7, image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80", tags: ["Shareable", "Lunch"] },
  { id: "f5", name: "Gold Leaf Chocolate Torte", category: "Desserts", price: 399, rating: 4.9, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80", tags: ["Dessert", "Signature"] },
  { id: "f6", name: "Sunrise Wellness Bowl", category: "Breakfast", price: 249, rating: 4.7, image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=900&q=80", tags: ["Breakfast", "Healthy"] },
  { id: "f7", name: "Sparkling Rose Mocktail", category: "Beverages", price: 199, rating: 4.8, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80", tags: ["Beverage", "Refreshing"] },
  { id: "f8", name: "Tandoori Platter", category: "Dinner", price: 699, rating: 5, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80", tags: ["Dinner", "Chef Special"] }
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
  "Paneer Tikka": ["410 kcal", "Contains dairy", "Paneer, tandoori spices, mint chutney"],
  "Veg Biryani": ["520 kcal", "Contains dairy", "Basmati rice, vegetables, saffron"],
  "Hakka Noodles": ["480 kcal", "Contains soy", "Noodles, vegetables, wok sauce"],
  "Dim Sum Imperial Basket": ["420 kcal", "Contains soy", "Prawn, chive, sesame dipping sauce"],
  "Gold Leaf Chocolate Torte": ["460 kcal", "Contains nuts", "Dark chocolate, almond praline, gold leaf"],
  "Sunrise Wellness Bowl": ["330 kcal", "Nut optional", "Greek yogurt, berries, granola"],
  "Sparkling Rose Mocktail": ["120 kcal", "No common allergens", "Rose, citrus, sparkling water"],
  "Tandoori Platter": ["640 kcal", "Contains dairy", "Tandoori kebabs, chutney, salad"]
};

const roomNumbers = {
  deluxe: ["201", "202", "203"],
  executive: ["301", "302"],
  family: ["401", "402"],
  suite: ["501", "502"],
  presidential: ["701"]
};

const bookingStatuses = ["Pending", "Confirmed", "Checked In", "Checked Out", "Cancelled"];
const foodStatuses = ["Order Received", "Accepted", "Preparing", "Cooking", "Ready", "Out For Delivery", "Delivered"];
const paymentMethods = ["UPI", "Credit Card", "Debit Card", "Net Banking"];
const foodPaymentMethods = ["UPI", "Card", "Cash"];
const deliveryTypes = ["Room Delivery", "Restaurant Pickup", "Table Service"];
const currencyLabel = "₹ INR";

function formatINR(value) {
  return `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")} INR`;
}

function nightsBetween(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.ceil((end - start) / 86400000);
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}

function generateId(prefix) {
  return `${prefix}-GL-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${Math.floor(100 + Math.random() * 900)}`;
}

function parseCount(value) {
  return Number.parseInt(String(value || "0"), 10) || 0;
}

function isRoomBooked(booking, roomId, checkIn, checkOut) {
  if (!checkIn || !checkOut || booking.roomId !== roomId || booking.status === "Cancelled" || booking.status === "Checked Out") return false;
  return overlaps(checkIn, checkOut, booking.checkIn, booking.checkOut);
}

function getAvailableRoomNumbers(bookings, roomId, checkIn, checkOut) {
  const bookedNumbers = new Set(
    bookings
      .filter((booking) => isRoomBooked(booking, roomId, checkIn, checkOut))
      .map((booking) => booking.roomNumber)
  );
  return (roomNumbers[roomId] || []).filter((roomNumber) => !bookedNumbers.has(roomNumber));
}

function downloadInvoice(record, type) {
  const isBooking = type === "Booking";
  const detailLines = isBooking
    ? [
        `Room Type: ${record.roomType}`,
        `Room Number: ${record.roomNumber}`,
        `Stay: ${record.checkIn} to ${record.checkOut}`,
        `Nights: ${record.nights}`,
        `Price Per Night: ${formatINR(record.pricePerNight || 0)}`
      ]
    : [
        `Delivery Type: ${record.deliveryType}`,
        `Items: ${(record.items || []).map((item) => `${item.qty} x ${item.name} (${formatINR(item.price)})`).join(", ")}`,
        `Subtotal: ${formatINR(record.subtotal || 0)}`
      ];
  const lines = [
    "Grand Luxury Hotel & Restaurant",
    "Professional GST Invoice",
    "Hotel Logo: Grand Luxury Crown",
    `Invoice: ${record.invoice}`,
    `${type} ID: ${record.id}`,
    `Customer: ${record.customer?.fullName || record.customer?.name || "Guest"}`,
    `Mobile: ${record.customer?.mobile || ""}`,
    `Email: ${record.customer?.email || ""}`,
    `Address: ${record.customer?.address || ""}`,
    ...detailLines,
    `Discount: ${formatINR(record.discount || 0)}`,
    `GST: ${formatINR(record.taxes || 0)}`,
    `Total Amount: ${formatINR(record.total || 0)}`,
    `Payment: ${record.paymentMethod} - ${record.paymentStatus}`,
    `Reward Points Earned: ${record.rewardPoints || Math.floor((record.total || 0) / 100)}`,
    "Thank you for choosing Grand Luxury."
  ];
  const blob = new Blob([lines.join("\n")], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${record.invoice}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const booking = useSelector((state) => state.booking);
  const orders = useSelector((state) => state.orders);
  const payments = useSelector((state) => state.payments);
  const reservations = useSelector((state) => state.reservations);
  const auth = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist);
  const reviews = useSelector((state) => state.reviews);
  const notifications = useSelector((state) => state.notifications);

  useEffect(() => {
    getBootstrap()
      .then((data) => {
        dispatch(
          hydrateStore({
            booking: {
              roomSearch: booking.roomSearch,
              reservation: booking.reservation,
              bookings: data.bookings || []
            },
            orders: { orders: data.orders || [] },
            payments: { payments: data.payments || [] },
            reservations: { reservations: data.reservations || [] },
            reviews: { items: data.reviews || [] },
            wishlist: { items: data.wishlist || [] },
            notifications: { items: data.notifications || [] },
            auth: auth
          })
        );
        const token = localStorage.getItem("grandLuxuryAuthToken");
        if (token) {
          getProfile()
            .then((result) => dispatch(setAuth({ user: result.user, token })))
            .catch(() => {
              localStorage.removeItem("grandLuxuryAuthToken");
              dispatch(setAuth({ user: null, token: "" }));
            });
        }
      })
      .catch(() => {
        toast.error("Network error while loading hotel data");
      });
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("grandLuxuryCart", JSON.stringify(cart));
    localStorage.setItem("grandLuxuryBooking", JSON.stringify(booking));
    localStorage.setItem("grandLuxuryOrders", JSON.stringify(orders));
    localStorage.setItem("grandLuxuryPayments", JSON.stringify(payments));
    localStorage.setItem("grandLuxuryReservations", JSON.stringify(reservations));
    localStorage.setItem("grandLuxuryAuth", JSON.stringify(auth));
    localStorage.setItem("grandLuxuryWishlist", JSON.stringify(wishlist));
    localStorage.setItem("grandLuxuryReviews", JSON.stringify(reviews));
    localStorage.setItem("grandLuxuryNotifications", JSON.stringify(notifications));
    if (auth.token) localStorage.setItem("grandLuxuryAuthToken", auth.token);
    else localStorage.removeItem("grandLuxuryAuthToken");
  }, [auth, booking, cart, notifications, orders, payments, reservations, reviews, wishlist]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Toaster richColors position="top-right" expand />
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
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/booking/:id" element={<BookingConfirmationPage />} />
          <Route path="/order/:id" element={<OrderConfirmationPage />} />
          <Route path="/dashboard" element={<RequireAuth><CustomerDashboard /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <BookingModal />
      <ReservationModal />
      <AuthModal />
      <Chatbot />
      <MobileBottomNav />
      <Footer />
    </div>
  );
}

function RequireAuth({ children }) {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/auth" replace />;
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
  const dispatch = useDispatch();
  const count = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.qty, 0));
  const unread = useSelector((state) => state.notifications.items.filter((item) => !item.read).length);
  const user = useSelector((state) => state.auth.user);
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
          <button onClick={() => dispatch(openBookingModal())} className="rounded-md border border-gold/70 bg-gold px-4 py-2 text-sm font-bold text-midnight">Book Now</button>
          <button onClick={() => dispatch(openReservationModal())} className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold hover:border-gold/60">Reserve Table</button>
          <button onClick={() => dispatch(openAuthModal(user ? "login" : "login"))} className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold hover:border-gold/60">{user ? user.fullName : "Login"}</button>
          <Link to="/dashboard" className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold hover:border-gold/60">Alerts {unread ? `(${unread})` : ""}</Link>
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
              <button onClick={() => dispatch(openBookingModal())} className="rounded-md bg-gold px-3 py-2 text-center text-sm font-bold text-midnight">Book Now</button>
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
      <HotelVideoExperience />
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
  const roomForm = useForm({ defaultValues: { checkIn: "", checkOut: "", adults: "2", children: "0", room: "Luxury Suite" } });
  const tableForm = useForm({ defaultValues: { date: "", time: "20:00", guests: "2", occasion: "Dinner" } });
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass rounded-lg p-5 shadow-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Instant concierge</p>
          <h2 className="font-display text-3xl font-semibold">Plan Your Visit</h2>
          <p className="mt-1 text-xs text-pearl/55">{currencyLabel} pricing across hotel and restaurant.</p>
        </div>
        <CalendarCheck className="h-8 w-8 text-gold" />
      </div>
      <form className="grid gap-3" onSubmit={roomForm.handleSubmit((data) => dispatch(setRoomSearch(data)))}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="luxury-input" type="date" placeholder="Check-in date" {...roomForm.register("checkIn")} />
          <input className="luxury-input" type="date" placeholder="Check-out date" {...roomForm.register("checkOut")} />
          <select className="luxury-input" {...roomForm.register("adults")}><option>1 adult</option><option>2 adults</option><option>3 adults</option><option>4 adults</option><option>6 adults</option></select>
          <select className="luxury-input" {...roomForm.register("children")}><option>0 children</option><option>1 child</option><option>2 children</option><option>3 children</option></select>
          <select className="luxury-input" {...roomForm.register("room")}>{rooms.map((room) => <option key={room.id}>{room.name}</option>)}</select>
        </div>
        <button className="rounded-md bg-gold py-3 font-bold text-midnight">Search Rooms</button>
      </form>
      <div className="my-5 h-px bg-gold-line" />
      <form className="grid gap-3" onSubmit={tableForm.handleSubmit(() => dispatch(openReservationModal()))}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="luxury-input" type="date" placeholder="Reservation date" {...tableForm.register("date")} />
          <input className="luxury-input" type="time" placeholder="Reservation time" {...tableForm.register("time")} />
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

function HotelVideoExperience() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = isMuted;
    videoRef.current.volume = isMuted ? 0 : 0.85;
  }, [isMuted]);

  return (
    <section className="py-20">
      <div className="section-shell grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-gold">Cinematic hotel video</p>
          <h2 className="font-display text-5xl font-bold">Autoplay preview with sound you can enable anytime.</h2>
          <p className="mt-5 leading-8 text-pearl/68">The 3D model has been replaced with your local hotel video. It starts muted for autoplay support, and guests can unmute it with one tap.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[["Autoplay", "Muted on load"], ["Sound", "Toggle on demand"], ["Source", "video/video.mp4"]].map(([title, copy]) => <span key={title} className="rounded-md border border-gold/25 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold"><span className="block text-xs uppercase tracking-[0.18em] text-gold/70">{title}</span><span className="mt-1 block text-base text-pearl">{copy}</span></span>)}
          </div>
        </div>
        <div className="relative h-[420px] overflow-hidden rounded-lg border border-gold/25 bg-black shadow-glow">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted={isMuted} loop playsInline poster={gallery[0]}>
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/65 via-transparent to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Hotel preview</p>
              <p className="text-sm text-pearl/75">Autoplaying and muted by default.</p>
            </div>
            <button type="button" onClick={() => setIsMuted((value) => !value)} className="inline-flex items-center gap-2 rounded-md border border-gold/40 px-4 py-2 text-sm font-bold text-gold">
              {isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {isMuted ? "Enable Sound" : "Mute Video"}
            </button>
          </div>
        </div>
      </div>
    </section>
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
  const dispatch = useDispatch();
  return (
    <motion.article whileHover={{ y: -8 }} className="glass tilt-card overflow-hidden rounded-lg">
      <div className="relative h-64 overflow-hidden">
        <img src={room.image} alt={room.name} className="h-full w-full object-cover transition duration-700 hover:scale-110" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-midnight/82 px-3 py-1 text-xs font-bold text-gold"><span className="availability-dot mr-2" />Live Available</span>
          <span className="rounded-full bg-midnight/82 px-3 py-1 text-xs font-bold text-pearl">360 Tour</span>
        </div>
        <button onClick={() => dispatch(openBookingModal(room.id))} className="magnetic-button absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-xs font-bold text-midnight"><Video className="h-4 w-4" /> Preview</button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-3xl font-semibold">{room.name}</h3>
            <p className="mt-1 text-sm text-pearl/62">Available tonight - Sleeps {room.capacity}</p>
          </div>
          <span className="rounded-md bg-gold/15 px-2 py-1 text-sm font-bold text-gold">{formatINR(room.price)}/Night</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{room.amenities.map((item) => <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-pearl/70">{item}</span>)}</div>
        <div className="mt-5 rounded-lg border border-gold/20 bg-gold/10 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-pearl/58">Peak season</span>
            <span className="line-through text-pearl/45">{formatINR(room.price * 1.25)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-bold text-gold">20% OFF</span>
            <span className="text-xs text-pearl/58">Offer Ends In 02:14:35</span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-gold"><Star className="h-4 w-4 fill-gold" /> {room.rating}</span>
          <div className="flex gap-2">
            <button onClick={() => dispatch(setActiveDialog({ type: "room-compare", roomId: room.id }))} className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-pearl/70">Compare</button>
            <button onClick={() => dispatch(openBookingModal(room.id))} className="magnetic-button rounded-md border border-gold/55 px-4 py-2 text-sm font-bold text-gold">Book</button>
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
  const reservations = useSelector((state) => state.reservations.reservations);
  const statusStyles = {
    available: "bg-emerald-500",
    booked: "bg-red-500",
    reserved: "bg-yellow-400"
  };
  const liveTables = restaurantTables.map(([table, fallbackStatus]) => {
    const reservation = reservations.find((item) => item.table === table && item.status !== "Cancelled" && item.status !== "Completed");
    return [table, reservation ? "reserved" : fallbackStatus === "booked" ? "booked" : "available"];
  });
  return (
    <div className="rounded-lg border border-midnight/10 bg-white p-4 shadow-lg">
      <h3 className="font-display text-2xl font-semibold">Live Table Selection</h3>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {liveTables.map(([table, status]) => (
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
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const saved = wishlistItems.some((entry) => entry.itemId === item.id);
  const details = nutritionDetails[item.name] || ["Chef curated", "Ask for allergens", "Premium seasonal ingredients"];
  const toggleSave = async () => {
    try {
      const result = await apiToggleWishlist({ type: "food", itemId: item.id, item });
      const nextItems = result.saved ? [...wishlistItems.filter((entry) => entry.itemId !== item.id), result.item] : wishlistItems.filter((entry) => entry.itemId !== item.id);
      dispatch(setWishlist({ items: nextItems }));
      toast.success(result.message || (result.saved ? "Added to wishlist" : "Removed from wishlist"));
    } catch (error) {
      toast.error(error.message || "Unable to update wishlist");
    }
  };
  return (
    <motion.article whileHover={{ y: -6, rotateY: light ? 0 : -3 }} className={`tilt-card overflow-hidden rounded-lg ${light ? "bg-white shadow-xl" : "glass"}`}>
      <div className="relative h-44 overflow-hidden">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-700 hover:scale-110" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-midnight/80 px-3 py-1 text-xs font-bold text-gold"><PlayCircle className="h-3 w-3" /> Food Video</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-display text-2xl font-semibold ${light ? "text-midnight" : ""}`}>{item.name}</h3>
          <button aria-label="Favorite item" onClick={toggleSave} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${saved ? "border-gold bg-gold text-midnight" : "border-gold/30 text-gold"}`}><Heart className={`h-4 w-4 ${saved ? "fill-midnight" : ""}`} /></button>
        </div>
        <p className={`mt-1 text-sm ${light ? "text-midnight/60" : "text-pearl/60"}`}>{item.category} • {item.tags.join(" • ")}</p>
        <div className={`mt-3 grid gap-1 text-xs ${light ? "text-midnight/58" : "text-pearl/58"}`}>
          {details.map((detail) => <span key={detail}>{detail}</span>)}
          <span>Chef note: plated fresh with premium garnish.</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-gold">{formatINR(item.price)}</span>
          <button onClick={() => {
            dispatch(addToCart(item));
            toast.success("Added To Cart");
          }} className="rounded-md bg-gold px-3 py-2 text-sm font-bold text-midnight">Add</button>
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
    [CircleDollarSign, "Currency", "All billing uses ₹ INR across rooms and dining"],
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
  const [budget, setBudget] = useState(50000);
  const [capacity, setCapacity] = useState(2);
  const filteredRooms = rooms.filter((room) => room.price <= budget && room.capacity >= capacity);
  return (
    <PageShell eyebrow="Rooms & suites" title="Real-time room booking workflow">
      <BookingWorkflow />
      <SmartRoomFinder budget={budget} capacity={capacity} onBudget={setBudget} onCapacity={setCapacity} />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredRooms.map((room) => <RoomCard key={room.id} room={room} />)}</div>
    </PageShell>
  );
}

function BookingWorkflow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookings = useSelector((state) => state.booking.bookings);
  const [booking, setBooking] = useState(null);
  const [bookingNotice, setBookingNotice] = useState("");
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      checkIn: "",
      checkOut: "",
      adults: "2",
      children: "0",
      roomId: "deluxe",
      fullName: "",
      mobile: "",
      email: "",
      address: "",
      requests: "",
      paymentMethod: "UPI"
    }
  });
  const values = watch();
  const selectedRoom = rooms.find((room) => room.id === values.roomId) || rooms[0];
  const nights = nightsBetween(values.checkIn, values.checkOut);
  const availableNumbers = getAvailableRoomNumbers(bookings, selectedRoom.id, values.checkIn, values.checkOut);
  const roomAvailable = Boolean(values.checkIn && values.checkOut && availableNumbers.length);
  const taxes = Math.round(selectedRoom.price * nights * 0.18);
  const discount = Math.round(selectedRoom.price * nights * 0.1);
  const total = selectedRoom.price * nights + taxes - discount;
  const similarRooms = rooms.filter((room) => room.id !== selectedRoom.id && room.capacity >= parseCount(values.adults) + parseCount(values.children)).slice(0, 3);

  const submitBooking = (data) => {
    apiCreateBooking(data)
      .then((result) => {
        const created = result.booking;
        dispatch(createBooking(created));
        if (result.payment) dispatch(createPayment(result.payment));
        setBooking(created);
        setBookingNotice(result.message || "Room Booked Successfully");
        toast.success(result.message || "Room Booked Successfully");
        navigate(`/booking/${created.id}`);
        reset({ ...data, fullName: "", mobile: "", email: "", address: "", requests: "" });
      })
      .catch((error) => {
        setBooking({ blocked: true, roomType: rooms.find((item) => item.id === data.roomId)?.name || "Selected room" });
        setBookingNotice("");
        toast.error(error.message || "Room Not Available");
      });
  };

  return (
    <section className="mb-10 glass rounded-lg p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Complete booking process</p>
          <h2 className="font-display text-4xl font-semibold">Book a room in {currencyLabel}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {bookingStatuses.map((status) => <span key={status} className="rounded-full border border-white/10 px-3 py-1 text-xs text-pearl/68">{status}</span>)}
        </div>
      </div>
      <form onSubmit={handleSubmit(submitBooking)} className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <WorkflowField step="1" label="Select Check-In Date"><input className="luxury-input" type="date" placeholder="Check-in date" {...register("checkIn", { required: true })} /></WorkflowField>
            <WorkflowField step="2" label="Select Check-Out Date"><input className="luxury-input" type="date" placeholder="Check-out date" {...register("checkOut", { required: true })} /></WorkflowField>
            <WorkflowField step="3" label="Adults"><input className="luxury-input" type="number" min="1" placeholder="Adults" {...register("adults", { required: true })} /></WorkflowField>
            <WorkflowField step="3" label="Children"><input className="luxury-input" type="number" min="0" placeholder="Children" {...register("children")} /></WorkflowField>
          </div>
          <WorkflowField step="4" label="Choose Room Type">
            <select className="luxury-input" {...register("roomId")}>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name} - {formatINR(room.price)}/Night</option>)}</select>
          </WorkflowField>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="mb-3 text-sm font-bold text-gold">Step 5: View Available Rooms</p>
            {roomAvailable ? (
              <div className="flex flex-wrap gap-2">{availableNumbers.map((roomNumber) => <span key={roomNumber} className="rounded-md bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">Room {roomNumber} Available</span>)}</div>
            ) : (
              <div className="grid gap-3">
                <p className="rounded-md bg-wine/20 px-3 py-2 text-sm font-bold text-wine">Room Not Available</p>
                <p className="text-sm text-pearl/62">Try similar rooms or select alternative dates.</p>
                <div className="flex flex-wrap gap-2">{similarRooms.map((room) => <span key={room.id} className="rounded-md border border-gold/25 px-3 py-1 text-xs text-gold">{room.name}</span>)}</div>
              </div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <WorkflowField step="6" label="Full Name"><input className="luxury-input" placeholder="Full name" {...register("fullName", { required: true })} /></WorkflowField>
            <WorkflowField step="6" label="Mobile Number"><input className="luxury-input" placeholder="Mobile number" {...register("mobile", { required: true })} /></WorkflowField>
            <WorkflowField step="6" label="Email"><input className="luxury-input" type="email" placeholder="Email address" {...register("email", { required: true })} /></WorkflowField>
            <WorkflowField step="6" label="Address"><input className="luxury-input" placeholder="Address" {...register("address", { required: true })} /></WorkflowField>
          </div>
          <WorkflowField step="6" label="Special Requests"><textarea className="luxury-input min-h-24" placeholder="Special requests or notes" {...register("requests")} /></WorkflowField>
        </div>
        <div className="grid gap-5">
          <div className="rounded-lg border border-gold/20 bg-gold/10 p-5">
            <p className="text-sm font-bold text-gold">Step 7: Booking Summary</p>
            <SummaryRow label="Room Type" value={selectedRoom.name} />
            <SummaryRow label="Number of Nights" value={String(nights)} />
            <SummaryRow label="Price Per Night" value={formatINR(selectedRoom.price)} />
            <SummaryRow label="Taxes (GST)" value={formatINR(taxes)} />
            <SummaryRow label="Discounts" value={`-${formatINR(discount)}`} />
            <SummaryRow label="Total Amount" value={formatINR(total)} strong />
          </div>
          <WorkflowField step="8" label="Payment">
            <select className="luxury-input" {...register("paymentMethod")}>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select>
          </WorkflowField>
          <button disabled={!roomAvailable} className="rounded-md bg-gold px-5 py-3 font-bold text-midnight disabled:cursor-not-allowed disabled:opacity-50">Confirm Booking</button>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="mb-3 text-sm font-bold text-gold">Steps 9-10: Confirmation & Status</p>
            {booking && !booking.blocked && <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">{bookingNotice || "Room Booked Successfully"}</p>}
            {booking?.blocked && <p className="text-sm text-wine">Room Not Available. Duplicate booking prevented.</p>}
            {booking && !booking.blocked && (
              <div className="grid gap-2 text-sm text-pearl/70">
                <p>Booking ID: <span className="text-gold">{booking.id}</span></p>
                <p>Invoice Number: <span className="text-gold">{booking.invoice}</span></p>
                <p>QR Code: <span className="text-gold">{booking.qr}</span></p>
                <p>Confirmation Email: sent to {booking.customer.email}</p>
                <p>Status: <span className="text-gold">{booking.status}</span></p>
              </div>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}

function WorkflowField({ step, label, children }) {
  return (
    <label className="grid gap-2 text-sm text-pearl/72">
      <span><span className="font-bold text-gold">Step {step}:</span> {label}</span>
      {children}
    </label>
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
            <label className="text-sm text-pearl/72">Budget up to {formatINR(budget)}<input type="range" min="8500" max="50000" step="500" value={budget} onChange={(event) => onBudget(Number(event.target.value))} className="mt-2 w-full accent-gold" /></label>
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
  const dispatch = useDispatch();
  const reservations = useSelector((state) => state.reservations.reservations);
  const { register, handleSubmit, reset } = useForm();
  const [sent, setSent] = useState(null);
  const nextTable = restaurantTables.find(([table]) => !reservations.some((reservation) => reservation.table === table && reservation.status !== "Cancelled"))?.[0] || "Waitlist";
  return (
    <section className="py-12">
      <form onSubmit={handleSubmit((data) => {
        apiCreateReservation({ name: data.name, phone: data.phone, date: data.date, time: data.time, guests: data.guests, occasion: data.occasion })
          .then((result) => {
            dispatch(createReservation(result.reservation));
            setSent(result.reservation);
            toast.success(result.message || "Table Reserved Successfully");
            reset();
          })
          .catch((error) => toast.error(error.message || "Reservation Already Exists"));
      })} className="glass mx-auto grid max-w-3xl gap-4 rounded-lg p-6">
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
        {sent && <p className="text-sm text-gold">Reservation {sent.id} captured for table {sent.table}.</p>}
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
  const navigate = useNavigate();
  const { items, coupon } = useSelector((state) => state.cart);
  const orders = useSelector((state) => state.orders.orders);
  const [placedOrder, setPlacedOrder] = useState(null);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { deliveryType: "Room Delivery", name: "", roomNumber: "", mobile: "", paymentMethod: "UPI" } });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = coupon === "GRAND20" ? subtotal * 0.2 : 0;
  const delivery = items.length ? 49 : 0;
  const taxes = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + delivery + taxes;
  const trackedStatus = placedOrder?.status || orders[0]?.status || "Order Received";
  const placeOrder = (data) => {
    if (!items.length) return;
    apiCreateOrder({
      items: items.map((item) => ({ name: item.name, qty: item.qty, price: item.price })),
      deliveryType: data.deliveryType,
      name: data.name,
      roomNumber: data.roomNumber,
      mobile: data.mobile,
      paymentMethod: data.paymentMethod,
      couponCode: coupon
    })
      .then((result) => {
        const order = result.order;
        dispatch(createOrder(order));
        if (result.payment) dispatch(createPayment(result.payment));
        dispatch(clearCart());
        setPlacedOrder(order);
        toast.success(result.message || `Order #${order.id}`);
        navigate(`/order/${order.id}`);
        reset();
      })
      .catch((error) => toast.error(error.message || "Order could not be placed"));
  };
  return (
    <PageShell eyebrow="Online food ordering" title="Cart, checkout, summary, coupons, tracking">
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-lg p-5">
          <WandSparkles className="mb-4 h-8 w-8 text-gold" />
          <h3 className="font-display text-2xl">AI Food Recommendation</h3>
          <p className="mt-2 text-sm text-pearl/62">Paneer Tikka pairs best with Veg Biryani and Sparkling Rose Mocktail.</p>
        </div>
        <div className="glass rounded-lg p-5">
          <RefreshCw className="mb-4 h-8 w-8 text-gold" />
          <h3 className="font-display text-2xl">Frequently Ordered</h3>
          <p className="mt-2 text-sm text-pearl/62">Paneer Tikka, Veg Biryani, Hakka Noodles, Sunrise Wellness Bowl.</p>
        </div>
        <div className="glass rounded-lg p-5">
          <ShoppingBag className="mb-4 h-8 w-8 text-gold" />
          <h3 className="font-display text-2xl">Combo Suggestions</h3>
          <p className="mt-2 text-sm text-pearl/62">Chef Table Combo: Paneer Tikka + Veg Biryani + Chocolate Torte, 15% off demo.</p>
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
                <p className="text-sm text-pearl/60">{formatINR(item.price)} - {item.category}</p>
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
        <form onSubmit={handleSubmit(placeOrder)} className="glass h-fit rounded-lg p-6">
          <h2 className="font-display text-3xl font-semibold">Order Summary</h2>
          <input className="luxury-input mt-4" placeholder="Coupon GRAND20" onChange={(event) => dispatch(applyCoupon(event.target.value))} />
          <div className="mt-5 grid gap-3">
            <select className="luxury-input" {...register("deliveryType")}>{deliveryTypes.map((type) => <option key={type}>{type}</option>)}</select>
            <input className="luxury-input" placeholder="Name" {...register("name", { required: true })} />
            <input className="luxury-input" placeholder="Room Number (Optional)" {...register("roomNumber")} />
            <input className="luxury-input" placeholder="Mobile Number" {...register("mobile", { required: true })} />
            <select className="luxury-input" {...register("paymentMethod")}>{foodPaymentMethods.map((method) => <option key={method}>{method}</option>)}</select>
          </div>
          <SummaryRow label="Subtotal" value={formatINR(subtotal)} />
          <SummaryRow label="Discount" value={`-${formatINR(discount)}`} />
          <SummaryRow label="Delivery" value={formatINR(delivery)} />
          <SummaryRow label="GST" value={formatINR(taxes)} />
          <SummaryRow label="Total" value={formatINR(total)} strong />
          <button disabled={!items.length} className="mt-5 w-full rounded-md bg-gold py-3 font-bold text-midnight disabled:opacity-50">Place Order</button>
          <div className="mt-6 rounded-lg border border-white/10 p-4">
            <p className="mb-3 text-sm font-bold text-gold">Order Tracking</p>
            {foodStatuses.map((step, index) => <p key={step} className={`border-l py-2 pl-4 text-sm ${index <= foodStatuses.indexOf(trackedStatus) ? "border-gold text-gold" : "border-white/10 text-pearl/45"}`}>{index + 1}. {step}</p>)}
            {placedOrder && (
              <div className="mt-4 grid gap-1 rounded-md border border-gold/25 bg-gold/10 p-3 text-sm text-pearl/72">
                <p>Order ID: <span className="text-gold">{placedOrder.id}</span></p>
                <p>Invoice: <span className="text-gold">{placedOrder.invoice}</span></p>
                <p>Payment: {placedOrder.paymentMethod} - {placedOrder.paymentStatus}</p>
              </div>
            )}
            <div className="mt-4 space-y-2">
              <div className="skeleton-line h-3 rounded-full" />
              <div className="skeleton-line h-3 w-2/3 rounded-full" />
            </div>
          </div>
        </form>
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
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{items.map((item, index) => <div key={item} className="glass rounded-lg p-6"><Sparkles className="mb-5 h-8 w-8 text-gold" /><h3 className="font-display text-2xl">{item}</h3><p className="mt-3 text-sm text-pearl/60">From {formatINR(15000 + index * 7500)}. Includes dedicated coordinator and premium setup.</p></div>)}</div>;
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
  const dispatch = useDispatch();
  const notificationItems = useSelector((state) => state.notifications.items);
  const { register, handleSubmit, reset } = useForm();
  return (
    <PageShell eyebrow="Contact" title="Concierge, reservations, directions, and FAQs">
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="glass rounded-lg p-6">
          <InfoLine icon={<MapPin />} text="Central Avenue, Luxury District" />
          <InfoLine icon={<Phone />} text="9691368925" />
          <InfoLine icon={<Mail />} text="india@ideaclap@gmail.com" />
          <InfoLine icon={<Clock />} text="Restaurant 7:00 AM - 11:30 PM" />
        </div>
        <form
          className="glass grid gap-4 rounded-lg p-6"
          onSubmit={handleSubmit((data) => {
            apiCreateNotification({ type: "contact", title: `Contact message from ${data.name}`, message: `${data.email}: ${data.message}` })
              .then(() => {
                toast.success("Message Sent Successfully");
                dispatch(setNotifications({ items: [{ id: generateId("NTF"), type: "contact", title: `Contact message from ${data.name}`, message: data.message, read: false, createdAt: new Date().toISOString() }, ...notificationItems] }));
                reset();
              })
              .catch((error) => toast.error(error.message || "Network Error"));
          })}
        >
          <input className="luxury-input" placeholder="Name" {...register("name", { required: true })} />
          <input className="luxury-input" placeholder="Email" type="email" {...register("email", { required: true })} />
          <textarea className="luxury-input min-h-32" placeholder="Message" {...register("message", { required: true })} />
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
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.booking.bookings);
  const orders = useSelector((state) => state.orders.orders);
  const payments = useSelector((state) => state.payments.payments);
  const reservations = useSelector((state) => state.reservations.reservations);
  const activeBooking = bookings[0];
  const activeOrder = orders[0];
  const rewardPoints = [...bookings, ...orders].reduce((sum, item) => sum + (item.rewardPoints || 0), 0);
  return (
    <PageShell eyebrow="Customer dashboard" title="Bookings, orders, reservations, profile, reviews">
      <StatsGrid stats={[["Loyalty Points", rewardPoints.toLocaleString("en-IN")], ["Active Booking", activeBooking?.roomType || "No booking"], ["Food Order", activeOrder?.status || "No order"], ["Notifications", `${bookings.length + orders.length} records`]]} />
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
        <div className="glass rounded-lg p-5">
          <h3 className="font-display text-2xl font-semibold">Hotel Bookings</h3>
          <div className="mt-4 grid gap-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-md border border-white/10 p-3 text-sm text-pearl/70">
                <p className="font-bold text-gold">{booking.roomType} - {booking.status}</p>
                <p>{booking.checkIn} to {booking.checkOut} | {formatINR(booking.total)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => {
                    dispatch(cancelBooking(booking.id));
                    const payment = payments.find((item) => item.sourceId === booking.id);
                    if (payment) dispatch(updatePaymentStatus({ id: payment.id, status: "Refund Pending", refundStatus: "Requested" }));
                  }} className="rounded-md border border-wine/40 px-3 py-1 text-wine">Cancel Booking</button>
                  <button onClick={() => downloadInvoice(booking, "Booking")} className="rounded-md border border-gold/40 px-3 py-1 text-gold">Download Invoice</button>
                </div>
                <p className="mt-2 text-xs text-pearl/45">Payment: {payments.find((item) => item.sourceId === booking.id)?.status || booking.paymentStatus} | Tracking: {booking.status}</p>
              </div>
            ))}
          </div>
        </div>
        <DashboardPanel title="Restaurant Reservations" items={reservations.map((reservation) => `${reservation.table} | ${reservation.date} ${reservation.time} | ${reservation.status}`)} />
        <div className="glass rounded-lg p-5">
          <h3 className="font-display text-2xl font-semibold">Food Orders</h3>
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-md border border-white/10 p-3 text-sm text-pearl/70">
                <p className="font-bold text-gold">{order.id} - {order.status}</p>
                <p>{order.items.length} items | {formatINR(order.total)} | {order.paymentStatus}</p>
                <button onClick={() => downloadInvoice(order, "Order")} className="mt-3 rounded-md border border-gold/40 px-3 py-1 text-gold">Download Invoice</button>
              </div>
            ))}
          </div>
        </div>
        <DashboardPanel title="Profile Management" items={["Personal information", "Security settings", "Address management", "Profile picture upload"]} />
        <DashboardPanel title="Reviews & Ratings" items={["Room reviews", "Food reviews", "Restaurant reviews"]} />
        <DashboardPanel title="Notifications" items={[...bookings, ...orders].map((item) => item.notification || "In-app notification sent")} />
      </div>
    </PageShell>
  );
}

function AdminDashboard() {
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.booking.bookings);
  const orders = useSelector((state) => state.orders.orders);
  const payments = useSelector((state) => state.payments.payments);
  const reservations = useSelector((state) => state.reservations.reservations);
  const revenue = payments.filter((payment) => payment.status === "Paid").reduce((sum, item) => sum + (item.amount || 0), 0);
  const pieData = [{ name: "Rooms", value: 45 }, { name: "Dining", value: 30 }, { name: "Events", value: 15 }, { name: "Spa", value: 10 }];
  return (
    <PageShell eyebrow="Admin dashboard" title="Revenue, operations, CMS, staff, payments">
      <StatsGrid stats={[["Total Revenue", formatINR(revenue)], ["Hotel Bookings", String(bookings.length)], ["Food Orders", String(orders.length)], ["Occupancy Rate", "91%"]]} />
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
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-lg p-5">
          <h3 className="font-display text-2xl font-semibold">Manage Bookings & Payments</h3>
          <div className="mt-4 grid gap-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-md border border-white/10 p-3 text-sm text-pearl/70">
                <p className="font-bold text-gold">{booking.id} | {booking.roomType} | {formatINR(booking.total)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {bookingStatuses.map((status) => <button key={status} onClick={() => dispatch(updateBookingStatus({ id: booking.id, status }))} className="rounded-md border border-white/10 px-2 py-1 text-xs">{status}</button>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <h3 className="font-display text-2xl font-semibold">Kitchen Dashboard</h3>
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-md border border-white/10 p-3 text-sm text-pearl/70">
                <p className="font-bold text-gold">{order.id} | {order.status} | {formatINR(order.total)}</p>
                <p>{order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {foodStatuses.map((status) => <button key={status} onClick={() => dispatch(updateOrderStatus({ id: order.id, status }))} className="rounded-md border border-white/10 px-2 py-1 text-xs">{status}</button>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-lg p-5">
          <h3 className="font-display text-2xl font-semibold">Manage Payments & Refunds</h3>
          <div className="mt-4 grid gap-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-md border border-white/10 p-3 text-sm text-pearl/70">
                <p className="font-bold text-gold">{payment.id} | {payment.type} | {formatINR(payment.amount)}</p>
                <p>{payment.method} | {payment.status} | Refund: {payment.refundStatus}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Paid", "Pending", "Failed", "Refund Pending"].map((status) => <button key={status} onClick={() => dispatch(updatePaymentStatus({ id: payment.id, status }))} className="rounded-md border border-white/10 px-2 py-1 text-xs">{status}</button>)}
                  <button onClick={() => dispatch(updatePaymentStatus({ id: payment.id, refundStatus: "Processed" }))} className="rounded-md border border-gold/40 px-2 py-1 text-xs text-gold">Mark Refunded</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <h3 className="font-display text-2xl font-semibold">Real-Time Reservations</h3>
          <div className="mt-4 grid gap-3">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="rounded-md border border-white/10 p-3 text-sm text-pearl/70">
                <p className="font-bold text-gold">{reservation.id} | {reservation.table} | {reservation.status}</p>
                <p>{reservation.date} {reservation.time} | {reservation.guests} | {reservation.customer.name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Pending", "Reserved", "Seated", "Completed", "Cancelled"].map((status) => <button key={status} onClick={() => dispatch(updateReservationStatus({ id: reservation.id, status }))} className="rounded-md border border-white/10 px-2 py-1 text-xs">{status}</button>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["Manage Bookings", "Manage Payments", "Manage Food Orders", "Manage Refunds", "Manage Coupons", "Revenue Reports", "Rooms", "Reservations"].map((title) => <DashboardPanel key={title} title={title} items={["Rooms", "Bookings", "Orders", "Payments", "Reservations"]} />)}
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

function ModalShell({ open, title, onClose, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        className={`glass relative w-full overflow-hidden rounded-2xl ${wide ? "max-w-4xl" : "max-w-2xl"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gold">Grand Luxury</p>
            <h3 className="font-display text-3xl font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-gold"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[80vh] overflow-auto p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function BookingModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const open = useSelector((state) => state.ui.bookingModalOpen);
  const roomId = useSelector((state) => (typeof state.ui.activeDialog === "string" ? state.ui.activeDialog : "suite"));
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { checkIn: "", checkOut: "", adults: "2", children: "0", roomId: roomId || "suite", fullName: "", mobile: "", email: "", address: "", requests: "", paymentMethod: "UPI" }
  });
  const currentRoomId = watch("roomId") || roomId || "suite";
  const selectedRoom = rooms.find((room) => room.id === currentRoomId) || rooms[0];
  const nights = nightsBetween(watch("checkIn"), watch("checkOut"));
  const totals = useMemo(() => {
    const price = selectedRoom.price * nights;
    const taxes = Math.round(price * 0.18);
    const discount = Math.round(price * 0.1);
    return { taxes, discount, total: price + taxes - discount };
  }, [nights, selectedRoom.price]);

  useEffect(() => {
    reset((current) => ({ ...current, roomId: roomId || current.roomId || "suite" }));
  }, [roomId, reset]);

  const submit = (data) => {
    apiCreateBooking(data)
      .then((result) => {
        dispatch(createBooking(result.booking));
        if (result.payment) dispatch(createPayment(result.payment));
        toast.success(result.message || "Room Booked Successfully");
        dispatch(closeBookingModal());
        navigate(`/booking/${result.booking.id}`);
        reset();
      })
      .catch((error) => toast.error(error.message || "Room Not Available"));
  };

  return (
    <ModalShell open={open} title="Book a Room" onClose={() => dispatch(closeBookingModal())} wide>
      <form onSubmit={handleSubmit(submit)} className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-pearl/70"><span>Check In</span><input className="luxury-input" type="date" {...register("checkIn", { required: true })} /></label>
          <label className="grid gap-2 text-sm text-pearl/70"><span>Check Out</span><input className="luxury-input" type="date" {...register("checkOut", { required: true })} /></label>
          <label className="grid gap-2 text-sm text-pearl/70"><span>Adults</span><input className="luxury-input" type="number" min="1" {...register("adults", { required: true })} /></label>
          <label className="grid gap-2 text-sm text-pearl/70"><span>Children</span><input className="luxury-input" type="number" min="0" {...register("children")} /></label>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-pearl/70"><span>Room Type</span><select className="luxury-input" {...register("roomId")}>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
          <label className="grid gap-2 text-sm text-pearl/70"><span>Full Name</span><input className="luxury-input" {...register("fullName", { required: true })} /></label>
          <label className="grid gap-2 text-sm text-pearl/70"><span>Mobile</span><input className="luxury-input" {...register("mobile", { required: true })} /></label>
          <label className="grid gap-2 text-sm text-pearl/70"><span>Email</span><input className="luxury-input" type="email" {...register("email", { required: true })} /></label>
          <label className="grid gap-2 text-sm text-pearl/70"><span>Address</span><input className="luxury-input" {...register("address", { required: true })} /></label>
          <label className="grid gap-2 text-sm text-pearl/70"><span>Special Requests</span><textarea className="luxury-input min-h-24" {...register("requests")} /></label>
          <label className="grid gap-2 text-sm text-pearl/70"><span>Payment</span><select className="luxury-input" {...register("paymentMethod")}>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select></label>
          <div className="rounded-lg border border-gold/20 bg-gold/10 p-4 text-sm text-pearl/75">
            <p className="font-bold text-gold">Booking Summary</p>
            <SummaryRow label="Room" value={selectedRoom.name} />
            <SummaryRow label="Nights" value={String(nights)} />
            <SummaryRow label="GST" value={formatINR(totals.taxes)} />
            <SummaryRow label="Discount" value={`-${formatINR(totals.discount)}`} />
            <SummaryRow label="Total" value={formatINR(totals.total)} strong />
          </div>
          <button className="rounded-md bg-gold py-3 font-bold text-midnight">Confirm Booking</button>
        </div>
      </form>
    </ModalShell>
  );
}

function ReservationModal() {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.ui.reservationModalOpen);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: "", phone: "", date: "", time: "20:00", guests: "2 guests", occasion: "Dinner" } });

  const submit = (data) => {
    apiCreateReservation(data)
      .then((result) => {
        dispatch(createReservation(result.reservation));
        toast.success(result.message || "Table Reserved Successfully");
        dispatch(closeReservationModal());
        reset();
      })
      .catch((error) => toast.error(error.message || "Reservation Already Exists"));
  };

  return (
    <ModalShell open={open} title="Reserve a Table" onClose={() => dispatch(closeReservationModal())}>
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
        <input className="luxury-input" placeholder="Name" {...register("name", { required: true })} />
        <input className="luxury-input" placeholder="Phone" {...register("phone", { required: true })} />
        <input className="luxury-input" type="date" {...register("date", { required: true })} />
        <input className="luxury-input" type="time" {...register("time", { required: true })} />
        <select className="luxury-input" {...register("guests")}><option>2 guests</option><option>4 guests</option><option>6 guests</option><option>8 guests</option></select>
        <select className="luxury-input" {...register("occasion")}><option>Dinner</option><option>Anniversary</option><option>Corporate</option><option>Birthday</option></select>
        <button className="md:col-span-2 rounded-md bg-gold py-3 font-bold text-midnight">Confirm Reservation</button>
      </form>
    </ModalShell>
  );
}

function AuthPanel({ compact = false, onSuccess }) {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: { fullName: "", email: "", password: "", mobile: "", resetToken: auth.forgotToken || "", rememberMe: true } });

  const submit = (data) => {
    const action =
      mode === "login"
        ? apiLogin(data)
        : mode === "register"
          ? apiRegister(data)
          : mode === "forgot"
            ? apiForgotPassword({ email: data.email })
            : apiResetPassword({ email: data.email, resetToken: data.resetToken, password: data.password });

    action
      .then((result) => {
        if (result.token) {
          dispatch(setAuth({ user: result.user, token: result.token }));
          localStorage.setItem("grandLuxuryAuthToken", result.token);
          toast.success(result.message || "Signed in");
          onSuccess?.();
          reset();
          return;
        }
        if (mode === "forgot") {
          reset({ email: data.email, resetToken: result.resetToken, password: "", fullName: "", mobile: "", rememberMe: true });
          setMode("reset");
          toast.success("Password reset token generated");
          return;
        }
        toast.success(result.message || "Password updated");
        setMode("login");
      })
      .catch((error) => toast.error(error.message || "Authentication failed"));
  };

  return (
    <form onSubmit={handleSubmit(submit)} className={`grid gap-4 ${compact ? "" : "max-w-3xl"}`}>
      <div className="flex flex-wrap gap-2">
        {[["login", "Login"], ["register", "Register"], ["forgot", "Forgot Password"], ["reset", "Reset Password"]].map(([value, label]) => (
          <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === value ? "bg-gold text-midnight" : "border border-white/10 text-pearl/70"}`}>{label}</button>
        ))}
      </div>
      {mode === "register" && <input className="luxury-input" placeholder="Full Name" {...register("fullName", { required: true })} />}
      <input className="luxury-input" placeholder="Email" type="email" {...register("email", { required: true })} />
      {(mode === "login" || mode === "register" || mode === "reset") && <input className="luxury-input" placeholder="Password" type="password" {...register("password", { required: true })} />}
      {mode === "register" && <input className="luxury-input" placeholder="Mobile" {...register("mobile")} />}
      {mode === "reset" && <input className="luxury-input" placeholder="Reset Token" {...register("resetToken", { required: true })} />}
      {mode === "login" && (
        <label className="flex items-center gap-2 text-sm text-pearl/70"><input type="checkbox" {...register("rememberMe")} /> Remember Me</label>
      )}
      <button className="rounded-md bg-gold py-3 font-bold text-midnight">
        {mode === "login" ? "Login" : mode === "register" ? "Create Account" : mode === "forgot" ? "Send Reset Token" : "Reset Password"}
      </button>
      {compact && <p className="text-xs text-pearl/55">{mode === "forgot" ? "A reset token is generated by the backend and can be used immediately." : "JWT is stored securely in local storage for the current session."}</p>}
    </form>
  );
}

function AuthModal() {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.ui.authModalOpen);
  return (
    <ModalShell open={open} title="Account Access" onClose={() => dispatch(closeAuthModal())}>
      <AuthPanel compact onSuccess={() => dispatch(closeAuthModal())} />
    </ModalShell>
  );
}

function AuthPage() {
  const dispatch = useDispatch();
  return (
    <PageShell eyebrow="Login system" title="Register, login, forgot password, and reset">
      <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
        <div className="glass rounded-lg p-6">
          <h2 className="font-display text-4xl font-bold gold-text">Secure guest access</h2>
          <p className="mt-4 leading-8 text-pearl/70">JWT-backed authentication protects your dashboard, booking history, orders, reservations, reviews, and admin workflows.</p>
          <div className="mt-6 grid gap-2 text-sm text-pearl/60">
            <p>Login</p>
            <p>Register</p>
            <p>Forgot Password</p>
            <p>Reset Password</p>
            <p>Remember Me</p>
          </div>
          <button onClick={() => dispatch(openBookingModal())} className="mt-6 rounded-md border border-gold/60 px-4 py-2 font-bold text-gold">Book a Room</button>
        </div>
        <div className="glass rounded-lg p-6">
          <AuthPanel />
        </div>
      </div>
    </PageShell>
  );
}

function BookingConfirmationPage() {
  const { id } = useParams();
  const booking = useSelector((state) => state.booking.bookings.find((item) => item.id === id));
  const navigate = useNavigate();
  if (!booking) return <Navigate to="/rooms" replace />;
  return (
    <PageShell eyebrow="Booking confirmation" title="Room Booked Successfully">
      <div className="glass mx-auto max-w-3xl rounded-2xl p-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-gold" />
        <h2 className="mt-4 font-display text-4xl font-bold">Room Booked Successfully</h2>
        <p className="mt-3 text-pearl/70">Booking ID: {booking.id}</p>
        <p className="text-pearl/70">Invoice Number: {booking.invoice}</p>
        <div className="mt-6 grid gap-2 text-left text-sm text-pearl/70">
          <p>Room: {booking.roomType} #{booking.roomNumber}</p>
          <p>Stay: {booking.checkIn} to {booking.checkOut}</p>
          <p>Total: {formatINR(booking.total)}</p>
          <p>Payment: {booking.paymentMethod} - {booking.paymentStatus}</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => downloadInvoice(booking, "Booking")} className="rounded-md border border-gold/50 px-4 py-2 font-bold text-gold">Download Invoice</button>
          <button onClick={() => navigate("/dashboard")} className="rounded-md bg-gold px-4 py-2 font-bold text-midnight">Open Dashboard</button>
        </div>
      </div>
    </PageShell>
  );
}

function OrderConfirmationPage() {
  const { id } = useParams();
  const order = useSelector((state) => state.orders.orders.find((item) => item.id === id));
  const navigate = useNavigate();
  if (!order) return <Navigate to="/food-order" replace />;
  return (
    <PageShell eyebrow="Order confirmation" title="Order Placed Successfully">
      <div className="glass mx-auto max-w-3xl rounded-2xl p-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-gold" />
        <h2 className="mt-4 font-display text-4xl font-bold">Order Placed Successfully</h2>
        <p className="mt-3 text-pearl/70">Order #{order.id}</p>
        <p className="text-pearl/70">Invoice: {order.invoice}</p>
        <div className="mt-6 grid gap-2 text-left text-sm text-pearl/70">
          <p>Items: {order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}</p>
          <p>Total: {formatINR(order.total)}</p>
          <p>Payment: {order.paymentMethod} - {order.paymentStatus}</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => downloadInvoice(order, "Order")} className="rounded-md border border-gold/50 px-4 py-2 font-bold text-gold">Download Invoice</button>
          <button onClick={() => navigate("/dashboard")} className="rounded-md bg-gold px-4 py-2 font-bold text-midnight">Open Dashboard</button>
        </div>
      </div>
    </PageShell>
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
      const fallback = "I couldn't confirm that right now. Please try again in a moment.";
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
  const dispatch = useDispatch();
  const notificationItems = useSelector((state) => state.notifications.items);
  const { register, handleSubmit, reset } = useForm();
  return (
    <footer className="border-t border-white/10 bg-ink py-12">
      <div className="section-shell grid gap-8 md:grid-cols-4">
        <div><h2 className="font-display text-3xl font-bold gold-text">Grand Luxury</h2><p className="mt-3 text-sm text-pearl/60">Hotel, restaurant, spa, events, food ordering, and management dashboards.</p></div>
        <div><h3 className="font-bold text-gold">Quick Links</h3><div className="mt-3 grid gap-2 text-sm text-pearl/65">{navItems.slice(0, 6).map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}</div></div>
        <div><h3 className="font-bold text-gold">Contact</h3><p className="mt-3 text-sm text-pearl/65">Central Avenue<br />9691368925<br />india@ideaclap@gmail.com</p></div>
        <form
          className="grid"
          onSubmit={handleSubmit((data) => {
            apiCreateNotification({ type: "newsletter", title: "Newsletter subscription", message: `Subscriber: ${data.email}` })
              .then(() => {
                toast.success("Profile Updated");
                dispatch(setNotifications({ items: [{ id: generateId("NTF"), type: "newsletter", title: "Newsletter subscription", message: data.email, read: false, createdAt: new Date().toISOString() }, ...notificationItems] }));
                reset();
              })
              .catch((error) => toast.error(error.message || "Network Error"));
          })}
        >
          <h3 className="font-bold text-gold">Newsletter</h3>
          <input className="luxury-input mt-3" placeholder="Email address" type="email" {...register("email", { required: true })} />
          <button className="mt-3 rounded-md border border-gold/60 px-4 py-2 text-sm font-bold text-gold">Subscribe</button>
        </form>
      </div>
    </footer>
  );
}

export default App;


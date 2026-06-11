import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { hotelData } from "./hotelData.js";

const dbFile = join(process.cwd(), "server", "data", "hotel-db.json");
const jwtSecret = process.env.JWT_SECRET || "grand-luxury-hotel-secret";

const roomNumbers = {
  deluxe: ["201", "202", "203"],
  executive: ["301", "302"],
  family: ["401", "402"],
  suite: ["501", "502"],
  presidential: ["701"]
};

const tableNumbers = ["T1", "T2", "T3", "T4", "T5", "T6"];

export function loadDatabase() {
  ensureDatabaseFile();
  return JSON.parse(readFileSync(dbFile, "utf8"));
}

export function saveDatabase(database) {
  ensureDatabaseFolder();
  writeFileSync(dbFile, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

export function createToken(payload) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const signature = createHmac("sha256", jwtSecret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const [header, body, signature] = String(token).split(".");
  if (!header || !body || !signature) return null;
  const expected = createHmac("sha256", jwtSecret).update(`${header}.${body}`).digest();
  const provided = Buffer.from(signature, "base64url");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.exp && payload.exp < Math.floor(Date.now() / 1000) ? null : payload;
  } catch {
    return null;
  }
}

export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(String(password), salt, 210000, 64, "sha512").toString("hex");
  return { salt, hash, passwordHash: `${salt}:${hash}` };
}

export function verifyPassword(password, passwordHash) {
  const [salt, hash] = String(passwordHash || "").split(":");
  if (!salt || !hash) return false;
  const testHash = pbkdf2Sync(String(password), salt, 210000, 64, "sha512").toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, resetToken, ...safe } = user;
  return safe;
}

export function getAvailableRoomNumbers(database, roomId, checkIn, checkOut) {
  const bookedNumbers = new Set(
    database.bookings
      .filter((booking) => booking.roomId === roomId && booking.status !== "Cancelled" && booking.status !== "Checked Out" && overlaps(checkIn, checkOut, booking.checkIn, booking.checkOut))
      .map((booking) => booking.roomNumber)
  );
  return (roomNumbers[roomId] || []).filter((roomNumber) => !bookedNumbers.has(roomNumber));
}

export function getAvailableTable(database, date, time) {
  const occupied = new Set(
    database.reservations
      .filter((reservation) => reservation.date === date && reservation.time === time && reservation.status !== "Cancelled" && reservation.status !== "Completed")
      .map((reservation) => reservation.table)
  );
  return tableNumbers.find((table) => !occupied.has(table)) || null;
}

export function calculateBookingTotals(roomPrice, nights) {
  const subtotal = roomPrice * nights;
  const taxes = Math.round(subtotal * 0.18);
  const discount = Math.round(subtotal * 0.1);
  const total = subtotal + taxes - discount;
  return { subtotal, taxes, discount, total };
}

export function calculateOrderTotals(items, couponCode) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = couponCode === "GRAND20" ? Math.round(subtotal * 0.2) : 0;
  const delivery = items.length ? 49 : 0;
  const taxes = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + delivery + taxes;
  return { subtotal, discount, delivery, taxes, total };
}

export function generateRecordId(prefix, database) {
  const datePart = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const counter = String((database.counters[prefix] || 0) + 1).padStart(3, "0");
  database.counters[prefix] = (database.counters[prefix] || 0) + 1;
  return `${prefix}-GL-${datePart}-${counter}`;
}

export function createInitialDatabase() {
  return {
    hotel: hotelData.hotel,
    rooms: hotelData.rooms,
    restaurant: hotelData.restaurant,
    reservationsCatalog: hotelData.reservations,
    events: hotelData.events,
    spa: hotelData.spa,
    offers: hotelData.offers,
    analytics: hotelData.analytics,
    users: [
      {
        id: "USR-GL-ADMIN-001",
        fullName: "Grand Luxury Admin",
        email: "admin@grandluxury.local",
        mobile: "9999999999",
        role: "admin",
        passwordHash: hashPassword("Admin@12345").passwordHash,
        createdAt: new Date().toISOString(),
        profile: { address: "Central Avenue, Luxury District", bio: "Hotel operations admin" }
      }
    ],
    bookings: [
      {
        id: "BK-GL-260610-101",
        invoice: "INV-ROOM-260610-101",
        qr: "GL|BK-GL-260610-101|Confirmed",
        roomId: "suite",
        roomType: "Luxury Suite",
        roomNumber: "501",
        checkIn: "2026-06-15",
        checkOut: "2026-06-17",
        adults: 2,
        children: 0,
        nights: 2,
        pricePerNight: 25000,
        taxes: 4500,
        discount: 2500,
        total: 52000,
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        status: "Confirmed",
        customer: { fullName: "Raj Patel", mobile: "9691368925", email: "raj@example.com", address: "Central Avenue", requests: "High floor room" },
        rewardPoints: 520,
        userId: null,
        notification: "Confirmation email, WhatsApp, and in-app notification sent."
      }
    ],
    orders: [
      {
        id: "ORD-GL-260610-201",
        invoice: "INV-FOOD-260610-201",
        items: [{ name: "Paneer Tikka", qty: 2, price: 349 }],
        deliveryType: "Room Delivery",
        customer: { name: "Raj Patel", roomNumber: "501", mobile: "9691368925" },
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        subtotal: 698,
        discount: 140,
        taxes: 28,
        delivery: 49,
        total: 586,
        status: "Preparing",
        rewardPoints: 5,
        userId: null,
        notification: "Food ordered notification sent by email, WhatsApp, and in-app."
      }
    ],
    payments: [
      { id: "PAY-GL-260610-101", sourceId: "BK-GL-260610-101", type: "Room Booking", method: "UPI", status: "Paid", amount: 52000, refundStatus: "Not Requested", userId: null },
      { id: "PAY-GL-260610-201", sourceId: "ORD-GL-260610-201", type: "Food Order", method: "UPI", status: "Paid", amount: 586, refundStatus: "Not Requested", userId: null }
    ],
    reservations: [
      { id: "RES-GL-260610-301", table: "T2", date: "2026-06-10", time: "20:00", guests: "2 guests", occasion: "Dinner", customer: { name: "Raj Patel", phone: "9691368925" }, status: "Reserved", userId: null }
    ],
    reviews: [],
    wishlist: [],
    notifications: [
      { id: randomUUID(), type: "booking", title: "Booking confirmed", message: "Room booking is confirmed.", read: false, createdAt: new Date().toISOString() },
      { id: randomUUID(), type: "order", title: "Order preparing", message: "Food order entered the kitchen queue.", read: false, createdAt: new Date().toISOString() }
    ],
    passwordResets: [],
    counters: { BK: 101, INV: 101, ORD: 201, RES: 301, PAY: 201, REV: 1 }
  };
}

function ensureDatabaseFolder() {
  const folder = dirname(dbFile);
  if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
}

function ensureDatabaseFile() {
  ensureDatabaseFolder();
  if (!existsSync(dbFile)) writeFileSync(dbFile, `${JSON.stringify(createInitialDatabase(), null, 2)}\n`, "utf8");
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}
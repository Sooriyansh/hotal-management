import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import {
  calculateBookingTotals,
  calculateOrderTotals,
  createToken,
  generateRecordId,
  getAvailableRoomNumbers,
  getAvailableTable,
  getRoomInventory,
  getTableInventory,
  hashPassword,
  loadDatabase,
  sanitizeUser,
  saveDatabase,
  verifyPassword,
  verifyToken
} from "./database.js";
import { hotelData } from "./hotelData.js";

loadDotEnv();

const port = Number(process.env.PORT || 5050);
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const clientDistDir = resolve(process.cwd(), "dist");
const clientIndexFile = join(clientDistDir, "index.html");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
};

let database = loadDatabase();

const toolHandlers = {
  getRoomInventory: () => getRoomInventory(database),
  getAvailableRooms: () => database.rooms.filter((room) => room.availability !== "sold out"),
  getBookingSummary: () => buildBookingSummary(),
  getActiveOffers: () => database.offers.filter((offer) => offer.status === "active"),
  getRestaurantMenu: () => database.restaurant.filter((item) => item.availability === "available"),
  getTableInventory: () => getTableInventory(database),
  getReservationSummary: () => buildReservationSummary(),
  getWeddingPackages: () => database.events.filter((event) => event.category.toLowerCase() === "wedding"),
  getSpaServices: () => database.spa.filter((service) => service.availability !== "sold out"),
  getEvents: () => database.events,
  getHotelContact: () => database.hotel
};

const server = createServer(async (request, response) => {
  setCors(response);
  const url = new URL(request.url || "/", "http://localhost");
  const path = url.pathname;

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method === "GET" && path === "/api/bootstrap") {
      sendJson(response, buildBootstrapPayload());
      return;
    }

    if (request.method === "GET" && path === "/api/concierge/context") {
      sendJson(response, { hotel: hotelData.hotel, quickActions: quickActions() });
      return;
    }

    if (request.method === "GET" && path === "/api/admin/ai-insights") {
      sendJson(response, database.analytics);
      return;
    }

    if (request.method === "POST" && path === "/api/concierge/chat") {
      const body = await readJson(request);
      const result = await handleChat(body);
      sendJson(response, result);
      return;
    }

    if (request.method === "POST" && path === "/api/auth/register") {
      const body = await readJson(request);
      sendJson(response, registerUser(body), 201);
      return;
    }

    if (request.method === "POST" && path === "/api/auth/login") {
      const body = await readJson(request);
      sendJson(response, loginUser(body));
      return;
    }

    if (request.method === "POST" && path === "/api/auth/forgot-password") {
      const body = await readJson(request);
      sendJson(response, createPasswordReset(body));
      return;
    }

    if (request.method === "POST" && path === "/api/auth/reset-password") {
      const body = await readJson(request);
      sendJson(response, resetPassword(body));
      return;
    }

    if (request.method === "GET" && path === "/api/auth/me") {
      const user = authenticateRequest(request);
      if (!user) {
        sendJson(response, { error: "Unauthorized" }, 401);
        return;
      }
      sendJson(response, { user: sanitizeUser(user) });
      return;
    }

    if (request.method === "GET" && path === "/api/bookings") {
      const user = authenticateRequest(request);
      const bookings = user?.role === "admin" ? database.bookings : database.bookings.filter((booking) => booking.userId === user?.id || !booking.userId);
      sendJson(response, { bookings });
      return;
    }

    if (request.method === "POST" && path === "/api/bookings") {
      const body = await readJson(request);
      sendJson(response, createBooking(body, authenticateRequest(request)), 201);
      return;
    }

    if (request.method === "PATCH" && path.startsWith("/api/bookings/")) {
      const body = await readJson(request);
      sendJson(response, updateBooking(path.split("/").pop(), body));
      return;
    }

    if (request.method === "GET" && path === "/api/reservations") {
      sendJson(response, { reservations: database.reservations });
      return;
    }

    if (request.method === "POST" && path === "/api/reservations") {
      const body = await readJson(request);
      sendJson(response, createReservation(body, authenticateRequest(request)), 201);
      return;
    }

    if (request.method === "PATCH" && path.startsWith("/api/reservations/")) {
      const body = await readJson(request);
      sendJson(response, updateReservation(path.split("/").pop(), body));
      return;
    }

    if (request.method === "GET" && path === "/api/orders") {
      sendJson(response, { orders: database.orders });
      return;
    }

    if (request.method === "POST" && path === "/api/orders") {
      const body = await readJson(request);
      sendJson(response, createOrder(body, authenticateRequest(request)), 201);
      return;
    }

    if (request.method === "PATCH" && path.startsWith("/api/orders/")) {
      const body = await readJson(request);
      sendJson(response, updateOrder(path.split("/").pop(), body));
      return;
    }

    if (request.method === "GET" && path === "/api/payments") {
      sendJson(response, { payments: database.payments });
      return;
    }

    if (request.method === "POST" && path === "/api/payments") {
      const body = await readJson(request);
      sendJson(response, createPayment(body, authenticateRequest(request)), 201);
      return;
    }

    if (request.method === "PATCH" && path.startsWith("/api/payments/")) {
      const body = await readJson(request);
      sendJson(response, updatePayment(path.split("/").pop(), body));
      return;
    }

    if (request.method === "GET" && path === "/api/reviews") {
      sendJson(response, { reviews: database.reviews });
      return;
    }

    if (request.method === "POST" && path === "/api/reviews") {
      const body = await readJson(request);
      sendJson(response, createReview(body, authenticateRequest(request)), 201);
      return;
    }

    if (request.method === "GET" && path === "/api/wishlist") {
      const user = authenticateRequest(request);
      sendJson(response, { wishlist: database.wishlist.filter((item) => item.userId === user?.id || !item.userId) });
      return;
    }

    if (request.method === "POST" && path === "/api/wishlist/toggle") {
      const body = await readJson(request);
      sendJson(response, toggleWishlist(body, authenticateRequest(request)));
      return;
    }

    if (request.method === "GET" && path === "/api/notifications") {
      sendJson(response, { notifications: database.notifications });
      return;
    }

    if (request.method === "POST" && path === "/api/notifications") {
      const body = await readJson(request);
      sendJson(response, createNotification(body), 201);
      return;
    }

    if (request.method === "PATCH" && path === "/api/notifications/mark-read") {
      const body = await readJson(request);
      sendJson(response, markNotificationsRead(body.ids || []));
      return;
    }

    if (request.method === "GET" && path === "/api/admin/rooms") {
      sendJson(response, { rooms: database.rooms });
      return;
    }

    if (request.method === "POST" && path === "/api/admin/rooms") {
      const body = await readJson(request);
      sendJson(response, upsertRoom(body), 201);
      return;
    }

    if (request.method === "PATCH" && path.startsWith("/api/admin/rooms/")) {
      const body = await readJson(request);
      sendJson(response, upsertRoom({ id: path.split("/").pop(), ...body }));
      return;
    }

    if (request.method === "DELETE" && path.startsWith("/api/admin/rooms/")) {
      sendJson(response, deleteRoom(path.split("/").pop()));
      return;
    }

    if (request.method === "GET" && path === "/api/admin/menu") {
      sendJson(response, { items: database.restaurant });
      return;
    }

    if (request.method === "POST" && path === "/api/admin/menu") {
      const body = await readJson(request);
      sendJson(response, upsertMenuItem(body), 201);
      return;
    }

    if (request.method === "PATCH" && path.startsWith("/api/admin/menu/")) {
      const body = await readJson(request);
      sendJson(response, upsertMenuItem({ id: path.split("/").pop(), ...body }));
      return;
    }

    if (request.method === "DELETE" && path.startsWith("/api/admin/menu/")) {
      sendJson(response, deleteMenuItem(path.split("/").pop()));
      return;
    }

    if (request.method === "GET" && path === "/api/availability/rooms") {
      const roomId = url.searchParams.get("roomId") || "suite";
      const checkIn = url.searchParams.get("checkIn") || "";
      const checkOut = url.searchParams.get("checkOut") || "";
      sendJson(response, { availableNumbers: getAvailableRoomNumbers(database, roomId, checkIn, checkOut) });
      return;
    }

    if (request.method === "GET" && path === "/api/availability/tables") {
      const date = url.searchParams.get("date") || "";
      const time = url.searchParams.get("time") || "";
      sendJson(response, { table: getAvailableTable(database, date, time) });
      return;
    }

    if (serveClientApp(request, response, path)) {
      return;
    }

    sendJson(response, { error: "Not found" }, 404);
  } catch (error) {
    sendJson(response, { error: error.message || "Server error" }, 500);
  }
});

server.listen(port, () => {
  console.log(`AI Concierge API running on http://localhost:${port}`);
});

function serveClientApp(request, response, path) {
  if (request.method !== "GET" || path.startsWith("/api")) {
    return false;
  }

  if (!existsSync(clientIndexFile)) {
    return false;
  }

  const requestedPath = path === "/" ? "/index.html" : path;
  const normalizedPath = requestedPath.replace(/^\/+/, "");
  const resolvedPath = resolve(clientDistDir, normalizedPath);
  const relativePath = relative(clientDistDir, resolvedPath);

  if (relativePath.startsWith("..")) {
    return false;
  }

  const isAssetRequest = extname(normalizedPath) !== "";
  const filePath = isAssetRequest ? resolvedPath : clientIndexFile;

  if (!existsSync(filePath)) {
    return false;
  }

  const contentType = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  const body = readFileSync(filePath);
  response.writeHead(200, { "Content-Type": contentType });
  response.end(body);
  return true;
}

function buildBootstrapPayload() {
  return {
    hotel: database.hotel,
    rooms: database.rooms,
    restaurant: database.restaurant,
    reservationsCatalog: database.reservationsCatalog,
    events: database.events,
    spa: database.spa,
    offers: database.offers,
    analytics: database.analytics,
    bookings: database.bookings,
    orders: database.orders,
    payments: database.payments,
    reservations: database.reservations,
    reviews: database.reviews,
    wishlist: database.wishlist,
    notifications: database.notifications,
    users: database.users.map(sanitizeUser)
  };
}

function authenticateRequest(request) {
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload?.sub) return null;
  return database.users.find((user) => user.id === payload.sub) || null;
}

function mutateDatabase(mutator) {
  const next = structuredClone(database);
  const result = mutator(next);
  database = next;
  saveDatabase(database);
  return result;
}

function registerUser({ fullName, email, password, mobile, role = "guest" }) {
  if (!fullName || !email || !password) throw new Error("Full name, email, and password are required");
  return mutateDatabase((next) => {
    if (next.users.some((user) => user.email.toLowerCase() === String(email).toLowerCase())) {
      throw new Error("An account with this email already exists");
    }
    const user = {
      id: `USR-${randomUUID()}`,
      fullName,
      email,
      mobile: mobile || "",
      role,
      passwordHash: hashPassword(password).passwordHash,
      createdAt: new Date().toISOString(),
      profile: { address: "", bio: "" }
    };
    next.users.unshift(user);
    next.notifications.unshift({ id: randomUUID(), type: "auth", title: "Account created", message: `${fullName} registered successfully.`, read: false, createdAt: new Date().toISOString() });
    const token = createToken({ sub: user.id, role: user.role });
    return { user: sanitizeUser(user), token, message: "Registration successful" };
  });
}

function loginUser({ email, password, rememberMe = false }) {
  if (!email || !password) throw new Error("Email and password are required");
  const user = database.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) throw new Error("Invalid email or password");
  const token = createToken({ sub: user.id, role: user.role, rememberMe: Boolean(rememberMe) });
  return { user: sanitizeUser(user), token, message: "Login successful" };
}

function createPasswordReset({ email }) {
  if (!email) throw new Error("Email is required");
  return mutateDatabase((next) => {
    const user = next.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
    if (!user) throw new Error("No account found for this email");
    const resetToken = randomUUID();
    next.passwordResets = next.passwordResets.filter((item) => item.email !== email);
    next.passwordResets.unshift({ email, resetToken, expiresAt: Date.now() + 1000 * 60 * 30 });
    user.resetToken = resetToken;
    return { message: "Password reset link prepared", resetToken };
  });
}

function resetPassword({ email, resetToken, password }) {
  if (!email || !resetToken || !password) throw new Error("Email, reset token, and password are required");
  return mutateDatabase((next) => {
    const reset = next.passwordResets.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase() && entry.resetToken === resetToken && entry.expiresAt > Date.now());
    if (!reset) throw new Error("Reset token is invalid or expired");
    const user = next.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
    if (!user) throw new Error("Account not found");
    user.passwordHash = hashPassword(password).passwordHash;
    delete user.resetToken;
    next.passwordResets = next.passwordResets.filter((entry) => entry.resetToken !== resetToken);
    return { message: "Password reset successful" };
  });
}

function createBooking(body, user) {
  const { roomId, checkIn, checkOut, adults = 2, children = 0, fullName, mobile, email, address = "", requests = "", paymentMethod = "UPI" } = body;
  if (!roomId || !checkIn || !checkOut || !fullName || !mobile || !email) throw new Error("Booking details are incomplete");
  return mutateDatabase((next) => {
    const room = next.rooms.find((entry) => entry.id === roomId);
    if (!room) throw new Error("Room not found");
    const availableNumbers = getAvailableRoomNumbers(next, roomId, checkIn, checkOut);
    if (!availableNumbers.length) throw new Error("Room not available for selected dates");
    const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
    const totals = calculateBookingTotals(room.price, nights);
    const bookingId = generateRecordId("BK", next);
    const booking = {
      id: bookingId,
      invoice: generateRecordId("INV", next).replace("INV-GL", "INV-ROOM"),
      qr: `GL|${bookingId}|Confirmed`,
      roomId,
      roomType: room.name,
      roomNumber: availableNumbers[0],
      checkIn,
      checkOut,
      adults: Number(adults),
      children: Number(children),
      nights,
      pricePerNight: room.price,
      taxes: totals.taxes,
      discount: totals.discount,
      total: totals.total,
      paymentMethod,
      paymentStatus: paymentMethod === "Net Banking" ? "Pending" : "Paid",
      status: paymentMethod === "Net Banking" ? "Pending" : "Confirmed",
      customer: { fullName, mobile, email, address, requests },
      rewardPoints: Math.floor(totals.total / 100),
      userId: user?.id || null,
      createdAt: new Date().toISOString(),
      notification: "Room booked notification sent by email, WhatsApp, and in-app."
    };
    const payment = {
      id: generateRecordId("PAY", next),
      sourceId: booking.id,
      type: "Room Booking",
      method: paymentMethod,
      status: booking.paymentStatus,
      amount: booking.total,
      refundStatus: "Not Requested",
      userId: user?.id || null,
      createdAt: new Date().toISOString()
    };
    next.bookings.unshift(booking);
    next.payments.unshift(payment);
    next.notifications.unshift({ id: randomUUID(), type: "booking", title: "Room booked successfully", message: `${booking.roomType} ${booking.roomNumber} is ${booking.status.toLowerCase()}.`, read: false, createdAt: new Date().toISOString() });
    return { booking, payment, message: "Room Booked Successfully" };
  });
}

function updateBooking(id, patch) {
  return mutateDatabase((next) => {
    const booking = next.bookings.find((entry) => entry.id === id);
    if (!booking) throw new Error("Booking not found");
    if (patch.status) booking.status = patch.status;
    if (patch.paymentStatus) booking.paymentStatus = patch.paymentStatus;
    next.notifications.unshift({ id: randomUUID(), type: "booking", title: "Booking updated", message: `${booking.id} status changed to ${booking.status}.`, read: false, createdAt: new Date().toISOString() });
    return { booking, message: "Booking updated" };
  });
}

function createReservation(body, user) {
  const { name, phone, date, time, guests = "2 guests", occasion = "Dinner" } = body;
  if (!name || !phone || !date || !time) throw new Error("Reservation details are incomplete");
  return mutateDatabase((next) => {
    const table = getAvailableTable(next, date, time);
    if (!table) throw new Error("Reservation already exists for the requested slot");
    const reservation = {
      id: generateRecordId("RES", next),
      table,
      date,
      time,
      guests,
      occasion,
      customer: { name, phone },
      status: "Reserved",
      userId: user?.id || null,
      createdAt: new Date().toISOString()
    };
    next.reservations.unshift(reservation);
    next.notifications.unshift({ id: randomUUID(), type: "reservation", title: "Table reserved successfully", message: `Table ${table} reserved for ${name}.`, read: false, createdAt: new Date().toISOString() });
    return { reservation, message: "Table Reserved Successfully" };
  });
}

function updateReservation(id, patch) {
  return mutateDatabase((next) => {
    const reservation = next.reservations.find((entry) => entry.id === id);
    if (!reservation) throw new Error("Reservation not found");
    if (patch.status) reservation.status = patch.status;
    next.notifications.unshift({ id: randomUUID(), type: "reservation", title: "Reservation updated", message: `${reservation.id} status changed to ${reservation.status}.`, read: false, createdAt: new Date().toISOString() });
    return { reservation, message: "Reservation updated" };
  });
}

function createOrder(body, user) {
  const { items = [], deliveryType = "Room Delivery", name, roomNumber = "", mobile, paymentMethod = "UPI", couponCode = "", customerRoomNumber = "" } = body;
  if (!items.length || !name || !mobile) throw new Error("Order details are incomplete");
  return mutateDatabase((next) => {
    const totals = calculateOrderTotals(items, couponCode);
    const order = {
      id: generateRecordId("ORD", next),
      invoice: generateRecordId("INV", next).replace("INV-GL", "INV-FOOD"),
      items,
      deliveryType,
      customer: { name, roomNumber: roomNumber || customerRoomNumber, mobile },
      paymentMethod,
      paymentStatus: paymentMethod === "Cash" ? "Pending" : "Paid",
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxes: totals.taxes,
      delivery: totals.delivery,
      total: totals.total,
      status: "Order Received",
      rewardPoints: Math.floor(totals.total / 100),
      userId: user?.id || null,
      createdAt: new Date().toISOString(),
      notification: "Food ordered notification sent by email, WhatsApp, and in-app."
    };
    const payment = {
      id: generateRecordId("PAY", next),
      sourceId: order.id,
      type: "Food Order",
      method: paymentMethod,
      status: order.paymentStatus,
      amount: order.total,
      refundStatus: "Not Requested",
      userId: user?.id || null,
      createdAt: new Date().toISOString()
    };
    next.orders.unshift(order);
    next.payments.unshift(payment);
    next.notifications.unshift({ id: randomUUID(), type: "order", title: "Order placed successfully", message: `Order ${order.id} is now ${order.status.toLowerCase()}.`, read: false, createdAt: new Date().toISOString() });
    return { order, payment, message: "Order Placed Successfully" };
  });
}

function updateOrder(id, patch) {
  return mutateDatabase((next) => {
    const order = next.orders.find((entry) => entry.id === id);
    if (!order) throw new Error("Order not found");
    if (patch.status) order.status = patch.status;
    next.notifications.unshift({ id: randomUUID(), type: "order", title: "Order updated", message: `${order.id} status changed to ${order.status}.`, read: false, createdAt: new Date().toISOString() });
    return { order, message: "Order updated" };
  });
}

function createPayment(body, user) {
  const { sourceId, type, method, status = "Pending", amount = 0 } = body;
  if (!sourceId || !type) throw new Error("Payment details are incomplete");
  return mutateDatabase((next) => {
    const payment = {
      id: generateRecordId("PAY", next),
      sourceId,
      type,
      method: method || "UPI",
      status,
      amount: Number(amount) || 0,
      refundStatus: body.refundStatus || "Not Requested",
      userId: user?.id || null,
      createdAt: new Date().toISOString()
    };
    next.payments.unshift(payment);
    next.notifications.unshift({ id: randomUUID(), type: "payment", title: "Payment recorded", message: `${type} payment ${status.toLowerCase()}.`, read: false, createdAt: new Date().toISOString() });
    return { payment, message: "Payment Successful" };
  });
}

function updatePayment(id, patch) {
  return mutateDatabase((next) => {
    const payment = next.payments.find((entry) => entry.id === id);
    if (!payment) throw new Error("Payment not found");
    if (patch.status) payment.status = patch.status;
    if (patch.refundStatus) payment.refundStatus = patch.refundStatus;
    next.notifications.unshift({ id: randomUUID(), type: "payment", title: "Payment updated", message: `${payment.id} now ${payment.status}.`, read: false, createdAt: new Date().toISOString() });
    return { payment, message: "Payment updated" };
  });
}

function createReview(body, user) {
  const { category, rating, title = "", comment = "" } = body;
  if (!category || !rating || !comment) throw new Error("Review details are incomplete");
  return mutateDatabase((next) => {
    const review = {
      id: generateRecordId("REV", next),
      category,
      rating: Number(rating),
      title,
      comment,
      userId: user?.id || null,
      author: user?.fullName || body.author || "Guest",
      createdAt: new Date().toISOString()
    };
    next.reviews.unshift(review);
    next.notifications.unshift({ id: randomUUID(), type: "review", title: "Review submitted", message: `${review.author} submitted a ${category} review.`, read: false, createdAt: new Date().toISOString() });
    return { review, message: "Review Submitted" };
  });
}

function toggleWishlist(body, user) {
  const { type, itemId, item } = body;
  if (!type || !itemId) throw new Error("Wishlist item is incomplete");
  return mutateDatabase((next) => {
    const userId = user?.id || null;
    const existingIndex = next.wishlist.findIndex((entry) => entry.type === type && entry.itemId === itemId && entry.userId === userId);
    if (existingIndex >= 0) {
      next.wishlist.splice(existingIndex, 1);
      return { saved: false, message: "Removed from wishlist" };
    }
    const savedItem = { id: randomUUID(), type, itemId, item: item || {}, userId, createdAt: new Date().toISOString() };
    next.wishlist.unshift(savedItem);
    next.notifications.unshift({ id: randomUUID(), type: "wishlist", title: "Wishlist updated", message: `${item?.name || itemId} saved.`, read: false, createdAt: new Date().toISOString() });
    return { saved: true, item: savedItem, message: "Added to wishlist" };
  });
}

function markNotificationsRead(ids) {
  return mutateDatabase((next) => {
    const targets = new Set(ids);
    next.notifications = next.notifications.map((notification) => (targets.has(notification.id) ? { ...notification, read: true } : notification));
    return { notifications: next.notifications, message: "Notifications updated" };
  });
}

function createNotification(body) {
  const { type = "general", title, message } = body;
  if (!title || !message) throw new Error("Notification title and message are required");
  return mutateDatabase((next) => {
    const notification = { id: randomUUID(), type, title, message, read: false, createdAt: new Date().toISOString() };
    next.notifications.unshift(notification);
    return { notification, message: "Notification created" };
  });
}

function upsertRoom(body) {
  return mutateDatabase((next) => {
    if (!body.name || !body.price) throw new Error("Room name and price are required");
    const payload = { ...body, price: Number(body.price), availability: body.availability || "available" };
    if (payload.id) {
      const existing = next.rooms.find((room) => room.id === payload.id);
      if (!existing) throw new Error("Room not found");
      Object.assign(existing, payload);
      return { room: existing, message: "Room updated" };
    }
    const room = { id: payload.id || `room-${randomUUID()}`, ...payload };
    next.rooms.unshift(room);
    return { room, message: "Room created" };
  });
}

function deleteRoom(id) {
  return mutateDatabase((next) => {
    next.rooms = next.rooms.filter((room) => room.id !== id);
    return { message: "Room deleted" };
  });
}

function upsertMenuItem(body) {
  return mutateDatabase((next) => {
    if (!body.name || !body.price) throw new Error("Menu item name and price are required");
    const payload = { ...body, price: Number(body.price), availability: body.availability || "available" };
    if (payload.id) {
      const existing = next.restaurant.find((item) => item.id === payload.id);
      if (!existing) throw new Error("Menu item not found");
      Object.assign(existing, payload);
      return { item: existing, message: "Menu item updated" };
    }
    const item = { id: payload.id || `food-${randomUUID()}`, ...payload };
    next.restaurant.unshift(item);
    return { item, message: "Menu item created" };
  });
}

function deleteMenuItem(id) {
  return mutateDatabase((next) => {
    next.restaurant = next.restaurant.filter((item) => item.id !== id);
    return { message: "Menu item deleted" };
  });
}

async function handleChat({ message = "", history = [] }) {
  const toolsUsed = selectTools(message);
  const apiResults = Object.fromEntries(toolsUsed.map((tool) => [tool, toolHandlers[tool] ? toolHandlers[tool]() : null]));

  if (!process.env.GEMINI_API_KEY) {
    return { reply: buildGroundedFallback(message, apiResults), toolsUsed, source: "hotel-api" };
  }

  try {
    const reply = await callGemini(message, history, apiResults);
    return { reply, toolsUsed, source: "gemini" };
  } catch (error) {
    console.error(`Gemini unavailable, using hotel data fallback: ${error.message}`);
    return { reply: buildGroundedFallback(message, apiResults), toolsUsed, source: "hotel-api" };
  }
}

function selectTools(message) {
  const value = message.toLowerCase();
  const selected = new Set(["getHotelContact"]);

  if (/(room|rooms|kamra|deluxe|suite|family|available|availability|price|rate|capacity|kitne|ketne|count|inventory)/i.test(value)) {
    selected.add("getAvailableRooms");
    selected.add("getRoomInventory");
  }
  if (/(booking|booked|check.?in|check.?out|guest|customer|client|clicent|invoice|payment)/i.test(value)) selected.add("getBookingSummary");
  if (/(offer|discount|coupon|deal|grand20|aaj|today)/i.test(value)) selected.add("getActiveOffers");
  if (/(menu|food|dish|chinese|indian|italian|breakfast|dinner|lunch|chef|khana)/i.test(value)) selected.add("getRestaurantMenu");
  if (/(table|tables|reserve|reserved|reservation|restaurant booking|dining|seat)/i.test(value)) {
    selected.add("getTableInventory");
    selected.add("getReservationSummary");
  }
  if (/(wedding|conference|birthday|corporate|event|hall|package)/i.test(value)) selected.add("getWeddingPackages");
  if (/(spa|massage|wellness|therapy)/i.test(value)) selected.add("getSpaServices");

  if (selected.size === 1) {
    selected.add("getRoomInventory");
    selected.add("getAvailableRooms");
    selected.add("getRestaurantMenu");
    selected.add("getActiveOffers");
    selected.add("getTableInventory");
  }

  return [...selected];
}

function buildBookingSummary() {
  const activeBookings = database.bookings.filter((booking) => booking.status !== "Cancelled" && booking.status !== "Checked Out");
  const countsByRoom = database.rooms.map((room) => ({
    roomId: room.id,
    roomType: room.name,
    activeBookings: activeBookings.filter((booking) => booking.roomId === room.id).length
  }));
  return {
    totalBookings: database.bookings.length,
    activeBookings: activeBookings.length,
    latestBookings: activeBookings.slice(0, 6).map((booking) => ({
      id: booking.id,
      roomType: booking.roomType,
      roomNumber: booking.roomNumber,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: `${booking.adults} adults, ${booking.children} children`,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      total: booking.total,
      customerName: booking.customer?.fullName
    })),
    countsByRoom
  };
}

function buildReservationSummary() {
  const activeReservations = database.reservations.filter((reservation) => reservation.status !== "Cancelled" && reservation.status !== "Completed");
  return {
    tableInventory: getTableInventory(database),
    totalReservations: database.reservations.length,
    activeReservations: activeReservations.length,
    latestReservations: activeReservations.slice(0, 6).map((reservation) => ({
      id: reservation.id,
      table: reservation.table,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      occasion: reservation.occasion,
      status: reservation.status,
      customerName: reservation.customer?.name
    }))
  };
}

async function callGemini(message, history, apiResults) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const contents = [
    ...history.slice(-10).map((item) => ({ role: item.from === "bot" ? "model" : "user", parts: [{ text: item.text }] })),
    {
      role: "user",
      parts: [{ text: `Customer message: ${message}\n\nLive hotel API results:\n${JSON.stringify(apiResults, null, 2)}\n\nAnswer in the customer's language. Use only the live API results.` }]
    }
  ];

  const payload = {
    systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
    contents,
    generationConfig: { temperature: 0.35, topP: 0.9, maxOutputTokens: 420 }
  };

  const geminiResponse = await fetchWithRetry(endpoint, payload);
  const data = await geminiResponse.json();
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("").trim() || "I couldn't confirm that right now. Please try again in a moment.";
}

async function fetchWithRetry(endpoint, payload) {
  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (geminiResponse.ok) return geminiResponse;

    const details = await geminiResponse.text();
    lastError = new Error(formatGeminiError(geminiResponse.status, details));

    if (!isTransientGeminiError(geminiResponse.status) || attempt === maxAttempts) {
      throw lastError;
    }
  }

  throw lastError || new Error("Gemini request failed");
}

function isTransientGeminiError(status) {
  return status === 429 || status === 503 || status === 504;
}

function formatGeminiError(status, details) {
  try {
    const parsed = JSON.parse(details);
    const message = parsed.error?.message || details;
    return `Gemini ${status}: ${message}`;
  } catch {
    return `Gemini ${status}: ${details}`;
  }
}

function buildSystemPrompt() {
  return `You are Grand Luxury Hotel & Restaurant's Official AI Concierge.

Rules:
1. Always represent the hotel professionally.
2. Support Hindi, English and Hinglish.
3. Answer only using information provided by hotel database and APIs.
4. Never hallucinate.
5. Never create fake room prices.
6. Never create fake offers.
7. If information is unavailable say: "Please contact our reception team for the latest information."
7. If information is unavailable say: "I couldn't confirm that right now. Please try again in a moment."
8. Be friendly, professional and luxury hospitality focused.
9. Recommend rooms, food, events and spa services whenever helpful.
10. Maintain conversational memory during the session.
11. Keep responses clear and concise.
12. Act like a real 5-star hotel concierge.`;
}

function buildGroundedFallback(message, apiResults) {
  const value = message.toLowerCase();
  const wantsHindi = /(hindi|hinglish|bhai|kya|dikhao|batao|chahiye|kamra|khana|shaadi|kal|aaj|kitne|ketne|booking|reserve)/i.test(value);
  const roomInventory = apiResults.getRoomInventory;
  const asksRooms = /(room|rooms|kamra|available|availability|price|rate|capacity|kitne|ketne|count|inventory)/i.test(value);
  const asksTables = /(table|reserve|reserved|reservation|dining|seat)/i.test(value);
  if (roomInventory && (apiResults.getTableInventory || apiResults.getReservationSummary) && asksRooms && asksTables) {
    const tableInventory = apiResults.getTableInventory || apiResults.getReservationSummary?.tableInventory;
    const totalRooms = roomInventory.reduce((sum, room) => sum + room.totalRooms, 0);
    const availableRooms = roomInventory.reduce((sum, room) => sum + room.availableRooms, 0);
    const window = roomInventory[0]?.availabilityWindow;
    const windowText = window ? `${window.checkIn} to ${window.checkOut}` : "the selected dates";
    return wantsHindi
      ? `Rooms: total ${totalRooms}, ${windowText} ke liye ${availableRooms} available. Tables: total ${tableInventory.totalTables}, available ${tableInventory.availableTables.join(", ") || "none"}, reserved/booked ${tableInventory.occupiedTables.join(", ") || "none"}. Booking/reservation ke liye date, time, guests aur contact detail batayein.`
      : `Rooms: ${availableRooms}/${totalRooms} available for ${windowText}. Tables: ${tableInventory.availableTables.join(", ") || "none"} available out of ${tableInventory.totalTables}; reserved/booked: ${tableInventory.occupiedTables.join(", ") || "none"}. Please share date, time, guests, and contact details to book.`;
  }

  if (roomInventory && /(room|rooms|kamra|available|availability|price|rate|capacity|kitne|ketne|count|inventory)/i.test(value)) {
    const totalRooms = roomInventory.reduce((sum, room) => sum + room.totalRooms, 0);
    const availableRooms = roomInventory.reduce((sum, room) => sum + room.availableRooms, 0);
    const window = roomInventory[0]?.availabilityWindow;
    const windowText = window ? `${window.checkIn} to ${window.checkOut}` : "the selected dates";
    const roomLines = roomInventory.map((room) => `${room.name}: ${room.availableRooms}/${room.totalRooms} rooms, ${formatINR(room.price)}, capacity ${room.capacity}`).join("; ");
    return wantsHindi
      ? `Hotel me total ${totalRooms} rooms hain. ${windowText} ke liye ${availableRooms} rooms available hain. ${roomLines}. Booking ke liye check-in, check-out aur guests batayein.`
      : `We have ${totalRooms} total rooms, with ${availableRooms} available for ${windowText}. ${roomLines}. Please share check-in, check-out, and guest count to book.`;
  }

  if (apiResults.getBookingSummary && /(booking|booked|check.?in|check.?out|client|clicent|customer|guest|payment)/i.test(value)) {
    const summary = apiResults.getBookingSummary;
    const latest = summary.latestBookings.map((booking) => `${booking.id}: ${booking.roomType} ${booking.roomNumber}, ${booking.checkIn} to ${booking.checkOut}, ${booking.status}, ${formatINR(booking.total)}`).join("; ");
    return wantsHindi
      ? `Abhi ${summary.activeBookings} active room bookings hain. Latest: ${latest || "no active bookings"}.`
      : `There are ${summary.activeBookings} active room bookings. Latest: ${latest || "no active bookings"}.`;
  }

  if ((apiResults.getTableInventory || apiResults.getReservationSummary) && /(table|reserve|reserved|reservation|dining|seat)/i.test(value)) {
    const tableInventory = apiResults.getTableInventory || apiResults.getReservationSummary?.tableInventory;
    const summary = apiResults.getReservationSummary;
    const reservationLine = summary?.latestReservations?.length
      ? ` Latest reservations: ${summary.latestReservations.map((reservation) => `${reservation.table} on ${reservation.date} at ${reservation.time} for ${reservation.guests}`).join("; ")}.`
      : "";
    return wantsHindi
      ? `Restaurant me total ${tableInventory.totalTables} tables hain. Available: ${tableInventory.availableTables.join(", ") || "none"}, reserved/booked: ${tableInventory.occupiedTables.join(", ") || "none"}.${reservationLine} Table reserve karne ke liye date, time, name aur phone batayein.`
      : `The restaurant has ${tableInventory.totalTables} tables. Available: ${tableInventory.availableTables.join(", ") || "none"}; reserved/booked: ${tableInventory.occupiedTables.join(", ") || "none"}.${reservationLine} Please share date, time, name, and phone to reserve.`;
  }

  const menu = apiResults.getRestaurantMenu;
  if (menu) {
    const categoryMatches = [["chinese", "Chinese Cuisine"], ["indian", "Indian Cuisine"], ["italian", "Italian Cuisine"], ["breakfast", "Breakfast"], ["dessert", "Desserts"], ["beverage", "Beverages"], ["dinner", "Dinner"]];
    const category = categoryMatches.find(([keyword]) => value.includes(keyword))?.[1];
    const matches = category ? menu.filter((item) => item.category === category) : menu.filter((item) => item.tags?.some((tag) => /chef special|popular|favorite/i.test(tag)));
    if (matches.length) {
      const items = matches.slice(0, 4).map((item) => `${item.name} ${formatINR(item.price)} (${item.rating}/5)`).join("; ");
      return wantsHindi ? `${category || "Chef picks"} me best options: ${items}.` : `${category || "Chef picks"}: ${items}.`;
    }
  }

  if (wantsHindi) {
    if (apiResults.getAvailableRooms) return `Available rooms: ${apiResults.getAvailableRooms.map((room) => `${room.name} ${formatINR(room.price)}, capacity ${room.capacity}`).join("; ")}. Booking ke liye date, guests aur preferred room batayein.`;
    if (menu) return `Menu me chef picks: ${menu.slice(0, 4).map((item) => `${item.name} ${formatINR(item.price)}`).join("; ")}.`;
  }

  if (apiResults.getActiveOffers) return `Active offers: ${apiResults.getActiveOffers.map((offer) => `${offer.name} - ${offer.discount}`).join("; ")}.`;
  if (menu) return `Menu highlights: ${menu.slice(0, 4).map((item) => `${item.name} (${formatINR(item.price)})`).join(", ")}.`;
  return "I couldn't confirm that right now. Please try again in a moment.";
}

function quickActions() {
  return ["Available Rooms", "Book Room", "Restaurant Menu", "Reserve Table", "Today's Offers", "Spa Services", "Wedding Packages", "Contact Reception"];
}

function formatINR(value) {
  return `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")} INR`;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sendJson(response, payload, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function loadDotEnv() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = valueParts.join("=").trim();
  }
}

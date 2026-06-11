const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function authHeaders() {
  const token = localStorage.getItem("grandLuxuryAuthToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || payload.message || "Request failed");
  }
  return payload;
}

export function getBootstrap() {
  return request("/bootstrap");
}

export function register(payload) {
  return request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function login(payload) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function forgotPassword(payload) {
  return request("/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) });
}

export function resetPassword(payload) {
  return request("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) });
}

export function getProfile() {
  return request("/auth/me");
}

export function createBooking(payload) {
  return request("/bookings", { method: "POST", body: JSON.stringify(payload) });
}

export function updateBooking(id, payload) {
  return request(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function createReservation(payload) {
  return request("/reservations", { method: "POST", body: JSON.stringify(payload) });
}

export function updateReservation(id, payload) {
  return request(`/reservations/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function createOrder(payload) {
  return request("/orders", { method: "POST", body: JSON.stringify(payload) });
}

export function updateOrder(id, payload) {
  return request(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function createPayment(payload) {
  return request("/payments", { method: "POST", body: JSON.stringify(payload) });
}

export function updatePayment(id, payload) {
  return request(`/payments/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function createReview(payload) {
  return request("/reviews", { method: "POST", body: JSON.stringify(payload) });
}

export function toggleWishlist(payload) {
  return request("/wishlist/toggle", { method: "POST", body: JSON.stringify(payload) });
}

export function getNotifications() {
  return request("/notifications");
}

export function createNotification(payload) {
  return request("/notifications", { method: "POST", body: JSON.stringify(payload) });
}

export function markNotificationsRead(ids) {
  return request("/notifications/mark-read", { method: "PATCH", body: JSON.stringify({ ids }) });
}

export function getAvailability(roomId, checkIn, checkOut) {
  const params = new URLSearchParams({ roomId, checkIn, checkOut });
  return request(`/availability/rooms?${params.toString()}`);
}

export function getTableAvailability(date, time) {
  const params = new URLSearchParams({ date, time });
  return request(`/availability/tables?${params.toString()}`);
}

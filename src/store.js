import { configureStore, createAction, createSlice } from "@reduxjs/toolkit";

function readStoredValue(key, fallback) {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const hydrateStore = createAction("app/hydrateStore");

const cartSlice = createSlice({
  name: "cart",
  initialState: readStoredValue("grandLuxuryCart", { items: [], coupon: "" }),
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) existing.qty += 1;
      else state.items.push({ ...action.payload, qty: 1 });
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQty(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (item) item.qty = Math.max(1, action.payload.qty);
    },
    applyCoupon(state, action) {
      state.coupon = action.payload.toUpperCase();
    },
    clearCart(state) {
      state.items = [];
      state.coupon = "";
    }
  },
  extraReducers(builder) {
    builder.addCase(hydrateStore, (state, action) => {
      if (action.payload.cart) return action.payload.cart;
      return state;
    });
  }
});

const bookingSlice = createSlice({
  name: "booking",
  initialState: readStoredValue("grandLuxuryBooking", {
    roomSearch: { checkIn: "", checkOut: "", guests: "2", room: "Luxury Suite" },
    reservation: { date: "", time: "20:00", guests: "2", occasion: "Dinner" },
    bookings: []
  }),
  reducers: {
    setRoomSearch(state, action) {
      state.roomSearch = action.payload;
    },
    setReservation(state, action) {
      state.reservation = action.payload;
    },
    createBooking(state, action) {
      state.bookings.unshift(action.payload);
    },
    updateBookingStatus(state, action) {
      const booking = state.bookings.find((item) => item.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
        if (action.payload.status === "Confirmed") booking.notification = "Booking confirmed notification sent by email, WhatsApp, and in-app.";
        if (action.payload.status === "Cancelled") {
          booking.paymentStatus = "Refund Pending";
          booking.notification = "Booking cancelled notification sent by email, WhatsApp, and in-app.";
        }
      }
    },
    cancelBooking(state, action) {
      const booking = state.bookings.find((item) => item.id === action.payload);
      if (booking) {
        booking.status = "Cancelled";
        booking.paymentStatus = "Refund Pending";
        booking.notification = "Booking cancelled notification sent by email, WhatsApp, and in-app.";
      }
    }
  },
  extraReducers(builder) {
    builder.addCase(hydrateStore, (state, action) => {
      if (action.payload.booking) return action.payload.booking;
      return state;
    });
  }
});

const orderSlice = createSlice({
  name: "orders",
  initialState: readStoredValue("grandLuxuryOrders", { orders: [] }),
  reducers: {
    createOrder(state, action) {
      state.orders.unshift(action.payload);
    },
    updateOrderStatus(state, action) {
      const order = state.orders.find((item) => item.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
        if (action.payload.status === "Delivered") order.notification = "Order delivered notification sent by email, WhatsApp, and in-app.";
      }
    }
  },
  extraReducers(builder) {
    builder.addCase(hydrateStore, (state, action) => {
      if (action.payload.orders) return action.payload.orders;
      return state;
    });
  }
});

const paymentSlice = createSlice({
  name: "payments",
  initialState: readStoredValue("grandLuxuryPayments", { payments: [] }),
  reducers: {
    createPayment(state, action) {
      state.payments.unshift(action.payload);
    },
    updatePaymentStatus(state, action) {
      const payment = state.payments.find((item) => item.id === action.payload.id);
      if (payment) {
        payment.status = action.payload.status || payment.status;
        payment.refundStatus = action.payload.refundStatus || payment.refundStatus;
      }
    }
  },
  extraReducers(builder) {
    builder.addCase(hydrateStore, (state, action) => {
      if (action.payload.payments) return action.payload.payments;
      return state;
    });
  }
});

const reservationSlice = createSlice({
  name: "reservations",
  initialState: readStoredValue("grandLuxuryReservations", { reservations: [] }),
  reducers: {
    createReservation(state, action) {
      state.reservations.unshift(action.payload);
    },
    updateReservationStatus(state, action) {
      const reservation = state.reservations.find((item) => item.id === action.payload.id);
      if (reservation) reservation.status = action.payload.status;
    }
  },
  extraReducers(builder) {
    builder.addCase(hydrateStore, (state, action) => {
      if (action.payload.reservations) return action.payload.reservations;
      return state;
    });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: readStoredValue("grandLuxuryAuth", {
    user: null,
    token: localStorage.getItem("grandLuxuryAuthToken") || "",
    forgotToken: ""
  }),
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearAuth(state) {
      state.user = null;
      state.token = "";
      state.forgotToken = "";
    },
    setForgotToken(state, action) {
      state.forgotToken = action.payload;
    }
  },
  extraReducers(builder) {
    builder.addCase(hydrateStore, (state, action) => {
      if (action.payload.auth) return action.payload.auth;
      return state;
    });
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: readStoredValue("grandLuxuryWishlist", { items: [] }),
  reducers: {
    setWishlist(state, action) {
      state.items = action.payload.items || [];
    }
  },
  extraReducers(builder) {
    builder.addCase(hydrateStore, (state, action) => {
      if (action.payload.wishlist) return action.payload.wishlist;
      return state;
    });
  }
});

const reviewSlice = createSlice({
  name: "reviews",
  initialState: readStoredValue("grandLuxuryReviews", { items: [] }),
  reducers: {
    setReviews(state, action) {
      state.items = action.payload.items || [];
    }
  },
  extraReducers(builder) {
    builder.addCase(hydrateStore, (state, action) => {
      if (action.payload.reviews) return action.payload.reviews;
      return state;
    });
  }
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState: readStoredValue("grandLuxuryNotifications", { items: [] }),
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload.items || [];
    },
    markNotificationRead(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item) item.read = true;
    }
  },
  extraReducers(builder) {
    builder.addCase(hydrateStore, (state, action) => {
      if (action.payload.notifications) return action.payload.notifications;
      return state;
    });
  }
});

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    bookingModalOpen: false,
    reservationModalOpen: false,
    authModalOpen: false,
    authMode: "login",
    activeDialog: null
  },
  reducers: {
    openBookingModal(state, action) {
      state.bookingModalOpen = true;
      state.activeDialog = action.payload || null;
    },
    closeBookingModal(state) {
      state.bookingModalOpen = false;
    },
    openReservationModal(state) {
      state.reservationModalOpen = true;
    },
    closeReservationModal(state) {
      state.reservationModalOpen = false;
    },
    openAuthModal(state, action) {
      state.authModalOpen = true;
      state.authMode = action.payload || "login";
    },
    closeAuthModal(state) {
      state.authModalOpen = false;
    },
    setAuthMode(state, action) {
      state.authMode = action.payload;
    },
    setActiveDialog(state, action) {
      state.activeDialog = action.payload;
    }
  }
});

export const { addToCart, removeFromCart, updateQty, applyCoupon, clearCart } = cartSlice.actions;
export const { cancelBooking, createBooking, setRoomSearch, setReservation, updateBookingStatus } = bookingSlice.actions;
export const { createOrder, updateOrderStatus } = orderSlice.actions;
export const { createPayment, updatePaymentStatus } = paymentSlice.actions;
export const { createReservation, updateReservationStatus } = reservationSlice.actions;
export const { setAuth, clearAuth, setForgotToken } = authSlice.actions;
export const { setWishlist } = wishlistSlice.actions;
export const { setReviews } = reviewSlice.actions;
export const { setNotifications, markNotificationRead } = notificationSlice.actions;
export const { openBookingModal, closeBookingModal, openReservationModal, closeReservationModal, openAuthModal, closeAuthModal, setAuthMode, setActiveDialog } = uiSlice.actions;
export { hydrateStore };

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    booking: bookingSlice.reducer,
    orders: orderSlice.reducer,
    payments: paymentSlice.reducer,
    reservations: reservationSlice.reducer,
    auth: authSlice.reducer,
    wishlist: wishlistSlice.reducer,
    reviews: reviewSlice.reducer,
    notifications: notificationSlice.reducer,
    ui: uiSlice.reducer
  }
});

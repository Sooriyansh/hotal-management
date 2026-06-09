import { configureStore, createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    coupon: ""
  },
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
  }
});

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    roomSearch: { checkIn: "", checkOut: "", guests: "2", room: "Luxury Suite" },
    reservation: { date: "", time: "20:00", guests: "2", occasion: "Dinner" }
  },
  reducers: {
    setRoomSearch(state, action) {
      state.roomSearch = action.payload;
    },
    setReservation(state, action) {
      state.reservation = action.payload;
    }
  }
});

export const { addToCart, removeFromCart, updateQty, applyCoupon, clearCart } = cartSlice.actions;
export const { setRoomSearch, setReservation } = bookingSlice.actions;

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    booking: bookingSlice.reducer
  }
});

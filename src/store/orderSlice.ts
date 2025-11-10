import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  total: number;
};

export type OrderStatus = {
  received: boolean;
  couriered: boolean;
  delivered: boolean;
  paid: boolean;
};

export type TimelineItem = {
  status: keyof OrderStatus;
  timestamp: string;
};

export type Order = {
  id: string;
  customerName: string;
  phone?: string;
  address?: string;
  items: OrderItem[];
  taxes: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  timeline: TimelineItem[];
  createdAt: string;
};

type OrdersState = {
  orders: Order[];
};

const initialState: OrdersState = {
  orders: [],
};

const now = () => new Date().toISOString();

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
    },
    addOrder(state, action: PayloadAction<Omit<Order, 'id' | 'createdAt'>>) {
      const payload = action.payload as Omit<Order, 'id' | 'createdAt'>;
      const newOrder: Order = {
        ...payload,
        id: nanoid(),
        createdAt: now(),
      };
      state.orders.unshift(newOrder);
    },
    updateOrder(state, action: PayloadAction<Order>) {
      const idx = state.orders.findIndex(o => o.id === action.payload.id);
      if (idx >= 0) state.orders[idx] = action.payload;
    },
    toggleStatus(state, action: PayloadAction<{ id: string; statusKey: keyof OrderStatus }>) {
      const { id, statusKey } = action.payload;
      const order = state.orders.find(o => o.id === id);
      if (!order) return;
      // toggle
      (order.status as any)[statusKey] = !(order.status as any)[statusKey];
      order.timeline.push({ status: statusKey, timestamp: now() });
    },
    addTimeline(state, action: PayloadAction<{ id: string; status: keyof OrderStatus }>) {
      const { id, status } = action.payload;
      const order = state.orders.find(o => o.id === id);
      if (!order) return;
      order.timeline.push({ status, timestamp: now() });
    },
    removeOrder(state, action: PayloadAction<string>) {
      state.orders = state.orders.filter(o => o.id !== action.payload);
    }
  }
});

export const { setOrders, addOrder, updateOrder, toggleStatus, addTimeline, removeOrder } = orderSlice.actions;

export default orderSlice.reducer;

export const selectOrders = (state: any) => state.orders.orders as Order[];

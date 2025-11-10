import { configureStore, combineReducers } from '@reduxjs/toolkit';
import companyReducer from './companySlice';
import ordersReducer, { setOrders } from './orderSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rootReducer = combineReducers({
  company: companyReducer,
  orders: ordersReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

const ORDERS_KEY = 'HMP_ORDERS_V1';

export async function loadPersistedOrders() {
  try {
    const raw = await AsyncStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      store.dispatch(setOrders(parsed));
    }
  } catch (e) {
    console.warn('loadPersistedOrders failed', e);
  }
}

// Subscribe to store changes and persist orders
let lastJSON = '';
store.subscribe(() => {
  try {
    const state = store.getState();
    const toPersist = state.orders.orders || [];
    const json = JSON.stringify(toPersist);
    if (json !== lastJSON) {
      lastJSON = json;
      AsyncStorage.setItem(ORDERS_KEY, json).catch(e => console.warn('persist orders failed', e));
    }
  } catch (e) {
    console.warn('store subscribe error', e);
  }
});

export default store;

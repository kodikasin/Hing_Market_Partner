import { configureStore, combineReducers } from '@reduxjs/toolkit';
import companyReducer, { setCompany } from './companySlice';
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
const COMPANY_KEY = 'HMP_COMPANY_V1';

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

export async function loadPersistedCompany() {
  try {
    const raw = await AsyncStorage.getItem(COMPANY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // ensure parsed shape matches companyDetail
      store.dispatch(setCompany(parsed));
    }
  } catch (e) {
    console.warn('loadPersistedCompany failed', e);
  }
}

// Subscribe to store changes and persist orders
let lastOrdersJSON = '';
let lastCompanyJSON = '';
store.subscribe(() => {
  try {
    const state = store.getState();
    const toPersist = state.orders.orders || [];
    const ordersJson = JSON.stringify(toPersist);
    if (ordersJson !== lastOrdersJSON) {
      lastOrdersJSON = ordersJson;
      AsyncStorage.setItem(ORDERS_KEY, ordersJson).catch(e =>
        console.warn('persist orders failed', e),
      );
    }

    const company = state.company || {};
    const companyJson = JSON.stringify(company);
    if (companyJson !== lastCompanyJSON) {
      lastCompanyJSON = companyJson;
      AsyncStorage.setItem(COMPANY_KEY, companyJson).catch(e =>
        console.warn('persist company failed', e),
      );
    }
  } catch (e) {
    console.warn('store subscribe error', e);
  }
});

export default store;

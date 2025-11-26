import { useCallback, useState, useEffect } from 'react';
import { useRealm, useQuery } from '@realm/react';
import {
  Order,
  OrderStatus,
  companyDetail,
} from './realmSchemas';

// Simple UUID v4 generator
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0; // eslint-disable-line no-bitwise
    const v = c === 'x' ? r : ((r & 0x3) | 0x8); // eslint-disable-line no-bitwise
    return v.toString(16);
  });
};

const DEFAULT_COMPANY_ID = 'company_default';

export const useRealmStore = () => {
  const realm = useRealm();
  const orders = useQuery<Order>('Order');
  const companies = useQuery<companyDetail>('Company');
  const [company, setCompany] = useState<companyDetail | null>(null);

  useEffect(() => {
    const comp = companies.find((c) => c._id === DEFAULT_COMPANY_ID);
    setCompany(comp || null);
  }, [companies]);

  const initializeDefaultCompany = useCallback(() => {
    try {
      const existing = realm.objectForPrimaryKey('Company', DEFAULT_COMPANY_ID);
      if (!existing) {
        realm.write(() => {
          realm.create('Company', {
            _id: DEFAULT_COMPANY_ID,
            companyName: 'Rs Hing',
            address: JSON.stringify({
              street: 'pathwari gali',
              city: 'Hathras',
              pincode: 204101,
              state: 'Uttar Pradesh',
              country: 'india',
            }),
            mobileNo: '1234567890',
            gstNo: '123456789012345',
            email: 'rajansingh@gmail.com',
          });
        });
      }
    } catch (e) {
      console.warn('Failed to initialize default company', e);
    }
  }, [realm]);

  // Company operations
  const updateCompany = useCallback(
    (updates: Partial<companyDetail>) => {
      try {
        realm.write(() => {
          const comp = realm.objectForPrimaryKey('Company', DEFAULT_COMPANY_ID);
          if (comp) {
            Object.assign(comp, updates);
          }
        });
      } catch (e) {
        console.warn('Failed to update company', e);
      }
    },
    [realm]
  );

  const setCompanyData = useCallback(
    (data: companyDetail) => {
      try {
        realm.write(() => {
          realm.delete(
            realm.objectForPrimaryKey('Company', DEFAULT_COMPANY_ID)
          );
          realm.create('Company', {
            ...data,
            _id: DEFAULT_COMPANY_ID,
          });
        });
      } catch (e) {
        console.warn('Failed to set company', e);
      }
    },
    [realm]
  );

  // Order operations
  const addOrder = useCallback(
    (orderData: Omit<Order, '_id' | 'createdAt'>) => {
      try {
        realm.write(() => {
          realm.create('Order', {
            ...orderData,
            _id: generateId(),
            createdAt: new Date().toISOString(),
          });
        });
      } catch (e) {
        console.warn('Failed to add order', e);
      }
    },
    [realm]
  );

  const updateOrder = useCallback(
    (order: Order) => {
      try {
        realm.write(() => {
          const existing = realm.objectForPrimaryKey('Order', order._id);
          if (existing) {
            Object.assign(existing, order);
          }
        });
      } catch (e) {
        console.warn('Failed to update order', e);
      }
    },
    [realm]
  );

  const toggleOrderStatus = useCallback(
    (id: string, statusKey: keyof OrderStatus) => {
      try {
        realm.write(() => {
          const order = realm.objectForPrimaryKey('Order', id) as any;
          if (order) {
            order.status[statusKey] = !order.status[statusKey];
            const now = new Date().toISOString();
            order.timeline.push({
              status: statusKey,
              timestamp: now,
            });
          }
        });
      } catch (e) {
        console.warn('Failed to toggle order status', e);
      }
    },
    [realm]
  );

  const addTimeline = useCallback(
    (id: string, status: keyof OrderStatus) => {
      try {
        realm.write(() => {
          const order = realm.objectForPrimaryKey('Order', id) as any;
          if (order) {
            order.timeline.push({
              status,
              timestamp: new Date().toISOString(),
            });
          }
        });
      } catch (e) {
        console.warn('Failed to add timeline', e);
      }
    },
    [realm]
  );

  const removeOrder = useCallback(
    (id: string) => {
      try {
        realm.write(() => {
          const order = realm.objectForPrimaryKey('Order', id);
          if (order) {
            realm.delete(order);
          }
        });
      } catch (e) {
        console.warn('Failed to remove order', e);
      }
    },
    [realm]
  );

  const setOrders = useCallback(
    (newOrders: Order[]) => {
      try {
        realm.write(() => {
          // Delete all existing orders
          const all = realm.objects('Order');
          realm.delete(all);
          // Add new orders
          newOrders.forEach((order) => {
            realm.create('Order', order);
          });
        });
      } catch (e) {
        console.warn('Failed to set orders', e);
      }
    },
    [realm]
  );

  return {
    company,
    orders: Array.from(orders),
    initializeDefaultCompany,
    updateCompany,
    setCompanyData,
    addOrder,
    updateOrder,
    toggleOrderStatus,
    addTimeline,
    removeOrder,
    setOrders,
  };
};

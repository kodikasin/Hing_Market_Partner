import { useCallback } from 'react';
import { useRealm, useQuery } from '@realm/react';
import { Order } from '../realmSchemas';
import { generateId } from '../utils/idGenerator';

export const useOrderStore = () => {
  const realm = useRealm();
  const orders = useQuery<Order>('Order');

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
    orders: Array.from(orders),
    addOrder,
    updateOrder,
    removeOrder,
    setOrders,
  };
};

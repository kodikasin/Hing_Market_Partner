import { useCallback } from 'react';
import { useRealm } from '@realm/react';
import { OrderStatus } from '../realmSchemas';

export const useOrderStatusStore = () => {
  const realm = useRealm();

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

  return {
    toggleOrderStatus,
    addTimeline,
  };
};

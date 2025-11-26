import { useCompanyStore } from './hooks/useCompanyStore';
import { useOrderStore } from './hooks/useOrderStore';
import { useOrderStatusStore } from './hooks/useOrderStatusStore';

/**
 * Combined hook that provides all Realm store functionality
 * For better code organization, you can import individual hooks:
 * - useCompanyStore() - for company management
 * - useOrderStore() - for order CRUD operations
 * - useOrderStatusStore() - for order status updates
 */
export const useRealmStore = () => {
  const company = useCompanyStore();
  const orders = useOrderStore();
  const orderStatus = useOrderStatusStore();

  return {
    // Company store
    company: company.company,
    initializeDefaultCompany: company.initializeDefaultCompany,
    updateCompany: company.updateCompany,
    setCompanyData: company.setCompanyData,

    // Order store
    orders: orders.orders,
    addOrder: orders.addOrder,
    updateOrder: orders.updateOrder,
    removeOrder: orders.removeOrder,
    setOrders: orders.setOrders,

    // Order status store
    toggleOrderStatus: orderStatus.toggleOrderStatus,
    addTimeline: orderStatus.addTimeline,
  };
};

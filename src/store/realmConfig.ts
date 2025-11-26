import {
  CompanySchema,
  OrderSchema,
  OrderItemSchema,
  OrderStatusSchema,
  TimelineItemSchema,
} from './realmSchemas';

export const realmSchemas = [
  CompanySchema,
  OrderItemSchema,
  OrderStatusSchema,
  TimelineItemSchema,
  OrderSchema,
];

export const createRealmProvider = () => {
  return {
    schemas: realmSchemas,
  };
};

import { ObjectSchema } from 'realm';

export type address = {
  street?: string;
  city?: string;
  pincode?: number;
  state?: string;
  country?: string;
};

export type companyDetail = {
  _id: string;
  companyName: string;
  address?: address;
  mobileNo: string;
  gstNo: string;
  email: string;
};

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  rate: number;
  baseTotal?: number;
  tax?: number;
  total?: number;
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
  _id: string;
  customerName: string;
  phone?: string;
  address?: string;
  items: OrderItem[];
  taxes?: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  timeline: TimelineItem[];
  createdAt: string;
};

export const CompanySchema: ObjectSchema = {
  name: 'Company',
  primaryKey: '_id',
  properties: {
    _id: 'string',
    companyName: 'string',
    address: 'string?', // JSON stringified
    mobileNo: 'string',
    gstNo: 'string',
    email: 'string',
  },
};

export const OrderItemSchema: ObjectSchema = {
  name: 'OrderItem',
  embedded: true,
  properties: {
    id: 'string',
    name: 'string',
    quantity: 'double',
    unit: 'string?',
    rate: 'double',
    baseTotal: 'double?',
    tax: 'double?',
    total: 'double?',
  },
};

export const OrderStatusSchema: ObjectSchema = {
  name: 'OrderStatus',
  embedded: true,
  properties: {
    received: 'bool',
    couriered: 'bool',
    delivered: 'bool',
    paid: 'bool',
  },
};

export const TimelineItemSchema: ObjectSchema = {
  name: 'TimelineItem',
  embedded: true,
  properties: {
    status: 'string',
    timestamp: 'string',
  },
};

export const OrderSchema: ObjectSchema = {
  name: 'Order',
  primaryKey: '_id',
  properties: {
    _id: 'string',
    customerName: 'string',
    phone: 'string?',
    address: 'string?',
    items: 'OrderItem[]',
    taxes: 'double?',
    discount: 'double',
    totalAmount: 'double',
    notes: 'string?',
    status: 'OrderStatus',
    timeline: 'TimelineItem[]',
    createdAt: 'string',
  },
};

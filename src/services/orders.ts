import type {
  Order,
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderQuery,
} from '../schemas/order.js';

import { nanoid } from 'nanoid';
import { orders, getNextOrderNumber } from '../data/orders.js';
import { products } from '../data/products.js';
import { addressService } from './addresses.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { paginate, type PaginatedResult } from '../utils/paginate.js';

export const orderService = {
  getAllByUser: (userId: string, { page, limit, status }: OrderQuery): PaginatedResult<Order> => {
    let filtered = orders.filter((o) => o.userId === userId);
    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }
    return paginate(filtered, { page, limit });
  },

  getAll: ({ page, limit, status }: OrderQuery): PaginatedResult<Order> => {
    let filtered = [...orders];
    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }
    return paginate(filtered, { page, limit });
  },

  getById: (id: string): Order | null => {
    return orders.find((o) => o.id === id) ?? null;
  },

  create: (userId: string, data: CreateOrderInput): Order => {
    const address = addressService.getById(data.addressId, userId);
    if (!address) throw new NotFoundError('Address');

    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new BadRequestError(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new BadRequestError(`Insufficient stock for ${product.name}`);
      }
      return {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    data.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      product.stock -= item.quantity;
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order: Order = {
      id: nanoid(),
      orderNumber: getNextOrderNumber(),
      userId,
      addressId: data.addressId,
      items: orderItems,
      total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orders.push(order);
    return order;
  },

  updateStatus: (id: string, data: UpdateOrderStatusInput): Order | null => {
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    const validTransitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(data.status)) {
      throw new BadRequestError(`Cannot change status from ${order.status} to ${data.status}`);
    }

    if (data.status === 'cancelled') {
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) product.stock += item.quantity;
      });
    }

    order.status = data.status;
    order.updatedAt = new Date();
    return order;
  },

  cancel: (id: string, userId: string): Order | null => {
    const order = orders.find((o) => o.id === id && o.userId === userId);
    if (!order) return null;

    if (order.status !== 'pending') {
      throw new BadRequestError('Only pending orders can be cancelled');
    }

    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) product.stock += item.quantity;
    });

    order.status = 'cancelled';
    order.updatedAt = new Date();
    return order;
  },
};

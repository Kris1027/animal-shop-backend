import type { Order, CreateOrderInput, UpdateOrderStatusInput } from '../schemas/order.js';

import { nanoid } from 'nanoid';
import { orders, getNextOrderNumber } from '../data/orders.js';
import { products } from '../data/products.js';
import { addressService } from './addresses.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const orderService = {
  getAllByUser: (userId: string): Order[] => {
    return orders.filter((o) => o.userId === userId);
  },

  getAll: (): Order[] => {
    return [...orders];
  },

  getById: (id: string, userId: string, isAdmin: boolean): Order => {
    const order = orders.find((o) => o.id === id);
    if (!order) throw new NotFoundError('Order');
    if (!isAdmin && order.userId !== userId) throw new NotFoundError('Order');
    return order;
  },

  create: (userId: string, data: CreateOrderInput): Order => {
    addressService.getById(data.addressId, userId);

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

  updateStatus: (id: string, data: UpdateOrderStatusInput): Order => {
    const order = orders.find((o) => o.id === id);
    if (!order) throw new NotFoundError('Order');

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

  cancel: (id: string, userId: string): Order => {
    const order = orders.find((o) => o.id === id && o.userId === userId);
    if (!order) throw new NotFoundError('Order');

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

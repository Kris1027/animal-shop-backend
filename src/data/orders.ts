import type { Order } from '../schemas/order.js';

export const orders: Order[] = [];

let orderNumberCounter = 1000;
export const getNextOrderNumber = (): number => ++orderNumberCounter;

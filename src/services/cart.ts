import type { Cart, AddToCartInput, CartResponse, CartItemWithProduct } from '../schemas/cart.js';

import { nanoid } from 'nanoid';
import { carts } from '../data/carts.js';
import { products } from '../data/products.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const findCartByUserId = (userId: string): Cart | undefined => {
  return carts.find((cart) => cart.userId === userId);
};

const findProductById = (productId: string) => {
  return products.find((p) => p.id === productId);
};

const enrichCart = (cart: Cart): CartResponse => {
  const enrichedItems: CartItemWithProduct[] = [];
  let total = 0;
  let itemCount = 0;

  for (const item of cart.items) {
    const product = findProductById(item.productId);
    if (product) {
      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      itemCount += item.quantity;

      enrichedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
        },
        lineTotal,
      });
    }
  }

  return {
    id: cart.id,
    items: enrichedItems,
    itemCount,
    total,
  };
};

export const cartService = {
  get: (userId: string): CartResponse => {
    const cart = findCartByUserId(userId);

    if (!cart) {
      return {
        id: '',
        items: [],
        itemCount: 0,
        total: 0,
      };
    }

    return enrichCart(cart);
  },

  addItem: (userId: string, data: AddToCartInput): CartResponse => {
    const product = findProductById(data.productId);
    if (!product) throw new NotFoundError('Product');

    let cart = findCartByUserId(userId);

    if (!cart) {
      cart = {
        id: nanoid(),
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      carts.push(cart);
    }

    const existingItem = cart.items.find((item) => item.productId === data.productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + data.quantity;

    if (newQuantity > product.stock) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${product.stock}, In cart: ${currentQuantity}, Requested: ${data.quantity}`
      );
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        productId: data.productId,
        quantity: data.quantity,
        addedAt: new Date(),
      });
    }

    cart.updatedAt = new Date();
    return enrichCart(cart);
  },

  updateItem: (userId: string, productId: string, quantity: number): CartResponse => {
    const cart = findCartByUserId(userId);
    if (!cart) throw new NotFoundError('Cart');

    const item = cart.items.find((item) => item.productId === productId);
    if (!item) throw new NotFoundError('Cart item');

    const product = findProductById(productId);
    if (!product) throw new NotFoundError('Product');

    if (quantity > product.stock) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
      );
    }

    item.quantity = quantity;
    cart.updatedAt = new Date();
    return enrichCart(cart);
  },

  removeItem: (userId: string, productId: string): CartResponse => {
    const cart = findCartByUserId(userId);
    if (!cart) throw new NotFoundError('Cart');

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);
    if (itemIndex === -1) throw new NotFoundError('Cart item');

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = new Date();
    return enrichCart(cart);
  },

  clear: (userId: string): { message: string } => {
    const cartIndex = carts.findIndex((cart) => cart.userId === userId);

    if (cartIndex !== -1) {
      carts.splice(cartIndex, 1);
    }

    return { message: 'Cart cleared' };
  },
};

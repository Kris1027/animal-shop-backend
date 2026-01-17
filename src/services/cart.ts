import type { Cart, AddToCartInput, CartResponse, CartItemWithProduct } from '../schemas/cart.js';
import type { Order } from '../schemas/order.js';

import { nanoid } from 'nanoid';
import { carts } from '../data/carts.js';
import { products } from '../data/products.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { addressService } from './addresses.js';
import { getNextOrderNumber, orders } from '../data/orders.js';

const findProductById = (productId: string) => {
  return products.find((p) => p.id === productId);
};

const findCart = (userId?: string, guestId?: string): Cart | undefined => {
  if (userId) {
    return carts.find((cart) => cart.userId === userId);
  }
  if (guestId) {
    return carts.find((cart) => cart.guestId === guestId);
  }
  return undefined;
};

const validateCartStock = (cart: Cart): void => {
  cart.items = cart.items.filter((item) => {
    const product = findProductById(item.productId);
    if (!product) {
      return false;
    }
    if (item.quantity > product.stock) {
      item.quantity = product.stock;
    }
    return item.quantity > 0;
  });
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

  let shippingAddress;
  if (cart.shippingAddressId && cart.userId) {
    try {
      const address = addressService.getById(cart.shippingAddressId, cart.userId);
      shippingAddress = {
        firstName: address.firstName,
        lastName: address.lastName,
        address1: address.address1,
        address2: address.address2 ?? undefined,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };
    } catch {
      // Address no longer exists, ignore
    }
  }

  return {
    id: cart.id,
    items: enrichedItems,
    itemCount,
    total,
    shippingAddressId: cart.shippingAddressId ?? undefined,
    shippingAddress,
  };
};

export const cartService = {
  get: (userId?: string, guestId?: string): CartResponse => {
    const cart = findCart(userId, guestId);

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

  addItem: (userId?: string, guestId?: string, data?: AddToCartInput): CartResponse => {
    if (!data) throw new BadRequestError('Data is required');
    if (!userId && !guestId) throw new BadRequestError('User ID or Guest ID is required');

    const product = findProductById(data.productId);
    if (!product) throw new NotFoundError('Product');

    let cart = findCart(userId, guestId);

    if (!cart) {
      cart = {
        id: nanoid(),
        userId: userId ?? null,
        guestId: guestId ?? null,
        shippingAddressId: null,
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

  updateItem: (
    userId?: string,
    guestId?: string,
    productId?: string,
    quantity?: number
  ): CartResponse => {
    if (!productId || quantity === undefined)
      throw new BadRequestError('Product ID and quantity are required');
    if (!userId && !guestId) throw new BadRequestError('User ID or Guest ID is required');

    const cart = findCart(userId, guestId);
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

  removeItem: (userId?: string, guestId?: string, productId?: string): CartResponse => {
    if (!productId) throw new BadRequestError('Product ID is required');
    if (!userId && !guestId) throw new BadRequestError('User ID or Guest ID is required');

    const cart = findCart(userId, guestId);
    if (!cart) throw new NotFoundError('Cart');

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);
    if (itemIndex === -1) throw new NotFoundError('Cart item');

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = new Date();
    return enrichCart(cart);
  },

  clear: (userId?: string, guestId?: string): { message: string } => {
    if (!userId && !guestId) throw new BadRequestError('User ID or Guest ID is required');

    const cartIndex = carts.findIndex(
      (cart) => (userId && cart.userId === userId) || (guestId && cart.guestId === guestId)
    );

    if (cartIndex !== -1) {
      carts.splice(cartIndex, 1);
    }

    return { message: 'Cart cleared' };
  },

  setShippingAddress: (userId: string, guestId?: string, addressId?: string): CartResponse => {
    if (!addressId) throw new BadRequestError('Address ID is required');
    if (!userId) throw new BadRequestError('Authentication required to set shipping address');

    // Verify address exists and belongs to user
    addressService.getById(addressId, userId);

    let cart = findCart(userId, guestId);

    if (!cart) {
      cart = {
        id: nanoid(),
        userId,
        guestId: guestId ?? null,
        shippingAddressId: null,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      carts.push(cart);
    }

    cart.shippingAddressId = addressId;
    cart.updatedAt = new Date();

    return enrichCart(cart);
  },

  checkout: (userId: string, addressId?: string): Order => {
    const cart = findCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Use provided addressId or fall back to cart's shipping address
    const finalAddressId = addressId ?? cart.shippingAddressId;
    if (!finalAddressId) {
      throw new BadRequestError(
        'Shipping address is required. Set it on cart or provide addressId.'
      );
    }

    addressService.getById(finalAddressId, userId);

    const orderItems = cart.items.map((item) => {
      const product = findProductById(item.productId);
      if (!product) {
        throw new BadRequestError(`Product ${item.productId} no longer exists`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }
      return {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    cart.items.forEach((item) => {
      const product = findProductById(item.productId)!;
      product.stock -= item.quantity;
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order: Order = {
      id: nanoid(),
      orderNumber: getNextOrderNumber(),
      userId,
      addressId: finalAddressId,
      items: orderItems,
      total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orders.push(order);

    const cartIndex = carts.findIndex((c) => c.userId === userId);
    if (cartIndex !== -1) {
      carts.splice(cartIndex, 1);
    }

    return order;
  },

  mergeCarts: (userId: string, guestId: string): CartResponse => {
    const userCart = carts.find((c) => c.userId === userId);
    const guestCart = carts.find((c) => c.guestId === guestId);

    if (!guestCart) {
      return userCart ? enrichCart(userCart) : { id: '', items: [], itemCount: 0, total: 0 };
    }

    if (!userCart) {
      guestCart.userId = userId;
      guestCart.guestId = null;
      guestCart.updatedAt = new Date();
      validateCartStock(guestCart);
      return enrichCart(guestCart);
    }

    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find((i) => i.productId === guestItem.productId);
      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    }

    const guestIndex = carts.findIndex((c) => c.guestId === guestId);
    if (guestIndex !== -1) carts.splice(guestIndex, 1);

    validateCartStock(userCart);
    userCart.updatedAt = new Date();
    return enrichCart(userCart);
  },
};

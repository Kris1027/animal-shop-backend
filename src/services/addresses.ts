import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
  AddressQuery,
} from '../schemas/address.js';

import { nanoid } from 'nanoid';
import { addresses } from '../data/addresses.js';
import { paginate, type PaginatedResult } from '../utils/paginate.js';

const clearUserDefaults = (userId: string): void => {
  addresses.forEach((a) => {
    if (a.userId === userId) a.isDefault = false;
  });
};

export const addressService = {
  getAllByUser: (userId: string, { page, limit }: AddressQuery): PaginatedResult<Address> => {
    const userAddresses = addresses.filter((a) => a.userId === userId);
    return paginate(userAddresses, { page, limit });
  },

  getById: (id: string, userId: string): Address | null => {
    return addresses.find((a) => a.id === id && a.userId === userId) ?? null;
  },

  create: (userId: string, data: CreateAddressInput): Address => {
    const userAddresses = addresses.filter((a) => a.userId === userId);

    if (data.isDefault && userAddresses.length > 0) {
      clearUserDefaults(userId);
    }

    const isDefault = userAddresses.length === 0 ? true : (data.isDefault ?? false);

    const address: Address = {
      id: nanoid(),
      userId,
      label: data.label,
      firstName: data.firstName,
      lastName: data.lastName,
      address1: data.address1,
      address2: data.address2 ?? null,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      phone: data.phone ?? null,
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addresses.push(address);
    return address;
  },

  update: (id: string, userId: string, data: UpdateAddressInput): Address | null => {
    const index = addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) return null;

    if (data.isDefault) {
      clearUserDefaults(userId);
    }

    const address = addresses[index]!;
    Object.assign(address, data, { updatedAt: new Date() });

    return address;
  },

  delete: (id: string, userId: string): Address | null => {
    const index = addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) return null;

    const [deleted] = addresses.splice(index, 1);
    return deleted!;
  },

  setDefault: (id: string, userId: string): Address | null => {
    const address = addresses.find((a) => a.id === id && a.userId === userId);
    if (!address) return null;

    addresses.forEach((a) => {
      if (a.userId === userId) a.isDefault = a.id === id;
    });

    address.updatedAt = new Date();
    return address;
  },
};

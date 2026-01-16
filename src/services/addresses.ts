import type { Address, CreateAddressInput, UpdateAddressInput } from '../schemas/address.js';

import { nanoid } from 'nanoid';
import { addresses } from '../data/addresses.js';
import { NotFoundError } from '../utils/errors.js';

export const addressService = {
  getAllByUser: (userId: string): Address[] => {
    return addresses.filter((a) => a.userId === userId);
  },

  getById: (id: string, userId: string): Address => {
    const address = addresses.find((a) => a.id === id && a.userId === userId);
    if (!address) throw new NotFoundError('Address');
    return address;
  },

  create: (userId: string, data: CreateAddressInput): Address => {
    if (data.isDefault) {
      addresses.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const userAddresses = addresses.filter((a) => a.userId === userId);
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

  update: (id: string, userId: string, data: UpdateAddressInput): Address => {
    const index = addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) throw new NotFoundError('Address');

    if (data.isDefault) {
      addresses.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const address = addresses[index]!;
    Object.assign(address, data, { updatedAt: new Date() });

    return address;
  },

  delete: (id: string, userId: string): Address => {
    const index = addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) throw new NotFoundError('Address');

    const [deleted] = addresses.splice(index, 1);
    return deleted!;
  },

  setDefault: (id: string, userId: string): Address => {
    const address = addresses.find((a) => a.id === id && a.userId === userId);
    if (!address) throw new NotFoundError('Address');

    addresses.forEach((a) => {
      if (a.userId === userId) a.isDefault = a.id === id;
    });

    address.updatedAt = new Date();
    return address;
  },
};

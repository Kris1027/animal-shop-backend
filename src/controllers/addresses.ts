import type { Request, Response } from 'express';
import { addressService } from '../services/addresses.js';
import { sendSuccess, sendCreated } from '../utils/success.js';

export const addressController = {
  getAll: (req: Request, res: Response) => {
    const addresses = addressService.getAllByUser(req.user!.userId);
    sendSuccess(res, addresses);
  },

  getById: (req: Request, res: Response) => {
    const address = addressService.getById(req.params.id as string, req.user!.userId);
    sendSuccess(res, address);
  },

  create: (req: Request, res: Response) => {
    const address = addressService.create(req.user!.userId, req.body);
    sendCreated(res, address);
  },

  update: (req: Request, res: Response) => {
    const address = addressService.update(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, address);
  },

  delete: (req: Request, res: Response) => {
    const address = addressService.delete(req.params.id as string, req.user!.userId);
    sendSuccess(res, address);
  },

  setDefault: (req: Request, res: Response) => {
    const address = addressService.setDefault(req.params.id as string, req.user!.userId);
    sendSuccess(res, address);
  },
};

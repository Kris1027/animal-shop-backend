import type { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, status = 200) => {
  res.status(status).json({ success: true, data });
};

export const sendCreated = <T>(res: Response, data: T) => {
  res.status(201).json({ success: true, data });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: { total: number; page: number; limit: number; totalPages: number }
) => {
  res.status(200).json({ success: true, data, meta });
};

export const sendError = (res: Response, message: string, status = 400) => {
  res.status(status).json({ success: false, error: message });
};

export const sendNotFound = (res: Response, message = 'Resource not found') => {
  res.status(404).json({ success: false, error: message });
};

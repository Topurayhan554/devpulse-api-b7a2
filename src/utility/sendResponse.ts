import express from "express";
import type { Response } from "express";
import { error } from "node:console";
// generic
type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
};

const sendResponse = <T>(res: Response, payload: TResponse<T>): void => {
  res.status(payload.statusCode).json({
    success: payload.success,
    message: payload.message,
    ...(payload.data !== undefined && { data: payload.data }),
    ...(payload.errors !== undefined && { errors: payload.errors }),
  });
};

export default sendResponse;

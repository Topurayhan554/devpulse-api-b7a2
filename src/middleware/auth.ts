import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "../config";
import type { UserRole } from "../types";

const auth = (...roles: UserRole[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized! No token provided.",
        });
        return;
      }

      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, config.jwt_secret) as JwtPayload;
      } catch {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized! Invalid or expired token.",
        });
        return;
      }

      if (roles.length && !roles.includes(decoded.role as UserRole)) {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Forbidden! You do not have permission for this action.",
        });
        return;
      }

      req.user = decoded as JwtPayload & {
        id: number;
        name: string;
        role: string;
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;

import type { ITokenPayload } from "../modules/auth/auth.inteface";

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

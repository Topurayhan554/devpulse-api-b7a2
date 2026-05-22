import type { UserRole } from "../../types";

export interface IRegisterBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface ILoginBody {
  email: string;
  password: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface IUserPublic extends Omit<IUser, "password"> {}

export interface ITokenPayload {
  id: number;
  name: string;
  role: UserRole;
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../db";
import config from "../../config";
import type {
  ILoginBody,
  IRegisterBody,
  ITokenPayload,
  IUser,
  IUserPublic,
} from "./auth.inteface";

const registerUserIntoDB = async (
  body: IRegisterBody,
): Promise<IUserPublic> => {
  const { name, email, password, role = "contributor" } = body;

  const existing = await pool.query<IUser>(
    `SELECT id FROM users WHERE email = $1`,
    [email],
  );
  if (existing.rows.length > 0) {
    throw new Error("EMAIL_TAKEN");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query<IUser>(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashedPassword, role],
  );

  const user = result.rows[0];
  if (!user) {
    throw new Error("USER_CREATION_FAILED");
  }

  return user;
};

const loginUser = async (
  body: ILoginBody,
): Promise<{ token: string; user: IUserPublic }> => {
  const { email, password } = body;

  const result = await pool.query<IUser>(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  );

  const user = result.rows[0];
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const payload: ITokenPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwt_secret as string, {
    expiresIn: "7d",
  });

  const { password: _pwd, ...userPublic } = user;

  return { token, user: userPublic };
};

export const authService = {
  registerUserIntoDB,
  loginUser,
};

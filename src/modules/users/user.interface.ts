export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  create_at: Date;
  updated_at: Date;
}

export interface ICreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
}

export type IUserPublic = Omit<IUser, "password">;

export interface IReporter {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

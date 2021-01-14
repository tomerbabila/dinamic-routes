import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
}

export interface IRefreshToken extends Document {
  username: string;
  token: string;
}

export type userType = { username: string; iat: number };

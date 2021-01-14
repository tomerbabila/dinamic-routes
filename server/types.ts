import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
}

export interface IRefreshToken extends Document {
  username: string;
  token: string;
}

declare global {
  namespace Express {
    interface Request {
      decoded: object | undefined;
    }
  }
}

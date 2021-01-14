import { Document } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  username: string;
  password: string;
}

export interface IRefreshToken extends Document {
  username: string;
  token: string;
}

export interface costumeRequest extends Request {
  decoded: object | undefined;
}

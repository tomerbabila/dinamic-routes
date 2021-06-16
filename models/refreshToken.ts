import mongoose, { Schema } from 'mongoose';
import { IRefreshToken } from '../types';

const refreshTokenSchema: Schema = new Schema({
  username: { type: String, required: true },
  token: { type: String, required: true },
});

export default mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
);

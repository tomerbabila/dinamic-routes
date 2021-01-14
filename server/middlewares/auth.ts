import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { costumeRequest } from '../types';

const checkToken = (req: costumeRequest, res: Response, next: NextFunction): void => {
  // Express headers are auto converted to lowercase
  const authHeader: string | undefined = req.headers['authorization'];
  const token: string | undefined = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
      if (err) res.status(403).json('Token is not valid.');
      req.decoded = decoded;
      next();
    });
  } else {
    res.status(401).json('Auth token is not supplied.');
  }
};

module.exports = checkToken;

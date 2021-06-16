import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  // Express headers are auto converted to lowercase
  const authHeader: string | undefined = req.headers['authorization'];
  const token: string | undefined = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
      if (err) return res.status(403).json('Token is not valid.');
      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(401).json('Auth token is not supplied.');
  }
};

export default checkToken;

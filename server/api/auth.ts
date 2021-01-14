import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import RefreshToken from '../models/refreshToken';
import User from '../models/user';
import { userSchema } from '../validations';
import { IUser, IRefreshToken } from '../types';

const router: Router = Router();

const saltRounds: number = 10;

// Register
router.post('/register', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const newUser: IUser = new User({
      username,
      password: bcrypt.hashSync(password, saltRounds),
    });

    const { error } = userSchema.validate(req.body);
    if (error) res.status(400).json({ error: error.message });

    isUserExist(username).then((existUser) =>
      existUser
        ? res.status(409).json('Username already exists.')
        : newUser.save().then((savedUser) => res.json(savedUser))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    isUserExist(username).then((existUser) => {
      if (!existUser) res.status(400).json('Username not exists.');

      bcrypt.compare(password, existUser!.password).then(
        async (match: boolean): Promise<void> => {
          if (!match) res.status(400).json('Wrong password.');

          const accessToken: string = generateAccessToken({ username });
          const refreshToken: string = jwt.sign(
            { username },
            process.env.REFRESH_TOKEN_SECRET!
          );

          const isTokenExist: IRefreshToken | null = await RefreshToken.findOne(
            {
              username,
            }
          );
          if (!isTokenExist) {
            const newRefreshToken: IRefreshToken = new RefreshToken({
              token: refreshToken,
              username,
            });
            await newRefreshToken.save();
          } else {
            await RefreshToken.findOneAndUpdate(
              { username },
              { token: refreshToken }
            );
          }
          res.json({ accessToken, refreshToken });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new token by refresh token
router.post('/token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (token === null) res.status(401).json('Token is required.');

    const refreshToken: IRefreshToken | null = await RefreshToken.findOne({
      token,
    });
    if (!refreshToken) res.status(403).json('Token not exists.');

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (err, decoded) => {
      if (err) res.status(403).json('Token is not valid.');

      const accessToken: string = generateAccessToken({
        username: decoded.username,
      });
      res.json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.delete('/logout', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const deletedToken: IRefreshToken | null = await RefreshToken.findOneAndDelete(
      { token }
    );
    if (!deletedToken) res.status(400).json('Refresh Token is required.');

    res.status(204).json('Token deleted successfully.');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user exists in the DB
const isUserExist = async (username: string): Promise<IUser | undefined> => {
  try {
    const user = await User.findOne({ username });
    return user ? user : undefined;
  } catch (error) {
    return undefined;
  }
};

// Generate access token
const generateAccessToken = (user: object): string => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' });
};

export default router;

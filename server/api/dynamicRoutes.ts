import { Router, Request, Response } from 'express';
import { Method, IRoute } from '../types';

const router: Router = Router();

let mockHandlers: any = {};

// Get information about routes
router.get('/', (req: Request, res: Response) => {
  try {
    res.json(mockHandlers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new route
router.post('/', (req: Request, res: Response) => {
  try {
    const { method, path, response }: IRoute = req.body;
    if (!method || !path || !response) {
      res.status(400).json('Should provide: method, path and response.');
    }

    const newRouteKey = getRouteKey(method, path);
    mockHandlers[newRouteKey] = {
      count: 0,
      method,
      path,
      response,
      middleware: (req: Request, res: Response) => {
        mockHandlers[newRouteKey].count += 1;
        res.status(response.status || 200).json(response.body);
      },
    };
    // Add the new route
    router[method](path, mockHandlers[newRouteKey].middleware);
    res.json(`'${path}' route added.`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getRouteKey = (method: Method, path: string) => `[${method}]${path}`;

export default router;

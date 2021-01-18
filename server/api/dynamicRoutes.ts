import { Router, Request, Response } from 'express';
import { Method, IRoute } from '../types';

const router: Router = Router();

let mockHandlers: any = {};

// Get information about routes
router.get('/', (req: Request, res: Response) => {
  try {
    // Get information about specific route
    const { method: queryMethod, path: queryPath } = req.query;
    if (queryMethod && queryPath) {
      const routeKey = getRouteKey(queryMethod as Method, queryPath as string);
      if (!mockHandlers[routeKey]) {
        return res.status(403).json('Route not found.');
      }

      const { count, method, path, response } = mockHandlers[routeKey];
      return res.json({ count, method, path, response });
    }
    // Get information about all routes
    return res.json(
      Object.keys(mockHandlers).map((routeKey) => {
        const { count, method, path } = mockHandlers[routeKey];
        return { count, method, path };
      })
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Create new route
router.post('/', (req: Request, res: Response) => {
  try {
    const { method, path, response }: IRoute = req.body;
    if (!method || !path || !response) {
      return res.status(400).json('Should provide: method, path and response.');
    }

    const newRouteKey = getRouteKey(method, path);
    mockHandlers[newRouteKey] = {
      count: 0,
      method,
      path,
      response,
      middleware: (req: Request, res: Response) => {
        mockHandlers[newRouteKey].count += 1;
        return res.status(response.status || 200).json(response.body);
      },
    };
    // Add the new route
    router[method](path, mockHandlers[newRouteKey].middleware);
    return res.json(`'${path}' route added.`);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete route
router.delete('/', (req: Request, res: Response) => {
  try {
    const { path, method } = req.body;
    if (!path || !method) {
      return res.status(400).json('Path and method should be provided.');
    }

    // Get all routes in an array
    const routes = router.stack;
    // Check every route and remove the chosen one
    routes.forEach((route: any, i: number) =>
      removeRoute(route, i, routes, method, path)
    );
    return res.json(`'${path}' route removed.`);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const getRouteKey = (method: Method, path: string) => `[${method}]${path}`;

const removeRoute = (route: any, i: number, routes: any, method: Method, path: string) => {
  const routeExist = mockHandlers[getRouteKey(method, path)];
  if (routeExist && routeExist.path === route.path) {
    routes.splice(i, 1);
  }
};

export default router;

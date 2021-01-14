import { Router } from 'express';
import auth from './auth';
import dynamicRoutes from './dynamicRoutes';
import checkToken from '../middleware/auth';

const router: Router = Router();

router.use('/auth', auth);
router.use(checkToken);
router.use('/dynamicRoutes', dynamicRoutes);

export default router;

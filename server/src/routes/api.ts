import { Router } from 'express';
import jetValidator from 'jet-validator';

import Paths from './constants/Paths';
import { rivetExample } from './RivetRoutes';


// **** Variables **** //

const apiRouter = Router(),
  validate = jetValidator();

const router = Router();
router.post('/', rivetExample());
apiRouter.use(Paths.Users.Base, rivetExample());


// **** Export default **** //

export default apiRouter;

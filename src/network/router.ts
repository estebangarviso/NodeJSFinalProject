import httpErrors from 'http-errors';
import { Application, Response, Request, NextFunction } from 'express';

import userRouter from './routes/user';
import paymentRouter from './routes/payment';
import roleRouter from './routes/role';
import response from './routes/response';

const routers = [userRouter, paymentRouter, roleRouter];

const applyRoutes = (app: Application) => {
  routers.forEach((router) => app.use('/api', router));

  // Handling 404 error
  app.use((req, res, next) => {
    next(new httpErrors.NotFound('This route does not exists'));
  });
  // Middleware that handles errors
  app.use((error: TypeError & { status: number }, req: Request, res: Response, next: NextFunction) => {
    console.log('error', error);
    response({
      message: error.message || 'Internal Server Error',
      res,
      status: error.status || 500,
      error: true
    });
    next();
  });
};

export default applyRoutes;

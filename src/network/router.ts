import httpErrors from 'http-errors'
import { Application, Response, Request, NextFunction } from 'express'

import articleRouter from './routes/article'
import userRouter from './routes/user'
import userTransactionRouter from './routes/userTransaction'
import orderRouter from './routes/order'
import currencyRouter from './routes/currency'
import roleRouter from './routes/role'
import healthCheckRouter from './routes/healthcheck'
import response from './routes/response'

const routers = [
  articleRouter,
  userRouter,
  userTransactionRouter,
  orderRouter,
  currencyRouter,
  roleRouter,
  healthCheckRouter
]

const applyRoutes = (app: Application) => {
  routers.forEach(router => app.use('/api', router))

  // Middleware that handles errors
  app.use(
    (error: TypeError & { status: number }, req: Request, res: Response) => {
      console.error(error)
      response({
        message: error?.message || 'Internal Server Error',
        res,
        status: error?.status || new httpErrors.InternalServerError().status,
        error: true
      })
    }
  )
}

export default applyRoutes

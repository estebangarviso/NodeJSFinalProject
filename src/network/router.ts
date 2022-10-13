import httpErrors from 'http-errors'
import { Application, Response, Request, NextFunction } from 'express'

import articleRouter from './routes/article'
import userRouter from './routes/user'
import userTransactionRouter from './routes/userTransaction'
import currencyRouter from './routes/currency'
import roleRouter from './routes/role'
import response from './routes/response'

const routers = [articleRouter, userRouter, userTransactionRouter, currencyRouter, roleRouter]

const applyRoutes = (app: Application) => {
  routers.forEach(router => app.use('/api', router))

  // Handling 404 error
  app.use((req, res, next) => {
    next(new httpErrors.NotFound('This route does not exists'))
  })
  // Middleware that handles errors
  app.use(
    (
      error: TypeError & { status: number },
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      console.error(error)
      response({
        message: error.message || 'Internal Server Error',
        res,
        status: error.status || 500,
        error: true
      })
      next()
    }
  )
}

export default applyRoutes

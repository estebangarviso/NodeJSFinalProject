import { NODE_ENV, PORT } from '../config'
import express, { Express } from 'express'
import morgan from 'morgan'
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http'
import dbConnection from '../database/mongo/connection'
import applyRoutes from './router'
import applySwagger from '../config/swagger'

class Server {
  private _app: Express
  private _mongoConn: ReturnType<typeof dbConnection>
  private _server?: HttpServer<typeof IncomingMessage, typeof ServerResponse>

  constructor() {
    this._app = express()
    this._mongoConn = dbConnection()
    this.config()
  }

  private config() {
    this._app.use(express.json())
    this._app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'))
    this._app.use(express.urlencoded({ extended: false }))
    // Swagger
    if (NODE_ENV === 'development') {
      applySwagger(this._app)
    }
    applyRoutes(this._app)
  }

  async start() {
    try {
      await this._mongoConn.connect()
      this._server = this._app.listen(PORT, () => {
        console.success(
          `Server listening at http://localhost:${PORT} in ${NODE_ENV} mode`
        )
      })
    } catch (error) {
      console.error(error)
    }
  }

  async stop() {
    try {
      console.warn('Server is shutting down...')
      await this._mongoConn.disconnect()
      this._server?.close()
    } catch (error) {
      console.error(error)
    }
  }
}

const server = new Server()

export default server

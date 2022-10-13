import { NODE_ENV, PORT } from '../config'
import express, { Express } from 'express'
import morgan from 'morgan'
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http'
import dbConnection from '../database/mongo/connection'
import applyRoutes from './router'

class Server {
  #app: Express
  #connection: ReturnType<typeof dbConnection>
  #server?: HttpServer<typeof IncomingMessage, typeof ServerResponse>

  constructor() {
    this.#app = express()
    this.#connection = dbConnection()
    this.#config()
  }

  #config() {
    this.#app.use(express.json())
    this.#app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'))
    this.#app.use(express.urlencoded({ extended: false }))
    applyRoutes(this.#app)
  }

  async start() {
    try {
      await this.#connection.connect()
      this.#server = this.#app.listen(PORT, () => {
        console.success(`Server running at port ${PORT}.`)
      })
    } catch (error) {
      console.error(error)
    }
  }

  async stop() {
    try {
      console.warn('Server is shutting down...')
      await this.#connection.disconnect()
      this.#server?.close()
    } catch (error) {
      console.error(error)
    }
  }
}

const server = new Server()

export default server

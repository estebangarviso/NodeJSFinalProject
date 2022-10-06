import config, { PORT } from '../config';
import express, { Application } from 'express';
import morgan from 'morgan';
import { Server as HttpServer } from 'http';
import dbConnection from '../database/mongo/connection';
import applyRoutes from './router';

interface Server {
  app: Application;
  connection: typeof dbConnection;
}

class Server {
  #app;
  #connection;
  #server?: HttpServer;

  constructor() {
    this.#app = express();
    this.#connection = dbConnection();
    this.#config();
  }

  #config() {
    this.#app.use(express.json());
    this.#app.use(morgan('dev'));
    this.#app.use(express.urlencoded({ extended: false }));
    applyRoutes(this.#app);
  }

  async start() {
    try {
      await config.verify;
      await this.#connection.connect();
      this.#server = this.#app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}.`);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async stop() {
    try {
      await this.#connection.disconnect();
      this.#server?.close();
    } catch (error) {
      console.error(error);
    }
  }
}

const server = new Server();

export default server;

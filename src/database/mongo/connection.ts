import { connect, connection } from 'mongoose'
import { MONGO_URI } from '../../config'

const dbConnection = () => {
  connection.on('connected', () => {
    console.success('MongoDB connection established.')
  })
  connection.on('reconnected', () => {
    console.info('MongoDB connection established.')
  })
  connection.on('close', () => {
    console.warn(' MongoDB connection closed.')
  })
  connection.on('error', error => {
    console.error('Mongo connection error:', error)
  })

  const connectionConfig = {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

  return {
    connect: async () => connect(MONGO_URI, connectionConfig),
    disconnect: () => connection.close()
  }
}

export default dbConnection

import mongoose, { type ConnectOptions } from 'mongoose'
import { MONGO_URI } from '../../config'

const dbConnection = () => {
  mongoose.connection.on('connected', () => {
    console.success('MongoDB connection established.')
  })
  mongoose.connection.on('reconnected', () => {
    console.info('MongoDB connection reestablished.')
  })
  mongoose.connection.on('close', () => {
    console.warn('MongoDB connection closed.')
  })
  mongoose.connection.on('error', error => {
    console.error('Mongo connection error:', error)
  })

  return {
    connect: async () => {
      try {
        return await mongoose.connect(MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        } as ConnectOptions)
      } catch (error) {
        console.error(
          'MongoDB connection error. Please make sure MongoDB is running. ' +
            error
        )
      }
    },
    disconnect: () => mongoose.connection.close()
  }
}

export default dbConnection

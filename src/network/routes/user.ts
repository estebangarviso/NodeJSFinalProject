import { Router } from 'express'
import httpErrors from 'http-errors'
import {
  storeUserSchema,
  updateUserSchema,
  userIDSchema,
  userLoginSchema
} from '../../schemas/user'
import validatorCompiler from './utils/validatorCompiler'
import auth from './utils/auth'
import response from './response'
import UserRepository from '../../repositories/user'
import { HydratedDocument } from 'mongoose'
import { IUser } from '../../database/mongo/models/user'
import UserTransactionRepository from '../../repositories/userTransaction'

const UserRouter = Router()

UserRouter.route('/user').get(auth.verifyUser(), async (req, res, next) => {
  try {
    const userRepository = new UserRepository()

    response({
      error: false,
      message: await userRepository.getAllUsers(),
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

UserRouter.route('/user/profile').get(
  auth.verifyUser(),
  async (req, res, next) => {
    try {
      const { currentUser } = req
      if (!currentUser) throw new httpErrors.Unauthorized('Unauthorized')

      const userRepository = new UserRepository({ userId: currentUser.id })
      const profile = (await userRepository.getUserByID()).toObject()

      response({
        error: false,
        message: profile,
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/user/balance').get(
  auth.verifyUser(),
  async (req, res, next) => {
    try {
      const { currentUser } = req
      if (!currentUser) throw new httpErrors.Unauthorized('Unauthorized')

      const userTransactionRepository = new UserTransactionRepository({
        userId: currentUser.id
      })

      const balance =
        await userTransactionRepository.getUserTransactionsBalance()

      response({
        error: false,
        message: balance.toString(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/user/signup').post(
  validatorCompiler(storeUserSchema, 'body'),
  async (req, res, next) => {
    try {
      /* eslint-disable */
      const {
        body: { firstName, lastName, email, password, roleId }
      } = req

      response({
        error: false,
        message: await new UserRepository({
          firstName,
          lastName,
          email,
          password,
          roleId
        }).saveUser(),
        res,
        status: 201
      })
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/user/login').post(
  validatorCompiler(userLoginSchema, 'body'),
  auth.generateTokens(),
  async (req, res, next) => {
    try {
      const {
        accessToken,
        refreshToken,
        body: { email, password }
      } = req
      const isLoginCorrect = await new UserRepository({
        email,
        password
      }).login()

      if (isLoginCorrect)
        return response({
          error: false,
          message: {
            accessToken,
            refreshToken
          },
          res,
          status: 200
        })

      throw new httpErrors.Unauthorized('You are not registered')
    } catch (error) {
      next(error)
    }
  }
)

UserRouter.route('/user/:id')
  .get(
    validatorCompiler(userIDSchema, 'params'),
    auth.verifyIsCurrentUser(),
    async (req, res, next) => {
      try {
        const {
          params: { id: userId }
        } = req
        const userRepository = new UserRepository({ userId })

        response({
          error: false,
          message: await userRepository.getUserByID(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .delete(
    validatorCompiler(userIDSchema, 'params'),
    auth.verifyIsCurrentUser(),
    async (req, res, next) => {
      try {
        const {
          params: { id }
        } = req
        const userRepository = new UserRepository({ userId: id })

        response({
          error: false,
          message: await userRepository.removeUserByID(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .patch(
    validatorCompiler(userIDSchema, 'params'),
    validatorCompiler(updateUserSchema, 'body'),
    auth.verifyIsCurrentUser(),
    async (req, res, next) => {
      const {
        body: { firstName, lastName, email, password },
        params: { id: userId }
      } = req

      try {
        response({
          error: false,
          message: (await new UserRepository({
            userId,
            firstName,
            lastName,
            email,
            password
          }).updateOneUser()) as HydratedDocument<IUser>,
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )

UserRouter.route('/user/refreshAccessToken/:id').get(
  validatorCompiler(userIDSchema, 'params'),
  auth.verifyIsCurrentUser(),
  auth.refreshAccessToken(),
  async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = req

      response({
        error: false,
        message: {
          accessToken,
          refreshToken
        },
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

export default UserRouter

import { Router } from 'express'
import httpErrors from 'http-errors'
import UserTransactionService from '../../services/userTransaction'
import auth from './utils/auth'
import {
  storeUserTransactionSchema,
  userTransactionIDSchema,
  userTransactionSecureTokenSchema,
  realUserTransactionIDSchema
} from '../../schemas/userTransaction'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'
import { userIDSchema } from '../../schemas/user'

const TransactionRouter = Router()

const NOT_ALLOWED_TO_BE_HERE = 'You are not allowed here!'

TransactionRouter.route('/transfer/user/:id')
  .get(
    validatorCompiler(userIDSchema, 'params'),
    auth.verifyIsCurrentUser(),
    async (req, res, next) => {
      try {
        const {
          currentUser,
          params: { id: userId }
        } = req
        if (!currentUser)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
        if (currentUser.id !== userId)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

        const userTransactionService = new UserTransactionService({ userId })

        response({
          error: false,
          message: await userTransactionService.getAllUserTransactions(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .post(
    validatorCompiler(storeUserTransactionSchema, 'body'),
    validatorCompiler(userIDSchema, 'params'),
    auth.verifyIsCurrentUser(),
    async (req, res, next) => {
      try {
        /* eslint-disable */
        const {
          currentUser,
          body: { receiverId, amount },
          params: { id: userId }
        } = req
        if (!currentUser)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
        if (currentUser.id !== userId)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

        const userTransactionService = new UserTransactionService({
          userId,
          receiverId,
          amount
        })

        response({
          error: false,
          message: await userTransactionService.saveUserTransaction(),
          res,
          status: 201
        })
      } catch (error) {
        next(error)
      }
    }
  )

TransactionRouter.route('/transfer/:transferId/user/:id').get(
  validatorCompiler(userTransactionIDSchema, 'params'),
  auth.verifyUser(),
  async (req, res, next) => {
    try {
      const {
        currentUser,
        params: { id: userId, transferId }
      } = req

      if (!currentUser)
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
      const userTransactionService = new UserTransactionService({
        transferId
      })
      const userTransaction =
        await userTransactionService.getUserTransactionByID()

      await userTransaction.populate('userId')
      await userTransaction.populate('receiverId')
      if (
        currentUser.id !== userId ||
        currentUser.id !== String(userTransaction.userId.id) ||
        currentUser.id !== String(userTransaction.receiverId.id)
      )
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

      userTransaction.depopulate('userId')
      userTransaction.depopulate('receiverId')

      response({
        error: false,
        message: userTransaction,
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

TransactionRouter.route('/transfer/owner/:id').get(
  validatorCompiler(userIDSchema, 'params'),
  auth.verifyUser(),
  async (req, res, next) => {
    try {
      const {
        currentUser,
        params: { id: receiverId }
      } = req
      if (!currentUser)
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
      if (currentUser.id !== receiverId)
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

      const userTransactionService = new UserTransactionService({ receiverId })
      const userTransactions =
        await userTransactionService.getAllUserTransactionsByReceiverId()

      response({
        error: false,
        message: userTransactions,
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

TransactionRouter.route('/transfer/verify/:secureToken').patch(
  validatorCompiler(userTransactionSecureTokenSchema, 'params'),
  validatorCompiler(realUserTransactionIDSchema, 'body'),
  auth.verifyByRole('salesman'),
  async (req, res, next) => {
    try {
      const {
        currentUser,
        body: { _id },
        params: { secureToken }
      } = req
      if (!currentUser)
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

      const userTransactionService = new UserTransactionService({
        secureToken,
        _id,
        receiverId: currentUser.id
      })
      const verifiedTransaction =
        await userTransactionService.verifyUserTransaction()

      response({
        error: false,
        message: verifiedTransaction,
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  }
)

export default TransactionRouter

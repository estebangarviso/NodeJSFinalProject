import { Router } from 'express'
import httpErrors from 'http-errors'
import UserTransactionService from '../../services/userTransaction'
import auth from './utils/auth'
import {
  storeUserTransactionSchema,
  userTransactionIDSchema,
  userTransactionStatusSchema
} from '../../schemas/userTransaction'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'
import { userIDSchema } from '../../schemas/user'
import { TRANSACTION_STATUS } from '../../utils/userTransaction'

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
        const {
          currentUser,
          body: { givenTo, amount },
          params: { id: userId }
        } = req
        if (!currentUser)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
        if (currentUser.id !== userId)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

        const userTransactionService = new UserTransactionService({
          userId,
          givenTo,
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
      await userTransaction.populate('givenTo')
      console.debug('Debugging', {
        userTransaction,
        currentUser,
        userTransactionIdAsString: String(userTransaction.userId.id),
        currentUserIdAsString: currentUser.id,
        userId
      })
      if (
        currentUser.id !== userId ||
        currentUser.id !== String(userTransaction.userId.id) ||
        currentUser.id !== String(userTransaction.givenTo.id)
      )
        throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

      userTransaction.depopulate('userId')
      userTransaction.depopulate('givenTo')

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

TransactionRouter.route('/transfer/owner/:id')
  .get(
    validatorCompiler(userIDSchema, 'params'),
    auth.verifyUser(),
    async (req, res, next) => {
      try {
        const {
          currentUser,
          params: { id: givenTo }
        } = req
        if (!currentUser)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
        if (currentUser.id !== givenTo)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

        const userTransactionService = new UserTransactionService({ givenTo })
        const userTransactions =
          await userTransactionService.getAllUserTransactionsByGivenTo()

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
  .get(
    validatorCompiler(userTransactionIDSchema, 'body'),
    validatorCompiler(userTransactionStatusSchema, 'body'),
    auth.verifyUser(),
    async (req, res, next) => {
      try {
        const {
          currentUser,
          params: { id: givenTo },
          body: { transferId, status }
        } = req
        if (!currentUser)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
        if (currentUser.id !== givenTo)
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

        const userTransactionService = new UserTransactionService({
          transferId
        })
        const userTransaction =
          await userTransactionService.getUserTransactionByID()

        await userTransaction.populate('givenTo')

        if (currentUser.id !== String(userTransaction.givenTo.id))
          throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)

        userTransaction.depopulate('givenTo')

        if (TRANSACTION_STATUS.includes(status)) {
          userTransaction.status = status

          response({
            error: false,
            message: userTransaction,
            res,
            status: 200
          })
        } else {
          throw new httpErrors.BadRequest('Invalid status')
        }
      } catch (error) {
        next(error)
      }
    }
  )

export default TransactionRouter

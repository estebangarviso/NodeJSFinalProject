import { Router } from 'express'
import httpErrors from 'http-errors'
import OrderService from '../../services/order'
import auth from './utils/auth'
import {
  storeOrderSchema,
  orderTrackingNumberSchema,
  updateOrderSchema
} from '../../schemas/order'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'

const TransactionRouter = Router()

const NOT_ALLOWED_TO_BE_HERE = 'You are not allowed here!'

TransactionRouter.route('/order').post(
  validatorCompiler(storeOrderSchema, 'body'),
  auth.verifyIsCurrentUser,
  async (req, res, next) => {
    /* eslint-disable */
    const {
      currentUser,
      body: { details, total, status }
    } = req
    if (!currentUser) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
    const { id: userId } = currentUser

    try {
      const orderService = new OrderService({
        userId,
        details,
        total,
        status
      })

      response({
        error: false,
        message: await orderService.saveOrder(),
        res,
        status: 201
      })
    } catch (error) {
      next(error)
    }
  }
)

TransactionRouter.route('/order/:trackingNumber')
  .get(
    validatorCompiler(orderTrackingNumberSchema, 'params'),
    auth.verifyIsCurrentUser,
    async (req, res, next) => {
      const {
        params: { trackingNumber }
      } = req

      try {
        const orderService = new OrderService({
          trackingNumber
        })

        response({
          error: false,
          message: await orderService.getOneOrder(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .patch(
    validatorCompiler(orderTrackingNumberSchema, 'params'),
    validatorCompiler(updateOrderSchema, 'body'),
    auth.verifyIsCurrentUser,
    async (req, res, next) => {
      const {
        params: { trackingNumber },
        body: { details, total, status }
      } = req

      try {
        const orderService = new OrderService({
          trackingNumber,
          details,
          total,
          status
        })

        response({
          error: false,
          message: await orderService.updateOneOrder(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )

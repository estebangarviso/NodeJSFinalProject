import { Router } from 'express'
import httpErrors from 'http-errors'
import OrderRepository from '../../repositories/order'
import auth from './utils/auth'
import {
  storeOrderSchema,
  orderTrackingNumberSchema,
  updateOrderSchema
} from '../../schemas/order'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'

const OrderRouter = Router()

const NOT_ALLOWED_TO_BE_HERE = 'You are not allowed here!'

OrderRouter.route('/order').post(
  validatorCompiler(storeOrderSchema, 'body'),
  auth.verifyUser(),
  async (req, res, next) => {
    /* eslint-disable */
    const {
      currentUser,
      body: { details, receiverId }
    } = req
    if (!currentUser) throw new httpErrors.Unauthorized(NOT_ALLOWED_TO_BE_HERE)
    const { id: userId } = currentUser

    try {
      const orderRepository = new OrderRepository({
        userId,
        receiverId,
        details
      })

      response({
        error: false,
        message: await orderRepository.saveOrder(),
        res,
        status: 201
      })
    } catch (error) {
      next(error)
    }
  }
)

OrderRouter.route('/order/:trackingNumber')
  .get(
    validatorCompiler(orderTrackingNumberSchema, 'params'),
    auth.verifyIsCurrentUser,
    async (req, res, next) => {
      const {
        params: { trackingNumber }
      } = req

      try {
        const orderRepository = new OrderRepository({
          trackingNumber
        })

        response({
          error: false,
          message: await orderRepository.getOneOrder(),
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
        const orderRepository = new OrderRepository({
          trackingNumber,
          details,
          total,
          status
        })

        response({
          error: false,
          message: await orderRepository.updateOneOrder(),
          res,
          status: 200
        })
      } catch (error) {
        next(error)
      }
    }
  )

export default OrderRouter

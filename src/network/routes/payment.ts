import { Router } from 'express';
import PaymentService from '../../services/payment';

import response from './response';
const PaymentRouter = Router();
/**
 * Endpoint to create a payment for an user, it represents a payment made by an user to another user that is a seller
 */
PaymentRouter.route('/payment/:paidTo').post(async (req, res, next) => {
  const {
    body: { amount },
    params: { paidTo }
  } = req;
  // TODO: Validate payment if it is free or not
  if (!amount) {
    response({
      error: true,
      message: 'Amount is required',
      res,
      status: 400
    });
  }
  // Check if the user that is paying is the same as the user that is being paid
  if (paidTo === req.user.id) {
    response({
      error: true,
      message: 'You cannot pay yourself',
      res,
      status: 400
    });
  }
  // Check if the user is paying to a seller

  const paymentService = new PaymentService({ amount, paidTo });

  try {
    const result = await paymentService.createPayment();

    response({
      error: false,
      message: result,
      res,
      status: 201
    });
  } catch (error) {
    next(error);
  }
});

PaymentRouter.route('/payment/:id').get(async (req, res, next) => {
  const {
    params: { id }
  } = req;

  try {
    const paymentService = new PaymentService({ id });
    const payment = await paymentService.getPayment();

    response({
      error: false,
      message: payment,
      res,
      status: 200
    });
  } catch (error) {
    next(error);
  }
});

export default PaymentRouter;

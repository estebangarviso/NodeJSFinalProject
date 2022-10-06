import PaymentModel from '../models/payment';
import { HydratedDocument } from 'mongoose';
import { IPayments } from '../models/payment';
import httpErrors from 'http-errors';

/**
 *
 * @param payment Payment to be saved
 * @returns Saved payment
 */
export const savePayment: (payment: IPayments) => Promise<HydratedDocument<IPayments>> = async (payment) => {
  const savedPayment = new PaymentModel(payment);
  await savedPayment.save();
  return savedPayment;
};

/**
 * @param id Payment id
 * @returns Found payment
 */
export const getOnePayment: (id: string) => Promise<HydratedDocument<IPayments>> = async (id) => {
  const foundPayment = await PaymentModel.findOne({ id }).populate('paidTo');
  if (!foundPayment) throw new httpErrors.NotFound('Payment not found');
  return foundPayment;
};

/**
 * @returns Balance of the an user
 */
export const getBalance: (userId: string) => Promise<number> = async (paidTo) => {
  const payments = await PaymentModel.find({ paidTo });
  const balance = payments.reduce((acc, payment) => {
    if (payment.status === 'paid') {
      return acc + payment.amount;
    }
    return acc;
  }, 0);
  return balance;
};

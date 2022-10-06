import httpErrors from 'http-errors';
import { nanoid } from 'nanoid';
import UserService from './user';
import { savePayment, getOnePayment } from '~/database/mongo/queries/payment';
import { IPayments } from '~/database/mongo/models/payment';

export default class PaymentService {
  #id: string;
  #paidTo: string;
  #amount: number;
  #currency: string;
  #status: string;

  constructor({ id = '', paidTo = '', amount = 0, currency = '', status = '' }) {
    this.#id = id;
    this.#amount = amount;
    this.#paidTo = paidTo;
    this.#currency = currency;
    this.#status = status;
  }

  async createPayment() {
    if (!this.#paidTo) throw new httpErrors.BadRequest('Missing required field: paidTo');
    const userService = new UserService(this.#paidTo as any);
    const foundUser = await userService.verifyUserExists();
    const newPayment = await savePayment({
      id: nanoid(6),
      paidTo: foundUser._id,
      amount: this.#amount,
      currency: this.#currency,
      status: this.#status
    } as unknown as IPayments);
    return newPayment.toObject();
  }

  async getPayment() {
    if (!this.#id) throw new httpErrors.BadRequest('Missing required field: id');
    const foundPayment = await getOnePayment(this.#id);
    if (!foundPayment) throw new httpErrors.NotFound('Payment not found');
    return foundPayment;
  }
}

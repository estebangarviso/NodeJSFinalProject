import httpErrors from 'http-errors'
import { nanoid } from 'nanoid'
import UserService from './user'
import {
  saveUserTransaction,
  getOneUserTransaction,
  getAllUserTransactions,
  getUserTransactions
} from '../database/mongo/queries/userTransaction'
import { getDefaultCurrency } from '../database/mongo/queries/currency'

export default class UserTransactionService {
  #transferId: string
  #userId: string
  #givenTo: string
  #amount: number

  constructor(args?: {
    transferId?: string
    userId?: string
    givenTo?: string
    amount?: number
  }) {
    const {
      transferId = '',
      userId = '',
      givenTo = '',
      amount = 0
    } = args || {}
    if (amount < 0) throw new httpErrors.BadRequest('Amount cannot be negative')
    this.#transferId = transferId
    this.#userId = userId
    this.#amount = amount
    this.#givenTo = givenTo
  }

  async saveUserTransaction() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    if (!this.#givenTo)
      throw new httpErrors.BadRequest('Missing required field: givenTo')

    let userId
    let givenTo
    let entry
    if (this.#userId === this.#givenTo) {
      const userService = new UserService({ userId: this.#userId })
      const foundUser = await userService.verifyUserExists()
      if (!foundUser) throw new httpErrors.NotFound('User not found')
      userId = foundUser._id
      givenTo = foundUser._id
      entry = 'debit'
    } else {
      const userService = new UserService({ userId: this.#userId })
      const foundUser = await userService.verifyUserExists()
      const givenToService = new UserService({ userId: this.#givenTo })
      const foundGivenTo = await givenToService.verifyUserExists()
      if (!foundUser) throw new httpErrors.NotFound('User not found')
      if (!foundGivenTo)
        throw new httpErrors.NotFound('Given to user not found')

      userId = foundUser._id
      givenTo = foundGivenTo._id
      entry = 'credit'
    }

    const defaultCurrency = await getDefaultCurrency()
    const currencyId = defaultCurrency._id
    const status = 'pending'

    const newTransaction = await saveUserTransaction({
      id: nanoid(),
      userId,
      givenTo,
      amount: this.#amount,
      currencyId,
      status,
      entry
    })

    return newTransaction.toObject()
  }

  async paidUserTransaction() {
    if (!this.#transferId)
      throw new httpErrors.BadRequest('Missing required field: id')
    const foundTransaction = await getOneUserTransaction(this.#transferId)
    if (!foundTransaction)
      throw new httpErrors.NotFound('User transaction not found')

    foundTransaction.status = 'paid'
    const savedTransaction = await foundTransaction.save()

    return savedTransaction.toObject()
  }

  async getUserTransactionByID() {
    if (!this.#transferId)
      throw new httpErrors.BadRequest('Missing required field: id')
    const foundTransaction = await getOneUserTransaction(this.#transferId)
    if (!foundTransaction)
      throw new httpErrors.NotFound('User transaction not found')

    return foundTransaction
  }

  async getAllUserTransactions() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    const userService = new UserService({ userId: this.#userId })
    const foundUser = await userService.verifyUserExists()
    if (!foundUser) throw new httpErrors.NotFound('User not found')
    const userId = foundUser._id

    const transactions = await getAllUserTransactions(userId)
    if (!transactions)
      throw new httpErrors.NotFound('User transactions not found')

    return transactions
  }

  async getAllUserTransactionsByGivenTo() {
    if (!this.#givenTo)
      throw new httpErrors.BadRequest('Missing required field: givenTo')
    const userService = new UserService({ userId: this.#givenTo })
    const foundUser = await userService.verifyUserExists()
    if (!foundUser) throw new httpErrors.NotFound('User not found')
    const givenTo = foundUser._id

    const transactions = await getUserTransactions({ givenTo })
    if (!transactions)
      throw new httpErrors.NotFound('User transactions not found')

    return transactions
  }
}

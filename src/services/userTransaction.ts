import httpErrors from 'http-errors'
import { nanoid } from 'nanoid'
import UserService from './user'
import {
  saveUserTransaction,
  getOneUserTransaction,
  getAllUserTransactions,
  getUserTransactions,
  getOneOrMoreUserTransactions,
  getUserTransactionsBalance
} from '../database/mongo/queries/userTransaction'
import { getDefaultCurrency } from '../database/mongo/queries/currency'

export default class UserTransactionService {
  #_id
  #transferId
  #userId
  #receiverId
  #amount
  #secureToken

  constructor(args?: {
    _id?: string
    transferId?: string
    userId?: string
    receiverId?: string
    amount?: number
    secureToken?: string
  }) {
    const {
      transferId = '',
      userId = '',
      receiverId = '',
      amount = 0,
      secureToken = ''
    } = args || {}
    if (amount < 0) throw new httpErrors.BadRequest('Amount cannot be negative')
    this.#_id = args?._id
    this.#transferId = transferId
    this.#userId = userId
    this.#amount = amount
    this.#receiverId = receiverId
    this.#secureToken = secureToken
  }

  async saveUserTransaction() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    if (!this.#receiverId)
      throw new httpErrors.BadRequest('Missing required field: receiverId')

    let userId
    let receiverId
    let entry
    let status = 'pending'
    if (this.#userId === this.#receiverId) {
      const userService = new UserService({ userId: this.#userId })
      const foundUser = await userService.verifyUserExists()
      if (!foundUser) throw new httpErrors.NotFound('User not found')
      userId = foundUser._id
      receiverId = foundUser._id
      entry = 'debit'
      status = 'paid'
    } else {
      const userService = new UserService({ userId: this.#userId })
      const foundUser = await userService.verifyUserExists()
      const receiverIdService = new UserService({ userId: this.#receiverId })
      const foundReceiverId = await receiverIdService.verifyUserExists()
      if (!foundUser) throw new httpErrors.NotFound('User not found')
      if (!foundReceiverId)
        throw new httpErrors.NotFound('Given to user not found')

      userId = foundUser._id
      receiverId = foundReceiverId._id
      entry = 'credit'
    }

    const defaultCurrency = await getDefaultCurrency()
    const currencyId = defaultCurrency._id

    const newTransaction = await saveUserTransaction({
      id: nanoid(),
      userId,
      receiverId,
      amount: this.#amount,
      currencyId,
      status,
      entry
    })

    return newTransaction.toObject()
  }

  async verifyUserTransaction() {
    if (!this.#secureToken)
      throw new httpErrors.BadRequest('Missing required field: secureToken')
    if (!this.#_id)
      throw new httpErrors.BadRequest('Missing required field: _id')
    if (!this.#receiverId)
      throw new httpErrors.BadRequest('Missing required field: receiverId')

    const foundTransactions = await getOneOrMoreUserTransactions({
      secureToken: this.#secureToken,
      _id: this.#_id
    })
    const foundTransaction = foundTransactions[0]
    if (!foundTransaction)
      throw new httpErrors.NotFound('User transaction not found')

    // Check if transaction is already paid
    if (foundTransaction.status === 'paid')
      throw new httpErrors.BadRequest('The transaction is already paid')

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

  async getAllUserTransactionsByReceiverId() {
    if (!this.#receiverId)
      throw new httpErrors.BadRequest('Missing required field: receiverId')
    const userService = new UserService({ userId: this.#receiverId })
    const foundUser = await userService.verifyUserExists()
    if (!foundUser) throw new httpErrors.NotFound('User not found')
    const receiverId = foundUser._id

    const transactions = await getUserTransactions({ receiverId })
    if (!transactions)
      throw new httpErrors.NotFound('User transactions not found')

    return transactions
  }

  async getUserTransactionsBalance() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    const userService = new UserService({ userId: this.#userId })
    const foundUser = await userService.verifyUserExists()
    if (!foundUser) throw new httpErrors.NotFound('User not found')
    const userId = foundUser._id
    const balance = await getUserTransactionsBalance(userId)
    if (!balance) throw new httpErrors.NotFound('User transactions not found')
    return balance
  }
}

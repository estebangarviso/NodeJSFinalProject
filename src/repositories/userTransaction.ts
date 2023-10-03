import httpErrors from 'http-errors'
import { nanoid } from 'nanoid'
import UserRepository from './user'
import {
  saveUserTransaction,
  getOneUserTransaction,
  getAllUserTransactions,
  getUserTransactions,
  getOneOrMoreUserTransactions,
  getUserTransactionsBalance
} from '../database/mongo/queries/userTransaction'
import { getDefaultCurrency } from '../database/mongo/queries/currency'

export default class UserTransactionRepository {
  private _id
  private _transferId
  private _userId
  private _receiverId
  private _amount
  private _secureToken

  constructor(args?: {
    id?: string
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
    } = args ?? {}
    if (amount < 0) throw new httpErrors.BadRequest('Amount cannot be negative')
    this._id = args?.id
    this._transferId = transferId
    this._userId = userId
    this._amount = amount
    this._receiverId = receiverId
    this._secureToken = secureToken
  }

  async saveUserTransaction() {
    if (!this._userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    if (!this._receiverId)
      throw new httpErrors.BadRequest('Missing required field: receiverId')

    let userId
    let receiverId
    let entry
    let status = 'pending'
    if (this._userId === this._receiverId) {
      const userRepository = new UserRepository({ userId: this._userId })
      const foundUser = await userRepository.verifyUserExists()
      if (!foundUser) throw new httpErrors.NotFound('User not found')
      userId = foundUser._id
      receiverId = foundUser._id
      entry = 'debit'
      status = 'paid'
    } else {
      const userRepository = new UserRepository({ userId: this._userId })
      const foundUser = await userRepository.verifyUserExists()
      const receiver = new UserRepository({ userId: this._receiverId })
      const foundReceiverId = await receiver.verifyUserExists()
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
      amount: this._amount,
      currencyId,
      status,
      entry
    })

    return newTransaction.toObject()
  }

  async verifyUserTransaction() {
    if (!this._secureToken)
      throw new httpErrors.BadRequest('Missing required field: secureToken')
    if (!this._id)
      throw new httpErrors.BadRequest('Missing required field: _id')
    if (!this._receiverId)
      throw new httpErrors.BadRequest('Missing required field: receiverId')

    const foundTransactions = await getOneOrMoreUserTransactions({
      secureToken: this._secureToken,
      _id: this._id
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
    if (!this._transferId)
      throw new httpErrors.BadRequest('Missing required field: id')
    const foundTransaction = await getOneUserTransaction(this._transferId)
    if (!foundTransaction)
      throw new httpErrors.NotFound('User transaction not found')

    return foundTransaction
  }

  async getAllUserTransactions() {
    if (!this._userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    const userRepository = new UserRepository({ userId: this._userId })
    const foundUser = await userRepository.verifyUserExists()
    if (!foundUser) throw new httpErrors.NotFound('User not found')
    const userId = foundUser._id

    const transactions = await getAllUserTransactions(userId)
    if (!transactions)
      throw new httpErrors.NotFound('User transactions not found')

    return transactions
  }

  async getAllUserTransactionsByReceiverId() {
    if (!this._receiverId)
      throw new httpErrors.BadRequest('Missing required field: receiverId')
    const userRepository = new UserRepository({ userId: this._receiverId })
    const foundUser = await userRepository.verifyUserExists()
    if (!foundUser) throw new httpErrors.NotFound('User not found')
    const receiverId = foundUser._id

    const transactions = await getUserTransactions({ receiverId })
    if (!transactions)
      throw new httpErrors.NotFound('User transactions not found')

    return transactions
  }

  async getUserTransactionsBalance() {
    if (!this._userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    const userRepository = new UserRepository({ userId: this._userId })
    const foundUser = await userRepository.verifyUserExists()
    if (!foundUser) throw new httpErrors.NotFound('User not found')
    const userId = foundUser._id
    const balance = await getUserTransactionsBalance(userId)
    if (!balance) throw new httpErrors.NotFound('User transactions not found')

    return balance
  }
}

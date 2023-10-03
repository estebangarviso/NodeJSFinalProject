import httpErrors from 'http-errors'
import { nanoid } from 'nanoid'
import { TBeforeSaveOrder } from '../database/mongo/models/order'
import {
  saveOrder,
  getOneOrder,
  getAllOrders,
  updateOneOrder
} from '../database/mongo/queries/order'
import { getUserTransactionsBalance } from '../database/mongo/queries/userTransaction'
import { getDefaultCurrency } from '../database/mongo/queries/currency'
import { getAllArticlesByID } from '../database/mongo/queries/article'
import UserRepository from './user'
import UserTransactionRepository from './userTransaction'
import { ORDER_STATUS } from '../utils/order'

export default class OrderRepository {
  private _trackingNumber
  private _userId
  private _receiverId
  private _total
  private _details
  private _status

  constructor(
    args: {
      trackingNumber?: string
      userId?: string
      receiverId?: string
      details?: TBeforeSaveOrder['details']
      total?: number
      status?: string
    } = {}
  ) {
    const {
      trackingNumber = '',
      userId = '',
      receiverId = '',
      details = [],
      total = 0,
      status = ''
    } = args
    this._trackingNumber = trackingNumber
    this._userId = userId
    this._receiverId = receiverId
    this._details = details
    this._total = total
    this._status = status
  }

  async saveOrder() {
    if (!this._userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    if (!this._receiverId)
      throw new httpErrors.BadRequest('Missing required field: receiverId')
    if (this._details.length === 0)
      throw new httpErrors.BadRequest('Missing required field: details')

    if (!this._status) this._status = ORDER_STATUS.COMPLETED

    const user = await new UserRepository({
      userId: this._userId
    }).verifyUserExists()
    const receiver = await new UserRepository({
      userId: this._receiverId
    }).verifyUserExists()
    const currentBalance = await getUserTransactionsBalance(user._id)
    const defaultCurrency = await getDefaultCurrency()
    const currencyId = defaultCurrency._id
    const currencyRate = defaultCurrency.rate

    const articleIds = this._details.map(detail => detail.articleId)
    const articles = await getAllArticlesByID(articleIds)
    if (articles.length === 0)
      throw new httpErrors.BadRequest('Invalid articleId')

    const details = this._details.map(detail => {
      const article = articles.find(art => art.id === detail.articleId)
      if (!article) throw new httpErrors.NotFound('Article not found')

      return {
        articleId: article._id,
        unitPrice: article.unitPrice,
        quantity: detail.quantity
      }
    })

    const sumSubTotal = details.reduce((acc, detail) => {
      return acc + detail.unitPrice * detail.quantity
    }, 0)
    const total = sumSubTotal * currencyRate
    const formattedTotal = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: defaultCurrency.symbol,
      minimumFractionDigits: defaultCurrency.decimals
    }).format(total)
    const formattedBalance = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: defaultCurrency.symbol,
      minimumFractionDigits: defaultCurrency.decimals
    }).format(currentBalance)

    if (currentBalance < total)
      throw new httpErrors.BadRequest(
        `You don't have enough money to make this purchase. Your current balance is ${formattedBalance} and the total of this purchase is ${formattedTotal}`
      )

    const userTransactionRepository = new UserTransactionRepository({
      userId: user._id.toString(),
      receiverId: receiver._id.toString(),
      amount: total
    })
    const userTransaction =
      await userTransactionRepository.saveUserTransaction()
    if (!userTransaction)
      throw new httpErrors.InternalServerError('Error saving userTransaction')

    const order = {
      trackingNumber: nanoid(),
      userTransactionId: userTransaction._id,
      userId: user._id,
      receiverId: receiver._id,
      currencyId,
      currencyRate,
      details,
      total,
      status: this._status
    }

    return await saveOrder(order)
  }

  async getAllOrders() {
    return await getAllOrders()
  }

  async getOneOrder() {
    if (!this._trackingNumber)
      throw new httpErrors.BadRequest('Missing required field: trackingNumber')

    return await getOneOrder(this._trackingNumber)
  }

  async updateOneOrder() {
    if (!this._trackingNumber)
      throw new httpErrors.BadRequest('Missing required field: trackingNumber')
    const defaultCurrency = await getDefaultCurrency()
    const currencyId = defaultCurrency._id
    const currencyRate = defaultCurrency.rate
    const articleIds = this._details.map(detail => detail.articleId)
    const articles = await getAllArticlesByID(articleIds)
    if (articles.length === 0)
      throw new httpErrors.BadRequest('Invalid articleId')

    const details = this._details.map(detail => {
      const article = articles.find(art => art.id === detail.articleId)
      if (!article) throw new httpErrors.NotFound('Article not found')

      return {
        articleId: article._id,
        unitPrice: article.unitPrice,
        quantity: detail.quantity
      }
    })

    const sumSubTotal = details.reduce((acc, detail) => {
      return acc + detail.unitPrice * detail.quantity
    }, 0)
    const total = sumSubTotal * currencyRate
    const order = {
      currencyId,
      currencyRate,
      details,
      total,
      status: this._status
    }

    return await updateOneOrder(this._trackingNumber, order)
  }
}

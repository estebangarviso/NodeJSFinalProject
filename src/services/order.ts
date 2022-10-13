import httpErrors from 'http-errors'
import { nanoid } from 'nanoid'
import { TBeforeSaveOrder } from '../database/mongo/models/order'
import {
  saveOrder,
  getOneOrder,
  getAllOrders,
  updateOneOrder
} from '../database/mongo/queries/order'
import { getOneUserTransaction } from '../database/mongo/queries/userTransaction'
import { getDefaultCurrency } from '../database/mongo/queries/currency'
import { getAllArticlesByID } from '../database/mongo/queries/article'
import UserService from './user'
import { ORDER_STATUS } from '../utils/order'

export default class OrderService {
  #trackingNumber
  #userTransactionId
  #userId
  #details
  #total
  #status

  constructor(
    args: {
      trackingNumber?: string
      userTransactionId?: string
      userId?: string
      details?: TBeforeSaveOrder['details']
      total?: number
      status?: string
    } = {}
  ) {
    const {
      trackingNumber = '',
      userTransactionId = '',
      userId = '',
      details = [],
      total = 0,
      status = ''
    } = args
    this.#trackingNumber = trackingNumber
    this.#userTransactionId = userTransactionId
    this.#userId = userId
    this.#details = details
    this.#total = total
    this.#status = status
  }

  async saveOrder() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')
    if (!this.#details)
      throw new httpErrors.BadRequest('Missing required field: details')
    if (!this.#total)
      throw new httpErrors.BadRequest('Missing required field: total')
    if (!this.#status)
      throw new httpErrors.BadRequest('Missing required field: status')
    if (!ORDER_STATUS.includes(`${this.#status}`))
      throw new httpErrors.BadRequest('Invalid status')
    if (this.#details?.length)
      throw new httpErrors.BadRequest('Missing required field: details')

    const user = await new UserService({
      userId: this.#userId
    }).verifyUserExists()
    const userId = user._id

    const userTransaction = await getOneUserTransaction(this.#userTransactionId)
    const defaultCurrency = await getDefaultCurrency()
    const currencyId = defaultCurrency._id
    const currencyRate = defaultCurrency.rate
    const articleIds = this.#details.map(detail => detail.articleId)
    const articles = await getAllArticlesByID(articleIds)
    if (articles.length === 0)
      throw new httpErrors.BadRequest('Invalid articleId')

    const details = this.#details.map(detail => {
      const article = articles.find(article => article.id === detail.articleId)
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
      trackingNumber: nanoid(),
      userTransactionId: userTransaction._id,
      userId,
      currencyId,
      currencyRate,
      details,
      total,
      status: this.#status
    }
    return await saveOrder(order)
  }

  async getAllOrders() {
    return await getAllOrders()
  }

  async getOneOrder() {
    if (!this.#trackingNumber)
      throw new httpErrors.BadRequest('Missing required field: trackingNumber')

    return await getOneOrder(this.#trackingNumber)
  }

  async updateOneOrder() {
    if (!this.#trackingNumber)
      throw new httpErrors.BadRequest('Missing required field: trackingNumber')
    const defaultCurrency = await getDefaultCurrency()
    const currencyId = defaultCurrency._id
    const currencyRate = defaultCurrency.rate
    const articleIds = this.#details.map(detail => detail.articleId)
    const articles = await getAllArticlesByID(articleIds)
    if (articles.length === 0)
      throw new httpErrors.BadRequest('Invalid articleId')

    const details = this.#details.map(detail => {
      const article = articles.find(article => article.id === detail.articleId)
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
      status: this.#status
    }
    return await updateOneOrder(this.#trackingNumber, order)
  }
}

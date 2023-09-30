import { BadRequest } from 'http-errors'
import { nanoid } from 'nanoid'
import { IArticle } from '../database/mongo/models/article'
import {
  saveArticle,
  getArticleByID,
  getAllArticles,
  removeArticleByID,
  updateOneArticle
} from '../database/mongo/queries/article'
import { getDefaultCurrency } from '../database/mongo/queries/currency'

export default class ArticleRepository {
  private _id
  private _sku
  private _title
  private _shortDescription
  private _unity
  private _qtyStock
  private _unitPrice
  private _isVirtual
  private _isAvailable
  private _isDeleted

  // Make optional to add constructor params
  constructor(
    args: {
      id?: string
      sku?: string
      title?: string
      shortDescription?: string
      unity?: string
      qtyStock?: number
      unitPrice?: number
      isVirtual?: boolean
      isAvailable?: boolean
      isDeleted?: boolean
    } = {}
  ) {
    const {
      id = '',
      sku = '',
      title = '',
      shortDescription = '',
      unity = 'ea',
      qtyStock = 0,
      unitPrice = 0,
      isVirtual = false,
      isAvailable = true,
      isDeleted = false
    } = args
    this._id = id
    this._sku = sku
    this._title = title
    this._shortDescription = shortDescription
    this._unity = unity
    this._qtyStock = qtyStock
    this._unitPrice = unitPrice
    this._isVirtual = isVirtual
    this._isAvailable = isAvailable
    this._isDeleted = isDeleted
  }

  async saveArticle() {
    if (this._qtyStock < 0) throw new BadRequest('Quantity cannot be negative')
    if (this._qtyStock % 1 !== 0)
      throw new BadRequest('Quantity must be an integer')
    if (this._unitPrice < 0)
      throw new BadRequest('Unit price cannot be negative')

    const defaultCurrency = await getDefaultCurrency()
    const currencyId = defaultCurrency._id

    // Create article
    const article = await saveArticle({
      id: nanoid(),
      sku: this._sku,
      title: this._title,
      shortDescription: this._shortDescription,
      unity: this._unity,
      qtyStock: this._qtyStock,
      currencyId,
      unitPrice: this._unitPrice,
      isVirtual: this._isVirtual,
      isAvailable: this._isAvailable,
      isDeleted: this._isDeleted
    } as IArticle)

    return article
  }

  async getArticleByID() {
    if (!this._id) throw new BadRequest('Missing required field: id')

    const article = await getArticleByID(this._id)

    return article
  }

  async getAllArticles() {
    const articles = await getAllArticles()

    return articles
  }

  async removeArticleByID() {
    if (!this._id) throw new BadRequest('Missing required field: id')

    const article = await removeArticleByID(this._id)

    return article
  }

  async updateOneArticle() {
    if (!this._id) throw new BadRequest('Missing required field: id')

    const article = await updateOneArticle(this._id, {
      sku: this._sku,
      title: this._title,
      shortDescription: this._shortDescription,
      unity: this._unity,
      qtyStock: this._qtyStock,
      unitPrice: this._unitPrice,
      isVirtual: this._isVirtual,
      isAvailable: this._isAvailable
    } as IArticle)

    return article
  }
}

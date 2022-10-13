import { BadRequest, Conflict } from 'http-errors'
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

export default class ArticleService {
  #id
  #sku
  #title
  #shortDescription
  #unity
  #qtyStock
  #unitPrice
  #isVirtual
  #isAvailable
  #isDeleted

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
    this.#id = id
    this.#sku = sku
    this.#title = title
    this.#shortDescription = shortDescription
    this.#unity = unity
    this.#qtyStock = qtyStock
    this.#unitPrice = unitPrice
    this.#isVirtual = isVirtual
    this.#isAvailable = isAvailable
    this.#isDeleted = isDeleted
  }

  async saveArticle() {
    if (this.#qtyStock < 0) throw new BadRequest('Quantity cannot be negative')
    if (this.#qtyStock % 1 !== 0)
      throw new BadRequest('Quantity must be an integer')
    if (this.#unitPrice < 0)
      throw new BadRequest('Unit price cannot be negative')

    const defaultCurrency = await getDefaultCurrency()
    const currencyId = defaultCurrency._id

    // Create article
    const article = await saveArticle({
      id: nanoid(),
      sku: this.#sku,
      title: this.#title,
      shortDescription: this.#shortDescription,
      unity: this.#unity,
      qtyStock: this.#qtyStock,
      currencyId,
      unitPrice: this.#unitPrice,
      isVirtual: this.#isVirtual,
      isAvailable: this.#isAvailable,
      isDeleted: this.#isDeleted
    } as IArticle)

    return article
  }

  async getArticleByID() {
    if (!this.#id) throw new BadRequest('Missing required field: id')

    const article = await getArticleByID(this.#id)

    return article
  }

  async getAllArticles() {
    const articles = await getAllArticles()

    return articles
  }

  async removeArticleByID() {
    if (!this.#id) throw new BadRequest('Missing required field: id')

    const article = await removeArticleByID(this.#id)

    return article
  }

  async updateOneArticle() {
    if (!this.#id) throw new BadRequest('Missing required field: id')

    const article = await updateOneArticle(this.#id, {
      title: this.#title,
      shortDescription: this.#shortDescription,
      unity: this.#unity,
      qtyStock: this.#qtyStock,
      unitPrice: this.#unitPrice,
      isVirtual: this.#isVirtual,
      isAvailable: this.#isAvailable
    } as IArticle)

    return article
  }
}

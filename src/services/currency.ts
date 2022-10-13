import { BadRequest, Conflict } from 'http-errors'
import { nanoid } from 'nanoid'
import { CURRENCY_SYMBOLS } from '../utils/currency'
import {
  saveCurrency,
  getCurrencyByID,
  getCurrencyBySymbol,
  getAllCurrencies,
  refreshCurrencies
} from '../database/mongo/queries/currency'

export default class CurrencyService {
  #id
  #name
  #symbol
  #rate
  #decimal
  #sign
  #isDefault

  constructor(args?: {
    id?: string
    name?: string
    symbol?: string
    rate?: number
    decimals?: number
    sign?: string
    isDefault?: boolean
  }) {
    const {
      id = '',
      name = '',
      symbol = '',
      rate = 0,
      decimals = 2,
      sign = '',
      isDefault = false
    } = args || {}
    this.#id = id
    this.#name = name
    this.#symbol = symbol
    this.#rate = rate
    this.#decimal = decimals
    this.#sign = sign
    this.#isDefault = isDefault
  }

  async saveCurrency() {
    if (!CURRENCY_SYMBOLS.includes(`${this.#symbol}`))
      throw new BadRequest('Currency symbol not allowed')
    if (this.#rate === 0) throw new BadRequest('Currency rate cannot be 0')
    if (this.#rate < 0) throw new BadRequest('Currency rate cannot be negative')
    if (this.#decimal < 0)
      throw new BadRequest('Currency decimal cannot be less than 0')
    if (this.#decimal % 1 !== 0)
      throw new BadRequest('Currency decimal must be an integer')

    const currencyExists = await getCurrencyBySymbol(this.#symbol)
    if (currencyExists) throw new Conflict('Currency already exists')

    return await saveCurrency({
      id: nanoid(),
      name: this.#name,
      symbol: this.#symbol,
      rate: this.#rate,
      decimals: this.#decimal,
      sign: this.#sign,
      isDefault: this.#isDefault
    })
  }

  async getCurrencyByID() {
    return await getCurrencyByID(this.#id)
  }

  async getAllCurrencies() {
    return await getAllCurrencies()
  }

  async refreshCurrencies() {
    return await refreshCurrencies()
  }
}

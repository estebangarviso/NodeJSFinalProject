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

export default class CurrencyRepository {
  private _id
  private _name
  private _symbol
  private _rate
  private _decimal
  private _sign
  private _isDefault

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
    } = args ?? {}
    this._id = id
    this._name = name
    this._symbol = symbol
    this._rate = rate
    this._decimal = decimals
    this._sign = sign
    this._isDefault = isDefault
  }

  async saveCurrency() {
    if (!CURRENCY_SYMBOLS.includes(`${this._symbol}`))
      throw new BadRequest('Currency symbol not allowed')
    if (this._rate === 0) throw new BadRequest('Currency rate cannot be 0')
    if (this._rate < 0) throw new BadRequest('Currency rate cannot be negative')
    if (this._decimal < 0)
      throw new BadRequest('Currency decimal cannot be less than 0')
    if (this._decimal % 1 !== 0)
      throw new BadRequest('Currency decimal must be an integer')

    const currencyExists = await getCurrencyBySymbol(this._symbol)
    if (currencyExists) throw new Conflict('Currency already exists')

    return await saveCurrency({
      id: nanoid(),
      name: this._name,
      symbol: this._symbol,
      rate: this._rate,
      decimals: this._decimal,
      sign: this._sign,
      isDefault: this._isDefault
    })
  }

  async getCurrencyByID() {
    return await getCurrencyByID(this._id)
  }

  async getAllCurrencies() {
    return await getAllCurrencies()
  }

  async refreshCurrencies() {
    return await refreshCurrencies()
  }
}

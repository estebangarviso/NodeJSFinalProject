import { HydratedDocument, type mongo } from 'mongoose'
import axios from 'axios'
import httpError from 'http-errors'
import CurrencyModel, { ICurrency } from '../models/currency'
import { CURRENCY_SYMBOLS } from '../../../utils/currency'
import { FOREX_API_ENDPOINT_LATEST, FOREX_API_KEY } from '../../../config'

/**
 * It takes a currency object, creates a new CurrencyModel instance, saves it, and returns
 * the saved currency
 *
 * @returns {Promise<HydratedDocument<ICurrency>>} The savedCurrency is being returned.
 */
export const saveCurrency: (
  currency: ICurrency
) => Promise<HydratedDocument<ICurrency>> = async currency => {
  const savedCurrency = new CurrencyModel(currency)

  await savedCurrency.save()

  return savedCurrency
}

/**
 * Get a currency by its ID.
 *
 * @returns { Promise<HydratedDocument<ICurrency>> } The first currency in the array of currencies.
 */
export const getCurrencyByID: (
  id: string
) => Promise<HydratedDocument<ICurrency>> = async id => {
  const currencies = await CurrencyModel.find({ id })

  return currencies[0]
}

/**
 * Get default currency.
 *
 * @returns { Promise<HydratedDocument<ICurrency>> } The first currency in the array of currencies.
 */
export const getDefaultCurrency: () => Promise<
  HydratedDocument<ICurrency>
> = async () => {
  const currencies = await CurrencyModel.find({ isDefault: true })

  return currencies[0]
}

/**
 * Get the currency by symbol.
 *
 * @returns { Promise<HydratedDocument<ICurrency>> } The first currency in the array of currencies.
 */
export const getCurrencyBySymbol: (
  symbol: string
) => Promise<HydratedDocument<ICurrency>> = async symbol => {
  const currencies = await CurrencyModel.find({ symbol })

  return currencies[0]
}

/**
 * Get all currencies.
 *
 * @returns { Promise<HydratedDocument<ICurrency>[]> } The array of currencies.
 */
export const getAllCurrencies: () => Promise<
  HydratedDocument<ICurrency>[]
> = async () => {
  const currencies = await CurrencyModel.find()

  return currencies
}

/**
 * Refresh currencies rates.
 *
 * @returns { Promise<mongo.BulkWriteResult> } The array of currencies.
 */
export const refreshCurrencies: () => Promise<mongo.BulkWriteResult> =
  async () => {
    if (!FOREX_API_KEY) throw new Error('FOREX_API_KEY is not defined')

    // Use a third party API to get the latest rates
    try {
      const defaultCurrency = await getDefaultCurrency()
      const base = defaultCurrency.symbol
      const symbols = CURRENCY_SYMBOLS.join(',')
      const url = FOREX_API_ENDPOINT_LATEST
      const config = {
        params: {
          app_id: FOREX_API_KEY,
          base,
          symbols
        }
      }
      const response = await axios.get(url, config)
      const {
        data: { rates }
      } = response as {
        data: {
          rates: {
            [key: string]: number
          }
        }
      }

      if (!rates)
        throw new httpError.ServiceUnavailable(
          'Rates not found or service unavailable'
        )

      const currencies = await getAllCurrencies()
      const bulkOps = CurrencyModel.collection.initializeUnorderedBulkOp()

      currencies.forEach(currency => {
        const rate = rates[currency.symbol]
        if (!rate) {
          console.warn(`Rate not found for ${currency.symbol}`)

          return
        }
        bulkOps.find({ _id: currency._id }).updateOne({
          $set: {
            rate
          }
        })
      })

      return await bulkOps.execute()
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `${error.message}${error?.stack ? `\r${error?.stack}` : ``}`
          : 'Unknown error'

      throw new httpError.InternalServerError(
        `Error while refreshing currencies: ${message}`
      )
    }
  }

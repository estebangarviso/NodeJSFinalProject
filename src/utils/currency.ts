import CURRENCIES from './../import/currencies.json'
export const CURRENCY_SYMBOLS: string[] = Object.entries(CURRENCIES).map(
  currency => currency[1].symbol
)
// eslint-disable-next-line
export type CURRENCY_SYMBOLS = 'USD' | 'CLP'

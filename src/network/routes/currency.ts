import { Router } from 'express'

import { storeCurrencySchema } from '../../schemas/currency'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'
import CurrencyService from '../../services/currency'

const CurrencyRouter = Router()

CurrencyRouter.route('/currency')
  .post(
    validatorCompiler(storeCurrencySchema, 'body'),
    async (req, res, next) => {
      const {
        body: { id, name, symbol, rate, decimals, sign, isDefault }
      } = req

      try {
        const currencyService = new CurrencyService({
          id,
          name,
          symbol,
          rate,
          decimals,
          sign,
          isDefault
        })

        response({
          error: false,
          message: await currencyService.saveCurrency(),
          res,
          status: 201
        })
      } catch (error) {
        next(error)
      }
    }
  )
  .get(async (req, res, next) => {
    try {
      const currencyService = new CurrencyService()
      response({
        error: false,
        message: await currencyService.getAllCurrencies(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  })

CurrencyRouter.route('/currency/refresh').post(async (req, res, next) => {
  try {
    const currencyService = new CurrencyService()

    response({
      error: false,
      message: await currencyService.refreshCurrencies(),
      res,
      status: 201
    })
  } catch (error) {
    next(error)
  }
})

CurrencyRouter.route('/currency/:id').get(async (req, res, next) => {
  const {
    params: { id }
  } = req

  try {
    const currencyService = new CurrencyService({ id })

    response({
      error: false,
      message: await currencyService.getCurrencyByID(),
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

export default CurrencyRouter

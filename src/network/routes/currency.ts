import { Request, Router } from 'express'

import { storeCurrencySchema } from '../../schemas/currency'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'
import CurrencyRepository from '../../repositories/currency'

type CurrencyRequest = Request<
  { id: string },
  Record<string, never>,
  {
    id: string
    name: string
    symbol: string
    rate: number
    decimals: number
    sign: string
    isDefault: boolean
  }
>

const CurrencyRouter: Router = Router()

CurrencyRouter.route('/currency')
  .post(
    validatorCompiler(storeCurrencySchema, 'body'),
    async (req: CurrencyRequest, res, next) => {
      const {
        body: { id, name, symbol, rate, decimals, sign, isDefault }
      } = req

      try {
        const currencyRepository = new CurrencyRepository({
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
          message: await currencyRepository.saveCurrency(),
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
      const currencyRepository = new CurrencyRepository()
      response({
        error: false,
        message: await currencyRepository.getAllCurrencies(),
        res,
        status: 200
      })
    } catch (error) {
      next(error)
    }
  })

CurrencyRouter.route('/currency/refresh').post(async (req, res, next) => {
  try {
    const currencyRepository = new CurrencyRepository()

    response({
      error: false,
      message: await currencyRepository.refreshCurrencies(),
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
    const currencyRepository = new CurrencyRepository({ id })

    response({
      error: false,
      message: await currencyRepository.getCurrencyByID(),
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

export default CurrencyRouter

import { NextFunction, Response } from 'express'

export interface IResponse {
  error: boolean
  message: object | string | Response
  status: number
}

type RouterResponseHandler = (
  args: IResponse & {
    res: Response | NextFunction
  }
) => void

const response: RouterResponseHandler = ({
  error = true,
  message,
  status = 500,
  res
}) => {
  console.debug('DEBUG: response', { error, message, status, res })
  if (isNextFunction(res)) return res(message)

  if (error === false) return res.status(status).send(message)

  res.status(status).send({ error, message })
}

const isNextFunction = (res: Response | NextFunction): res is NextFunction => {
  return (
    typeof res === 'function' &&
    typeof res.name === 'string' &&
    res.name === 'next'
  )
}

export default response

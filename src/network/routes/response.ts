import { Response } from 'express'

export interface IResponse {
  error: boolean
  message: object | string | Response
  status: number
}

type RouterResponseHandler = (
  args: IResponse & {
    res: Response
  }
) => void

const response: RouterResponseHandler = ({
  error = true,
  message,
  status = 500,
  res
}) => {
  console.debug('DEBUG: response', { error, message, status })

  if (error === false) {
    return res.status(status).send(message)
  }

  res.status(status).send({ error, message })
}

export default response

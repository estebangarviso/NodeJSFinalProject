import { Response } from 'express'
import { NODE_ENV } from '../../config'
type RouterResponseHandler = (args: {
  error: boolean
  message: object | string | Response
  status: number
  res: Response
}) => void

const response: RouterResponseHandler = ({
  error = true,
  message,
  status = 500,
  res
}) => {
  console.debug('DEBUG: response', { error, message, status })

  res.status(status).send({ error, message })
}

export default response

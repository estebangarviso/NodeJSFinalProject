import { Response } from 'express'
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
  res.status(status).send({ error, message })
}

export default response

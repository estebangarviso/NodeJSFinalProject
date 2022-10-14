import httpErrors from 'http-errors'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { RequestHandler } from 'express'

const ajv = addFormats(
  new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true
  }),
  ['email']
)
  .addKeyword('kind')
  .addKeyword('modifier')

/**
 * @param {Object} schema
 * @param {'body'|'params'} value
 */
const validatorCompiler = (
  schema: object,
  value: 'body' | 'params'
): RequestHandler => {
  return (req, res, next) => {
    const validate = ajv.compile(schema)

    const ok = validate(req[value])

    if (!ok && validate.errors) {
      const [error] = validate.errors
      const errorMessage = `${error.instancePath} ${error.message as string}`

      return next(new httpErrors.UnprocessableEntity(errorMessage))
    }

    next()
  }
}

export default validatorCompiler

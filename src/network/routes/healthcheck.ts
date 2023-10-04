import { Router } from 'express'
import response from './response'

const HealthCheckRouter: Router = Router()

HealthCheckRouter.route('/healthcheck').get((req, res, next) => {
  try {
    response({
      error: false,
      message: 'Server is OK',
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @openapi
 * /healthcheck:
 *   get:
 *     tags:
 *       - Healthcheck
 *     summary: Healthcheck
 *     description: Healthcheck
 *     responses:
 *       200:
 *         description: Healthcheck
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HealthcheckResponse"
 */
export default HealthCheckRouter

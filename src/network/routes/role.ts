import { Request, Router } from 'express'

import { storeRoleSchema } from '../../schemas/role'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'
import RoleRepository from '../../repositories/role'

type RoleRequest = Request<
  { id: string },
  Record<string, never>,
  { id: string; name: string }
>
const RoleRouter: Router = Router()

RoleRouter.route('/role').post(
  validatorCompiler(storeRoleSchema, 'body'),
  async (req: RoleRequest, res, next) => {
    const {
      body: { id, name }
    } = req

    try {
      const roleRepository = new RoleRepository({ id, name })

      response({
        error: false,
        message: await roleRepository.saveRole(),
        res,
        status: 201
      })
    } catch (error) {
      next(error)
    }
  }
)

RoleRouter.route('/role/:id').get(async (req: RoleRequest, res, next) => {
  const {
    params: { id }
  } = req

  try {
    const roleRepository = new RoleRepository({ id })

    response({
      error: false,
      message: await roleRepository.getRoleByID(),
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

export default RoleRouter

import { Router } from 'express'

import { storeRoleSchema } from '../../schemas/role'
import validatorCompiler from './utils/validatorCompiler'
import response from './response'
import RoleService from '../../services/role'

const RoleRouter = Router()

RoleRouter.route('/role').post(
  validatorCompiler(storeRoleSchema, 'body'),
  async (req, res, next) => {
    const {
      body: { id, name }
    } = req

    try {
      const roleService = new RoleService({ id, name })

      response({
        error: false,
        message: await roleService.saveRole(),
        res,
        status: 201
      })
    } catch (error) {
      next(error)
    }
  }
)

RoleRouter.route('/role/:id').get(async (req, res, next) => {
  const {
    params: { id }
  } = req

  try {
    const roleService = new RoleService({ id })

    response({
      error: false,
      message: await roleService.getRoleByID(),
      res,
      status: 200
    })
  } catch (error) {
    next(error)
  }
})

export default RoleRouter

import { HydratedDocument } from 'mongoose'
import RoleModel, { IRole } from '../models/role'

/**
 * It takes a role object, creates a new RoleModel instance, saves it, and returns
 * the saved role
 *
 * @returns {Promise<HydratedDocument<IRole>>} The savedRole is being returned.
 */
export const saveRole: (
  role: IRole
) => Promise<HydratedDocument<IRole>> = async role => {
  const savedRole = new RoleModel(role)

  await savedRole.save()

  return savedRole
}

/**
 * Get a role by its ID.
 *
 * @returns { Promise<HydratedDocument<IRole>> } The first role in the array of roles.
 */
export const getRoleByID: (
  id: string
) => Promise<HydratedDocument<IRole>> = async id => {
  const roles = await RoleModel.find({ id })

  return roles[0]
}

/**
 * Get the role by name.
 *
 * @returns { Promise<HydratedDocument<IRole>> } The first role in the array of roles.
 */
export const getRoleByName: (
  name: string
) => Promise<HydratedDocument<IRole>> = async name => {
  const roles = await RoleModel.find({ name })

  return roles[0]
}

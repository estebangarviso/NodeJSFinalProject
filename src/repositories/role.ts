import { BadRequest, Conflict } from 'http-errors'
import { ROLE_IDS, ROLE_NAMES } from '../utils/role'
import {
  saveRole,
  getRoleByID,
  getRoleByName
} from '../database/mongo/queries/role'

export default class RoleRepository {
  private _id
  private _name

  constructor({ id = '', name = '' }: { id?: string; name?: string }) {
    if (!ROLE_IDS.includes(`${id}`)) throw new BadRequest('Role ID not allowed')

    this._id = id
    this._name = name
  }

  async saveRole() {
    if (!ROLE_NAMES.includes(this._name))
      throw new BadRequest('Role name not allowed')

    const roleExists = await getRoleByName(this._name)

    if (roleExists) throw new Conflict('Role already exists')

    return await saveRole({ id: this._id, name: this._name })
  }

  async getRoleByID() {
    return await getRoleByID(this._id)
  }

  static async getRoleByName(name: ROLE_NAMES) {
    return await getRoleByName(name)
  }
}

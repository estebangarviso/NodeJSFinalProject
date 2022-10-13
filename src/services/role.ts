import { BadRequest, Conflict } from 'http-errors'
import { ROLE_IDS, ROLE_NAMES } from '../utils/role'
import {
  saveRole,
  getRoleByID,
  getRoleByName
} from '../database/mongo/queries/role'

export default class RoleService {
  #id
  #name

  constructor({ id = '', name = '' }: { id?: string; name?: string }) {
    if (!ROLE_IDS.includes(`${id}`)) throw new BadRequest('Role ID not allowed')

    this.#id = id
    this.#name = name
  }

  async saveRole() {
    if (!ROLE_NAMES.includes(this.#name))
      throw new BadRequest('Role name not allowed')

    const roleExists = await getRoleByName(this.#name)

    if (roleExists) throw new Conflict('Role already exists')

    return await saveRole({ id: this.#id, name: this.#name })
  }

  async getRoleByID() {
    return await getRoleByID(this.#id)
  }

  static async getRoleByName(name: ROLE_NAMES) {
    return await getRoleByName(name)
  }
}

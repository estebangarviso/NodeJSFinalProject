import httpErrors from 'http-errors'
import { nanoid } from 'nanoid'
import { HydratedDocument } from 'mongoose'

import RoleService from './role'
import { hashString } from '../utils/hash'
import {
  getUserByID,
  saveUser,
  getAllUsers,
  removeUserByID,
  updateOneUser,
  getOneUser
} from '../database/mongo/queries/user'
import { IUser } from '../database/mongo/models/user'

export default class UserService {
  #userId
  #firstName
  #lastName
  #email
  #password
  #roleId

  // Make optional to add constructor params
  constructor(
    args: {
      userId?: string
      firstName?: string
      lastName?: string
      email?: string
      password?: string
      roleId?: string
    } = {}
  ) {
    const {
      userId = '',
      firstName = '',
      lastName = '',
      email = '',
      password = '',
      roleId = '2'
    } = args
    this.#userId = userId
    this.#firstName = firstName
    this.#lastName = lastName
    this.#email = email
    this.#password = password
    this.#roleId = roleId
  }

  async verifyUserExists() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await getUserByID(this.#userId)

    if (!user) throw new httpErrors.NotFound('User not found')

    return user
  }

  async saveUser() {
    if (!this.#firstName)
      throw new httpErrors.BadRequest('Missing required field: firstName')

    if (!this.#lastName)
      throw new httpErrors.BadRequest('Missing required field: lastName')

    if (!this.#email)
      throw new httpErrors.BadRequest('Missing required field: email')

    const emailExists = await getOneUser({ email: this.#email })
    if (emailExists) throw new httpErrors.BadRequest('Email already exists')

    if (!this.#password)
      throw new httpErrors.BadRequest('Missing required field: password')

    if (!this.#roleId)
      throw new httpErrors.BadRequest('Missing required field: roleId')

    const { salt, result: hash } = hashString(this.#password)
    const role = await new RoleService({
      id: this.#roleId
    }).getRoleByID()
    if (!role)
      throw new httpErrors.BadRequest('The requested role does not exists')

    const savedUser = await saveUser({
      id: nanoid(),
      firstName: this.#firstName,
      lastName: this.#lastName,
      email: this.#email,
      salt,
      hash,
      roleId: role._id,
      secureToken: nanoid(33)
    })

    return savedUser
  }

  async getUserByID() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await getUserByID(this.#userId)

    if (!user)
      throw new httpErrors.NotFound('The requested user does not exists')

    return user
  }

  async getAllUsers() {
    return await getAllUsers()
  }

  async removeUserByID() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await removeUserByID(this.#userId)

    if (!user)
      throw new httpErrors.NotFound('The requested user does not exists')

    return user
  }

  async updateOneUser() {
    if (!this.#userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const updatePassword = !!this.#password
    const aux = {} as {
      salt?: string
      hash?: string
    }

    if (updatePassword) {
      const { salt, result: hash } = hashString(this.#password)

      aux.salt = salt
      aux.hash = hash
    }

    return await updateOneUser({
      id: this.#userId,
      firstName: this.#firstName,
      lastName: this.#lastName,
      email: this.#email,
      ...aux
    } as unknown as HydratedDocument<IUser>)
  }

  async login() {
    if (!this.#email)
      throw new httpErrors.BadRequest('Missing required field: email')

    if (!this.#password)
      throw new httpErrors.BadRequest('Missing required field: password')

    const user = await getOneUser({ email: this.#email })

    if (!user) throw new httpErrors.BadRequest('Bad credentials')

    const { salt, hash } = user
    const { result } = hashString(this.#password, salt)

    if (hash !== result) throw new httpErrors.BadRequest('Bad credentials')

    return user
  }
}

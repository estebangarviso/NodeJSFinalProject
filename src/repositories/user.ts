import httpErrors from 'http-errors'
import { nanoid } from 'nanoid'
import { HydratedDocument } from 'mongoose'

import RoleRepository from './role'
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

export default class UserRepository {
  private _userId
  private _firstName
  private _lastName
  private _email
  private _password
  private _roleId

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
    this._userId = userId
    this._firstName = firstName
    this._lastName = lastName
    this._email = email
    this._password = password
    this._roleId = roleId
  }

  async verifyUserExists() {
    if (!this._userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await getUserByID(this._userId)

    if (!user) throw new httpErrors.NotFound('User not found')

    return user
  }

  async saveUser() {
    if (!this._firstName)
      throw new httpErrors.BadRequest('Missing required field: firstName')

    if (!this._lastName)
      throw new httpErrors.BadRequest('Missing required field: lastName')

    if (!this._email)
      throw new httpErrors.BadRequest('Missing required field: email')

    const emailExists = await getOneUser({ email: this._email })
    if (emailExists) throw new httpErrors.BadRequest('Email already exists')

    if (!this._password)
      throw new httpErrors.BadRequest('Missing required field: password')

    if (!this._roleId)
      throw new httpErrors.BadRequest('Missing required field: roleId')

    const { salt, result: hash } = hashString(this._password)
    const role = await new RoleRepository({
      id: this._roleId
    }).getRoleByID()
    if (!role)
      throw new httpErrors.BadRequest('The requested role does not exists')

    const savedUser = await saveUser({
      id: nanoid(),
      firstName: this._firstName,
      lastName: this._lastName,
      email: this._email,
      salt,
      hash,
      roleId: role._id,
      secureToken: nanoid(33)
    })

    return savedUser
  }

  async getUserByID() {
    if (!this._userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await getUserByID(this._userId)

    if (!user)
      throw new httpErrors.NotFound('The requested user does not exists')

    return user
  }

  async getAllUsers() {
    return await getAllUsers()
  }

  async removeUserByID() {
    if (!this._userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const user = await removeUserByID(this._userId)

    if (!user)
      throw new httpErrors.NotFound('The requested user does not exists')

    return user
  }

  async updateOneUser() {
    if (!this._userId)
      throw new httpErrors.BadRequest('Missing required field: userId')

    const updatePassword = !!this._password
    const aux = {} as {
      salt?: string
      hash?: string
    }

    if (updatePassword) {
      const { salt, result: hash } = hashString(this._password)

      aux.salt = salt
      aux.hash = hash
    }

    return await updateOneUser({
      id: this._userId,
      firstName: this._firstName,
      lastName: this._lastName,
      email: this._email,
      ...aux
    } as unknown as HydratedDocument<IUser>)
  }

  async login() {
    if (!this._email)
      throw new httpErrors.BadRequest('Missing required field: email')

    if (!this._password)
      throw new httpErrors.BadRequest('Missing required field: password')

    const user = await getOneUser({ email: this._email })

    if (!user) throw new httpErrors.BadRequest('Bad credentials')

    const { salt, hash } = user
    const { result } = hashString(this._password, salt)

    if (hash !== result) throw new httpErrors.BadRequest('Bad credentials')

    return user
  }
}

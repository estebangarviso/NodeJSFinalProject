import httpErrors from 'http-errors';
import { nanoid } from 'nanoid';
import { HydratedDocument } from 'mongoose';

import RoleService from './role';
import { hashString } from '~/utils/hash';
import {
  getUserByID,
  saveUser,
  getAllUsers,
  removeUserByID,
  updateOneUser,
  getOneUser
} from '~/database/mongo/queries/user';
import { IRole } from '~/database/mongo/models/role';
import { IUser } from '~/database/mongo/models/user';

export default class UserService {
  #userId;
  #name;
  #lastName;
  #email;
  #password;
  #role;

  // Make optional to add constructor params
  constructor(args?: {
    userId?: string;
    name?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: string;
  }) {
    const { userId = '', name = '', lastName = '', email = '', password = '', role = '2' } = args || {};
    this.#userId = userId;
    this.#name = name;
    this.#lastName = lastName;
    this.#email = email;
    this.#password = password;
    this.#role = role;
  }

  async verifyUserExists() {
    if (!this.#userId) throw new httpErrors.BadRequest('Missing required field: userId');

    const user = await getUserByID(this.#userId);

    if (!user) throw new httpErrors.NotFound('User not found');

    return user;
  }

  async saveUser() {
    if (!this.#name) throw new httpErrors.BadRequest('Missing required field: name');

    if (!this.#lastName) throw new httpErrors.BadRequest('Missing required field: lastName');

    if (!this.#email) throw new httpErrors.BadRequest('Missing required field: email');

    if (!this.#password) throw new httpErrors.BadRequest('Missing required field: password');

    if (!this.#role) throw new httpErrors.BadRequest('Missing required field: role');

    const { salt, result: hash } = hashString(this.#password);
    const role = await new RoleService({ id: this.#role } as unknown as IRole).getRoleByID();

    await saveUser({
      id: nanoid(),
      name: this.#name,
      lastName: this.#lastName,
      email: this.#email,
      salt,
      hash,
      role: role._id
    } as any);

    return await getAllUsers();
  }

  async getUserByID() {
    if (!this.#userId) throw new httpErrors.BadRequest('Missing required field: userId');

    const user = await getUserByID(this.#userId);

    if (!user) throw new httpErrors.NotFound('The requested user does not exists');

    return user;
  }

  async getAllUsers() {
    return await getAllUsers();
  }

  async removeUserByID() {
    if (!this.#userId) throw new httpErrors.BadRequest('Missing required field: userId');

    const user = await removeUserByID(this.#userId);

    if (!user) throw new httpErrors.NotFound('The requested user does not exists');

    return user;
  }

  async updateOneUser() {
    if (!this.#userId) throw new httpErrors.BadRequest('Missing required field: userId');

    const updatePassword = !!this.#password;
    const aux = {} as {
      salt?: string;
      hash?: string;
    };

    if (updatePassword) {
      const { salt, result: hash } = hashString(this.#password);

      aux.salt = salt;
      aux.hash = hash;
    }

    return await updateOneUser({
      id: this.#userId,
      name: this.#name,
      lastName: this.#lastName,
      email: this.#email,
      ...aux
    } as HydratedDocument<IUser>);
  }

  async login() {
    if (!this.#email) throw new httpErrors.BadRequest('Missing required field: email');

    if (!this.#password) throw new httpErrors.BadRequest('Missing required field: password');

    const user = await getOneUser({ email: this.#email });

    if (!user) throw new httpErrors.BadRequest('Bad credentials');

    const { salt, hash } = user;
    const { result } = hashString(this.#password, salt);

    if (hash !== result) throw new httpErrors.BadRequest('Bad credentials');

    return user;
  }
}

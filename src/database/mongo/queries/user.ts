import UserModel, { IUser } from '../models/user'
import { HydratedDocument } from 'mongoose'

/**
 * It saves a user to the database
 *
 * @returns A promise that resolves to the saved user
 */
export const saveUser: (
  user: IUser
) => Promise<HydratedDocument<IUser>> = async user => {
  const savedUser = new UserModel(user)

  await savedUser.save()

  return savedUser
}

/**
 * It gets a user by its ID
 *
 * @returns found user
 */
export const getUserByID: (
  id: string
) => Promise<HydratedDocument<IUser>> = async id => {
  const users = await UserModel.find({ id })

  return users[0]
}

/**
 * It gets all users
 *
 * @returns found users
 */
export const getAllUsers: () => Promise<
  HydratedDocument<IUser>[]
> = async () => {
  const users = await UserModel.find()

  return users
}

/**
 * It removes a user by its ID
 *
 * @returns found user
 */
export const removeUserByID: (
  id: string
) => Promise<HydratedDocument<IUser> | null> = async id => {
  const user = await UserModel.findOneAndRemove({ id })

  return user
}

// TODO: update role if necessary
/**
 * It updates a user by its ID
 *
 * @returns updated user
 */
export const updateOneUser: (
  user: IUser
) => Promise<HydratedDocument<IUser> | null> = async user => {
  const { id, firstName, lastName, email, salt, hash } = user
  const userUpdated = await UserModel.findOneAndUpdate(
    { id },
    {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(salt &&
        hash && {
          salt,
          hash
        })
    },
    { new: true }
  )

  return userUpdated
}

/**
 * It returns the first user in the database that matches the query
 *
 * @param {Object} query - The query object that will be used to find the user.
 * @returns The first user in the database
 */
export const getOneUser: (
  query?: object
) => Promise<HydratedDocument<IUser> | null> = async (query = {}) => {
  const users = await UserModel.find(query)

  return users[0]
}

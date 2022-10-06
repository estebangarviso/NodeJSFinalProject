import UserModel from '../models/user';
import { HydratedDocument } from 'mongoose';
import { IUser } from '../models/user';

/**
 * It saves a user to the database
 * @returns A promise that resolves to the saved user
 */
export const saveUser: (user: IUser) => Promise<HydratedDocument<IUser>> = async (user) => {
  const savedUser = new UserModel(user);

  await savedUser.save();

  return savedUser;
};

/**
 * @returns found user
 */
export const getUserByID: (id: string) => Promise<HydratedDocument<IUser>> = async (id) => {
  const users = await UserModel.find({ id });

  return users[0];
};

/**
 * @returns found users
 */
export const getAllUsers: () => Promise<HydratedDocument<IUser>[]> = async () => {
  const users = await UserModel.find();

  return users;
};

/**
 * @returns found user
 */
// export const removeUserByID = async (id) => {
export const removeUserByID: (id: string) => Promise<HydratedDocument<IUser> | null> = async (id) => {
  const user = await UserModel.findOneAndRemove({ id });

  return user;
};

// TODO: update role if necessary
/**
 * @returns updated user
 */
export const updateOneUser: (user: IUser) => Promise<HydratedDocument<IUser> | null> = async (user) => {
  const { id, name, lastName, email, salt, hash } = user;
  const userUpdated = await UserModel.findOneAndUpdate(
    { id },
    {
      ...(name && { name }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(salt &&
        hash && {
          salt,
          hash
        })
    },
    { new: true }
  );

  return userUpdated;
};

/**
 * It returns the first user in the database that matches the query
 * @param {Object} query - The query object that will be used to find the user.
 * @returns The first user in the database
 */
export const getOneUser: (query?: object) => Promise<HydratedDocument<IUser> | null> = async (query = {}) => {
  const users = await UserModel.find(query);

  return users[0];
};

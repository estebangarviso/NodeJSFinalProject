import UserTransactionModel, {
  IUserTransactions
} from '../models/userTransaction'
import { HydratedDocument, Types } from 'mongoose'
import httpErrors from 'http-errors'

/**
 *
 * @param userTransaction User transaction to be saved
 * @returns Saved user transaction
 */
export const saveUserTransaction: (
  userTransaction: IUserTransactions
) => Promise<HydratedDocument<IUserTransactions>> = async userTransaction => {
  const savedUserTransaction = new UserTransactionModel(userTransaction)
  await savedUserTransaction.save()

  return savedUserTransaction
}

/**
 * @param id User transaction id
 * @returns Found user transaction
 */
export const getOneUserTransaction: (
  id: string
) => Promise<HydratedDocument<IUserTransactions>> = async id => {
  const foundUserTransaction = await UserTransactionModel.findOne({
    id
  })
  if (!foundUserTransaction)
    throw new httpErrors.NotFound('User transaction not found')

  return foundUserTransaction
}

/**
 * @param userId User _id from user transaction
 * @returns All user transactions
 */
export const getAllUserTransactions: (
  userId: Types.ObjectId
) => Promise<HydratedDocument<IUserTransactions>[]> = async (
  userId: Types.ObjectId
) => {
  const foundUserTransactions = await UserTransactionModel.find({
    userId
  })
  if (!foundUserTransactions)
    throw new httpErrors.NotFound('User transactions not found')

  return foundUserTransactions
}

/**
 * @returns User transactions balance
 */
export const getUserTransactionsBalance: (
  userId: string
) => Promise<number> = async userId => {
  const userTransactions = await UserTransactionModel.find({ userId })
  const balance = userTransactions.reduce((acc, userTransaction) => {
    if (userTransaction.status === 'paid') return acc + userTransaction.amount

    return acc
  }, 0)

  return balance
}

/**
 * @param query Query to be used to find user transactions
 * @returns User transactions
 */
export const getUserTransactions: (
  query: object
) => Promise<HydratedDocument<IUserTransactions>[]> = async query => {
  const userTransactions = await UserTransactionModel.find(query)

  return userTransactions
}

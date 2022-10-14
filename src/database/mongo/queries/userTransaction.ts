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
 * Sum all user transactions by userId where entry is equal to debit and subtract all user transactions where entry is equal to credit
 * @returns User transactions balance
 */
export const getUserTransactionsBalance: (
  userId: Types.ObjectId
) => Promise<number> = async userId => {
  const foundUserTransactions = await UserTransactionModel.find({
    userId
  })
  if (!foundUserTransactions) return 0
  const balance = foundUserTransactions.reduce((acc, curr) => {
    if (curr.entry === 'debit') return acc + curr.amount
    if (curr.entry === 'credit') return acc - curr.amount
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

/**
 * @param query Query to be used to find one or more user transactions
 * @returns User transaction(s)
 */
export const getOneOrMoreUserTransactions: (
  query: object
) => Promise<HydratedDocument<IUserTransactions>[]> = async query => {
  const userTransactions = await UserTransactionModel.find(query)

  return userTransactions
}

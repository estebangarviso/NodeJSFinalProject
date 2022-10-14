import { model, Schema, Document, Types } from 'mongoose'
import {
  TRANSACTION_STATUS,
  TRANSACTION_ENTRIES
} from '../../../utils/userTransaction'

export interface IUserTransactions {
  id: string
  userId: Types.ObjectId
  receiverId: Types.ObjectId
  amount: number
  currencyId: Types.ObjectId
  status: string
  // If the user is customer and giving the amount to himself, the entry is debit (because the ecommerce is holding the money from the user) and
  // the other way around if the user is giving the amount to another user, that is salesman, is credit (because the salesman is holding the money from the ecommerce)
  // It represent the double entry in the accounting system (debit and credit, https://www.investopedia.com/terms/d/double-entry.asp)
  entry: string
}

const UserTransactionSchema = new Schema<IUserTransactions>(
  {
    id: {
      required: true,
      type: String,
      unique: true
    },
    userId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    receiverId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    amount: {
      required: true,
      type: Number
    },
    currencyId: {
      required: true,
      type: Schema.Types.ObjectId
    },
    status: {
      required: true,
      type: String,
      enum: TRANSACTION_STATUS
    },
    entry: {
      required: true,
      type: String,
      enum: TRANSACTION_ENTRIES
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

const UserTransactionModel = model('userTransactions', UserTransactionSchema)
export default UserTransactionModel

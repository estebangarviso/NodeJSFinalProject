import { model, Schema, Document, Types } from 'mongoose'
import { ORDER_STATUS } from '../../../utils/order'

export interface IOrder {
  trackingNumber: string
  userTransactionId: Types.ObjectId
  userId: Types.ObjectId
  currencyId: Types.ObjectId
  receiverId: Types.ObjectId
  currencyRate: number
  total: number
  details: {
    articleId: Types.ObjectId
    unitPrice: number
    quantity: number
  }[]
  status: string
}

export type TSubmitOrder = {
  userTransactionId: IOrder['userTransactionId']
  userId: IOrder['userId']
  receiverId: IOrder['receiverId']
  currencyId: IOrder['currencyId']
  total: IOrder['total']
  details: IOrder['details']
}

export type TBeforeSaveOrder = {
  trackingNumber: IOrder['trackingNumber']
  userTransactionId: string
  userId: string
  receiverId: string
  currencyId: string
  total: IOrder['total']
  details: {
    articleId: string
    quantity: number
    unitPrice?: number
  }[]
  currencyRate: number
  status: string
}

const OrderSchema = new Schema<IOrder>(
  {
    trackingNumber: {
      required: true,
      type: String,
      unique: true
    },
    userTransactionId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'userTransactions'
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
    currencyId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'currencies'
    },
    currencyRate: {
      required: true,
      type: Number
    },
    total: {
      required: true,
      type: Number
    },
    details: [
      {
        articleId: {
          required: true,
          type: Schema.Types.ObjectId,
          ref: 'articles'
        },
        unitPrice: {
          required: true,
          type: Number
        },
        quantity: {
          required: true,
          type: Number
        }
      }
    ],
    status: {
      required: true,
      type: String,
      enum: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED]
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: {
      transform: (_, ret: Document<IOrder>) => {
        delete ret._id
      }
    }
  }
)

const OrderModel = model('orders', OrderSchema)
export default OrderModel

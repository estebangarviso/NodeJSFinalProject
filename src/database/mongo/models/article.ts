import { model, Schema, Document, Types } from 'mongoose'
import { ARTICLE_UNITIES } from './../../../utils/article'

export interface IArticle {
  id: string
  sku: string
  title: string
  shortDescription: string
  unity: string
  qtyStock: number // TODO: remove if product depends on multiple warehouses
  unitPrice: number
  currencyId: Types.ObjectId
  isVirtual: boolean
  isAvailable: boolean
  isDeleted: boolean
  // TODO: Add more fields like images, taxId, etc.
}

const ArticleSchema = new Schema<IArticle>(
  {
    id: {
      required: true,
      type: String,
      unique: true
    },
    sku: {
      required: true,
      type: String,
      unique: true
    },
    title: {
      required: true,
      type: String
    },
    shortDescription: {
      required: true,
      type: String
    },
    qtyStock: {
      type: Number,
      default: 0
    },
    unity: {
      required: true,
      type: String,
      enum: ARTICLE_UNITIES
    },
    unitPrice: {
      required: true,
      type: Number
    },
    currencyId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'currencies'
    },
    isVirtual: {
      required: true,
      type: Boolean
    },
    isAvailable: {
      required: true,
      type: Boolean
    },
    isDeleted: {
      required: true,
      type: Boolean
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: {
      transform: (_, ret) => {
        delete ret._id
        return ret
      }
    }
  }
)

const ArticleModel = model('articles', ArticleSchema)
export default ArticleModel

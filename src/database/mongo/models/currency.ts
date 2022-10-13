import { model, Schema, Document } from 'mongoose'
import { CURRENCY_SYMBOLS } from '../../../utils/currency'

export interface ICurrency {
  id: string
  name: string
  symbol: string
  rate: number
  decimals: number
  sign: string
  isDefault: boolean
}

const CurrencySchema = new Schema(
  {
    id: {
      required: true,
      type: String,
      unique: true
    },
    name: {
      required: true,
      type: String
    },
    symbol: {
      required: true,
      type: String,
      enum: CURRENCY_SYMBOLS
    },
    rate: {
      required: true,
      type: Number
    },
    decimals: {
      required: true,
      type: Number,
    },
    sign: {
      required: true,
      type: String,
    },
    isDefault: {
      required: true,
      type: Boolean,
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: {
      transform: (_, ret: Document<ICurrency>) => {
        delete ret._id
      }
    }
  }
)

// Before save refresh isDefault update the default currency isDefault to false
CurrencySchema.pre('save', async function (next) {
  if (this.isModified('isDefault') && this.isDefault) {
    const defaultCurrency = await CurrencyModel.findOne({ isDefault: true })

    if (defaultCurrency) {
      defaultCurrency.isDefault = false
      await defaultCurrency.save()
    }
  }

  next()
})

// After save refresh all rates by default currency rate. eg: if default currency was USD and now is CLP, all rates will be multiplied by the new rate (CLP/USD)
CurrencySchema.post('save', async function () {
  if (this.isModified('isDefault') && this.isDefault) {
    const currencies = await CurrencyModel.find({ isDefault: false })
    const defaultCurrency = await CurrencyModel.findOne({ isDefault: true })

    if (currencies && defaultCurrency) {
      defaultCurrency.rate = 1
      for (const currency of currencies) {
        currency.rate = currency.rate / defaultCurrency.rate // eg: Previous scene USD was default and its value is 925,93 CLP. Currency scene default currency is CLP, so USD rate will be  1 / 925,93 = 0.00108
        await currency.save()
      }
      // Save default currency rate
      defaultCurrency.rate = 1
      await defaultCurrency.save()
    }
  }
})

const CurrencyModel = model('currencies', CurrencySchema)
export default CurrencyModel

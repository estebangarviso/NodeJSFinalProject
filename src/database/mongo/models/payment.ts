import { model, Schema } from 'mongoose';

export interface IPayments {
  id: string;
  paidTo: Schema.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
}

const PaymentSchema = new Schema<IPayments>(
  {
    id: {
      required: true,
      type: String,
      unique: true
    },
    paidTo: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users'
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: {
      transform: (_, ret) => {
        delete ret._id;
      }
    }
  }
);

const PaymentModel = model('payments', PaymentSchema);
export default PaymentModel;

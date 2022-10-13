import { Type } from '@sinclair/typebox'

export const storeUserTransactionSchema = Type.Object({
  givenTo: Type.String(),
  amount: Type.Number()
})

export const userTransactionIDSchema = Type.Object({
  transferId: Type.String({ minLength: 21, maxLength: 21 })
})
export const userTransactionStatusSchema = Type.Object({
  status: Type.String()
})

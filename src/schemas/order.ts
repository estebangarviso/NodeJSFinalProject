import { Type } from '@sinclair/typebox'

export const storeOrderSchema = Type.Object({
  userId: Type.String({ minLength: 21, maxLength: 21 }),
  currencyId: Type.String({ minLength: 21, maxLength: 21 }),
  total: Type.Number(),
  details: Type.Array(
    Type.Object({
      articleId: Type.String({ minLength: 21, maxLength: 21 }),
      unitPrice: Type.Number(),
      quantity: Type.Number()
    })
  )
})

export const orderTrackingNumberSchema = Type.Object({
  trackingNumber: Type.String({ minLength: 21, maxLength: 21 })
})

export const updateOrderSchema = Type.Partial(storeOrderSchema)

import { Type } from '@sinclair/typebox'

export const storeArticleSchema = Type.Object({
  title: Type.String(),
  shortDescription: Type.String(),
  unity: Type.Optional(Type.String()),
  qtyStock: Type.Optional(Type.Number()),
  unitPrice: Type.Optional(Type.Number()),
  isVirtual: Type.Optional(Type.Boolean()),
  isAvailable: Type.Optional(Type.Boolean())
})

export const articleIDSchema = Type.Object({
  id: Type.String({ minLength: 21, maxLength: 21 })
})

export const updateArticleSchema = Type.Partial(storeArticleSchema)

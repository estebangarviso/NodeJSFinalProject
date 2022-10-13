import { Type } from '@sinclair/typebox'

export const storeUserSchema = Type.Object({
  firstName: Type.String({ minLength: 2 }),
  lastName: Type.String({ minLength: 2 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
  roleId: Type.Optional(Type.Number())
})

export const updateUserSchema = Type.Partial(storeUserSchema)

export const userIDSchema = Type.Object({
  id: Type.String({ minLength: 21, maxLength: 21 })
})

export const userLoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({
    minLength: 8
  })
})

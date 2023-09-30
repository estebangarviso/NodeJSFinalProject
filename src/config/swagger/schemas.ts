import { IArticle } from '../../database/mongo/models/article'
import { ICurrency } from '../../database/mongo/models/currency'
import { IOrder } from '../../database/mongo/models/order'
import { IUser } from '../../database/mongo/models/user'
import { IUserTransactions } from '../../database/mongo/models/userTransaction'
import { IResponse } from '../../network/routes/response'

type SwaggerPropertyType = 'string' | 'number' | 'boolean' | 'array' | 'object'
type SwaggerProperty =
  | {
      type: SwaggerPropertyType
    }
  | {
      type: 'array'
      items: SwaggerProperty
    }
  | {
      type: 'object'
      properties: Record<string, SwaggerProperty>
    }
  | {
      type: 'string'
      enum?: string[]
    }
  | {
      type: 'number'
      enum?: number[]
    }
  | {
      type: 'boolean'
      enum?: boolean[]
    }
interface SwaggerSchema<T> {
  type: SwaggerPropertyType
  properties: Record<keyof T, SwaggerProperty>
}

const ArticleResponse: SwaggerSchema<Omit<IArticle, 'id'>> = {
  type: 'object',
  properties: {
    sku: { type: 'string' },
    title: { type: 'string' },
    shortDescription: { type: 'string' },
    unity: { type: 'string' },
    qtyStock: { type: 'number' },
    unitPrice: { type: 'number' },
    currencyId: { type: 'string' },
    isVirtual: { type: 'boolean' },
    isAvailable: { type: 'boolean' },
    isDeleted: { type: 'boolean' }
  }
}

const ArticleRequestBody: SwaggerSchema<
  Omit<IArticle, 'id' | 'currencyId' | 'isDeleted' | 'sku'>
> = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    shortDescription: { type: 'string' },
    unity: { type: 'string' },
    qtyStock: { type: 'number' },
    unitPrice: { type: 'number' },
    isVirtual: { type: 'boolean' },
    isAvailable: { type: 'boolean' }
  }
}

const CurrencyResponse: SwaggerSchema<Omit<ICurrency, 'id'>> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    symbol: { type: 'string' },
    rate: { type: 'number' },
    decimals: { type: 'number' },
    sign: { type: 'string' },
    isDefault: { type: 'boolean' }
  }
}

const CurrencyRequestBody: SwaggerSchema<Omit<ICurrency, 'id'>> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    symbol: { type: 'string' },
    rate: { type: 'number' },
    decimals: { type: 'number' },
    sign: { type: 'string' },
    isDefault: { type: 'boolean' }
  }
}

const OrderResponse: SwaggerSchema<Omit<IOrder, 'id'>> = {
  type: 'object',
  properties: {
    trackingNumber: { type: 'string' },
    userTransactionId: { type: 'string' },
    userId: { type: 'string' },
    currencyId: { type: 'string' },
    receiverId: { type: 'string' },
    currencyRate: { type: 'number' },
    total: { type: 'number' },
    details: { type: 'array', items: { type: 'object' } },
    status: { type: 'string' }
  }
}

const UserResponse: Record<keyof Omit<IUser, 'hash' | 'salt' | 'id'>, any> = {
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  email: { type: 'string' },
  roleId: { type: 'string' },
  secureToken: { type: 'string' }
}

const UserTransactionsResponse: SwaggerSchema<Omit<IUserTransactions, 'id'>> = {
  type: 'object',
  properties: {
    userId: { type: 'string' },
    receiverId: { type: 'string' },
    amount: { type: 'number' },
    currencyId: { type: 'string' },
    status: { type: 'string' },
    entry: { type: 'string' }
  }
}

const Response: SwaggerSchema<IResponse> = {
  type: 'object',
  properties: {
    error: { type: 'boolean' },
    message: { type: 'object' },
    status: { type: 'number' }
  }
}

const HealthcheckResponse = {
  type: 'string'
}

export default {
  ArticleResponse,
  ArticleRequestBody,
  CurrencyResponse,
  CurrencyRequestBody,
  OrderResponse,
  UserResponse,
  UserTransactionsResponse,
  Response,
  HealthcheckResponse
}

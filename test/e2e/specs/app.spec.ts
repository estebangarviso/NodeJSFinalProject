import axios from 'axios'
import server from '../../../src/network/server'
import { faker } from '@faker-js/faker'
import { TUser } from '../../../src/database/mongo/models/user'
import { IArticle } from '../../../src/database/mongo/models/article'

beforeAll(async () => {
  await server.start()
})

afterAll(async () => {
  await server.stop()
})

describe('E2E tests: Use cases for the App', () => {
  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()
  const email = faker.internet.email(firstName, lastName).toLowerCase()
  const password = faker.internet.password(8)
  const newCustomer = {
    firstName,
    lastName,
    email,
    password,
    roleId: 2
  }
  const newSalesman = {
    firstName,
    lastName,
    email,
    password,
    roleId: 1
  }
  const newArticles = [
    {
      sku: `${faker.commerce.product().toLowerCase()}-${faker.random.numeric(
        3
      )}`,
      title: faker.commerce.productName(),
      shortDescription: faker.commerce.productDescription(),
      unity: 'ea',
      qtyStock: faker.random.numeric(2),
      unitPrice: faker.commerce.price(1000, 10000)
    },
    {
      sku: `${faker.commerce.product().toLowerCase()}-${faker.random.numeric(
        3
      )}`,
      title: faker.commerce.productName(),
      shortDescription: faker.commerce.productDescription(),
      unity: 'ea',
      qtyStock: faker.random.numeric(2),
      unitPrice: faker.commerce.price(1000, 10000)
    },
    {
      sku: `${faker.commerce.product().toLowerCase()}-${faker.random.numeric(
        3
      )}`,
      title: faker.commerce.productName(),
      shortDescription: faker.commerce.productDescription(),
      unity: 'ea',
      qtyStock: faker.random.numeric(2),
      unitPrice: faker.commerce.price(1000, 10000)
    }
  ]
  const newAmountToDeposit = faker.commerce.price(100000, 1000000)

  const customerTokens = {
    accessToken: '',
    refreshToken: ''
  }
  const salesmanTokens = {
    accessToken: '',
    refreshToken: ''
  }
  const profiles: {
    customer?: TUser
    salesman?: TUser
  } = {}

  const articles: {
    one?: any
    two?: any
    three?: any
  } = {}

  describe('POST /api/user', () => {
    it('should be able to create (sign up) a new customer', async () => {
      const response = await axios.post('/user/signup', newCustomer)
      expect(response.status).toBe(201)
    }),
      it('should be able to login a customer and get an access tokens', async () => {
        const keys = ['accessToken', 'refreshToken']
        const {
          data: { message }
        } = await axios.post('/user/login', {
          email: newCustomer.email,
          password: newCustomer.password
        })
        expect(Object.keys(message)).toEqual(keys)
        customerTokens.accessToken = message.accessToken
        customerTokens.refreshToken = message.refreshToken
      }),
      it('should be able to create (sign up) a new salesman', async () => {
        const response = await axios.post('/user/signup', newSalesman)
        expect(response.status).toBe(201)
      }),
      it('should be able to login a salesman and get an access tokens', async () => {
        const keys = ['accessToken', 'refreshToken']
        const {
          data: { message }
        } = await axios.post('/user/login', {
          email: newSalesman.email,
          password: newSalesman.password
        })
        expect(Object.keys(message)).toEqual(keys)
        salesmanTokens.accessToken = message.accessToken
        salesmanTokens.refreshToken = message.refreshToken
      }),
      it('salesman should be able to save a new articles', async () => {
        const articleProcessed: [] | IArticle[] = []
        for (const article of newArticles) {
          const { data } = await axios.post<{
            message: IArticle
          }>('/article', article, {
            headers: {
              Authorization: `Bearer ${salesmanTokens.accessToken}`
            }
          })
          articleProcessed.push(data.message)
        }
        expect(articleProcessed.length).toBe(3)
        articles.one = articleProcessed[0]
        articles.two = articleProcessed[1]
        articles.three = articleProcessed[2]
      }),
      describe('GET /api/user', () => {
        it('should be able to get customer profile data with access token', async () => {
          const response = await axios.get('/user/profile', {
            headers: {
              Authorization: `Bearer ${customerTokens.accessToken}`
            }
          })
          const { data: message } = response
          expect(response.status).toBe(200)
          expect(message).toHaveProperty('firstName')
          expect(message).toHaveProperty('lastName')
          expect(message).toHaveProperty('email')
          expect(message).toHaveProperty('roleId')
          expect(message).toHaveProperty('id')
          expect(message).toHaveProperty('createdAt')
          expect(message).toHaveProperty('updatedAt')
          profiles.customer = message
        }),
          it('should be able to get salesman profile data with access token', async () => {
            const response = await axios.get('/user/profile', {
              headers: {
                Authorization: `Bearer ${salesmanTokens.accessToken}`
              }
            })
            const { data: message } = response
            expect(response.status).toBe(200)
            expect(message).toHaveProperty('firstName')
            expect(message).toHaveProperty('lastName')
            expect(message).toHaveProperty('email')
            expect(message).toHaveProperty('roleId')
            expect(message).toHaveProperty('id')
            expect(message).toHaveProperty('createdAt')
            expect(message).toHaveProperty('updatedAt')
            profiles.salesman = message
          }),
          test('customer tries to bought an article with any money, should be rejected', async () => {
            const response = await axios.post('/order', {
              data: {
                status: 'pending',
                details: [
                  {
                    articleId: articles.one._id,
                    quantity: faker.random.numeric(1)
                  },
                  {
                    articleId: articles.two._id,
                    quantity: faker.random.numeric(1)
                  },
                  {
                    articleId: articles.three._id,
                    quantity: faker.random.numeric(1)
                  }
                ]
              }
            })
          }),
          it('the customer should be able to transfer cash to himself', async () => {
            if (!profiles.customer)
              throw new Error('Customer profile is not defined')
            const {
              data: { message: user }
            } = await axios.get(`/transfer/user/${profiles.customer.id}`, {
              headers: {
                authorization: `Bearer ${customerTokens.accessToken}`
              }
            })
            const amount = newAmountToDeposit
            const {
              data: { message: credit }
            } = await axios.post(
              `/transfer/user/${user.id}`,
              { amount },
              {
                headers: {
                  authorization: `Bearer ${customerTokens.accessToken}`
                }
              }
            )
            expect(credit.amount).toBe(amount)
            expect(credit.status).toBe('paid')
            expect(credit.entry).toBe('debit') // accounting double entry. The ownership of the money is transferred from the customer to the customer so the ecommerce is holding the customer's money
          }),
          it('the salesman should be able to approve transaction', async () => {
            if (!profiles.salesman)
              throw new Error('Salesman profile is not defined')
            const response = await axios.get(
              `/transfer/owner/${profiles.salesman.id}`,
              {
                headers: {
                  authorization: `Bearer ${salesmanTokens.accessToken}`
                },
                data: {
                  status: 'paid'
                }
              }
            )

            const { data: message } = response
            expect(response.status).toBe(200)
            expect(message).toHaveProperty('amount')
            expect(message).toHaveProperty('status')
            expect(message).toHaveProperty('id')
            expect(message).toHaveProperty('userId')
            expect(message).toHaveProperty('createdAt')
            expect(message).toHaveProperty('updatedAt')
          })
      })
  })
})

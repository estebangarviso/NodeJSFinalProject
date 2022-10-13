import axios from 'axios'
import server from '../../../src/network/server'
import { faker } from '@faker-js/faker'

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
  const newUser = {
    firstName,
    lastName,
    email,
    password
  }

  const tokens = {
    accessToken: '',
    refreshToken: ''
  }

  const userId = ''
  describe('POST /api/user', () => {
    it('should be able to create (sign up) a new user', async () => {
      const response = await axios.post('/user/signup', newUser)
      expect(response.status).toBe(201)
    }),
      it('should be able to login a user and get an access tokens', async () => {
        const keys = ['accessToken', 'refreshToken']
        const {
          data: { message }
        } = await axios.post('/user/login', {
          email: newUser.email,
          password: newUser.password
        })
        expect(Object.keys(message)).toEqual(keys)
        tokens.accessToken = message.accessToken
        tokens.refreshToken = message.refreshToken
      })
  }),
    describe('GET /api/user', () => {
      it('should be able to get user data', async () => {
        const response = await axios.get('/user/profile', {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`
          }
        })
        const { data: message } = response
        expect(response.status).toBe(200)
      }),
        it('should be able to transfer cash to himself as credit', async () => {
          const {
            data: { message: user }
          } = await axios.get(`/transfer/user/${userId}`, {
            headers: {
              authorization: `Bearer ${tokens.accessToken}`
            }
          })
          const amount = 1000
          const {
            data: { message: credit }
          } = await axios.post(
            `/user/${user.id}/credit`,
            { amount },
            {
              headers: {
                authorization: `Bearer ${tokens.accessToken}`
              }
            }
          )
          expect(credit.amount).toBe(amount)
        })
    })
})

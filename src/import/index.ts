import server from '../network/server'
import axios from 'axios'
import { faker } from '@faker-js/faker'
import { URL } from '../config'
import currencies from './currencies.json'
import roles from './roles.json'
import articles from './articles.json'
import { TSubmitUser } from '../database/mongo/models/user'
import UserService from '../services/user'

axios.defaults.baseURL = `${URL}/api`
const fakeSalesman: TSubmitUser = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email().toLowerCase(),
  password: faker.internet.password(8),
  roleId: 1
}
let accessToken = ''
let userId = ''

const importCurrencies = async () => {
  for (const currency of currencies) {
    const response = await axios.post('/currency', currency)
    if (response.status !== 201) {
      console.error(`Error importing currency ${currency.name}`)
    } else {
      console.success(`Currency ${currency.name} imported`)
    }
  }
}

const importRoles = async () => {
  for (const role of roles) {
    const response = await axios.post('/role', role)
    if (response.status !== 201) {
      console.error(`Error importing role ${role.name}`)
    } else {
      console.success(`Role ${role.name} imported`)
    }
  }
}

const importSalesman = async () => {
  const response = await axios.post('/user/signup', fakeSalesman)
  if (response.status !== 201) {
    console.error(`Error importing salesman`)
  } else {
    console.success(`Salesman imported`)
  }
}

const login = async () => {
  const { email, password } = fakeSalesman
  const response = await axios.post('/user/login', {
    email,
    password
  })
  if (response.status !== 200) {
    console.error(`Error logging in`)
  } else {
    console.success(`Logged in`)
    accessToken = response.data.message.accessToken

    const user = await new UserService({ email, password }).login()
    userId = user.id
  }
}

const importArticles = async () => {
  for (const article of articles) {
    const response = await axios.post('/article', article, {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    if (response.status !== 201) {
      console.error(`Error importing article ${article.sku}`)
    } else {
      console.success(`Article ${article.sku} imported`)
    }
  }
}

const deleteFakeSalesman = async () => {
  const response = await axios.delete(`/user/${userId}`, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  })
  if (response.status !== 200) {
    console.error(`Error deleting salesman`)
  } else {
    console.success(`Salesman deleted`)
  }
}

const main = async () => {
  await server.start()
  await importCurrencies()
  await importRoles()
  await importSalesman()
  await login()
  await importArticles()
  await deleteFakeSalesman()
  await server.stop()

  process.exit(0)
}

main()

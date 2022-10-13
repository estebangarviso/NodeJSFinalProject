<p align="center"><img src="logo.png" style="height: 300px; width: auto;" /></p>

<h1 align="center">Ecommerce backend with Node.js</h1>

## e2e Testing steps

- [x] Save a new user as a customer
  - [x] Login with the customer
- [x] Save user cash as credits to the wallet (wallets are user transactions with a type of credit)
- [x] Save an user as a seller
  - [x] Login with the new seller
- [x] Only seller can save a new article with a price
- [ ] Customer tries to buy the article
  - [ ] The customer has not enough cash, the article is not bought and the customer has to add enough money in order to buy it
  - [ ] The customer has enough cash, the article is bought and its stock is reduced by purchased quantity
- [ ] The seller has received the money from the customer (customer's and seller's wallets are updated after the purchase)
- [ ] The article goes to the customer's account > purchase history (seller's article inventory is updated after the purchase)

## Requirements

- Node.js v16 (use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions.)
- yarn v1.22 (minimum)
- Create an `.env` file that looks like the `.env.example` file.
- Import database with `yarn db:import`

## Installation

```bash
$ nvm install 16
$ nvm use 16 # Manual call to use the right Node.js version
# Automatic call node version by .nvmrc reference: https://github.com/nvm-sh/nvm#bash, so when you open a new terminal, the right Node.js version will be used
$ yarn install
```

## Running the app

```bash
# development
$ yarn dev

# production mode
$ yarn build

# run production build
$ yarn start
```

## Usage

```bash
# run tests with coverage
$ yarn test
```

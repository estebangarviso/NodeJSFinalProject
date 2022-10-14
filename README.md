<p align="center"><img src="logo.png" style="height: 300px; width: auto;" /></p>

<h1 align="center">Ecommerce backend with Node.js</h1>

## e2e Testing steps

- [x] Save a new user as a customer
  - [x] Login with the customer
- [x] Save user cash as debit to the wallet (wallets are user transactions with a entry of debit 'cause the ecommerce is holding the money)
- [x] Save an user as a seller
  - [x] Login with the new seller
- [x] Only seller can save a new article with a price
- [x] Customer tries to buy the article
  - [x] The customer has not enough cash, the article is not bought and the customer has to add enough money in order to buy it
  - [x] The customer has enough cash, the article is bought and its stock is reduced by purchased quantity
- [ ] The seller has received the money from the customer (customer's and seller's wallets are updated after the purchase)
- [ ] The article goes to the customer's account > purchase history (seller's article inventory is updated after the purchase)

## Requirements

- Node.js v16 (use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions.)
- yarn v1.22 (minimum)
- Create an `.env` file that looks like the `.env.example` file.
- Import default sample database records with `yarn import:db` script then CTRL+C to stop the script.

## Installation

```bash
$ nvm install 16
$ nvm use 16 # Manual call to use the right Node.js version
# Automatic call node version by .nvmrc reference: https://github.com/nvm-sh/nvm#bash, so
# when you open a new terminal, the right Node.js version will be used
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
# run tests
$ yarn test
# run tests with coverage
$ yarn test:coverage
# run tests with verbose output
$ yarn test:verbose
# run tests with watch mode
$ yarn test:watch
# inspect code linting
$ yarn lint
# fix code linting
$ yarn lint:fix
# import default sample database records, be sure
# to have a running mongodb engine running and database empty (with no records)
$ yarn import:db
```

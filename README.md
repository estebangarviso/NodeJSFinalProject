<p align="center"><img src="logo.png" style="height: 300px; width: auto;" /></p>

<h1 align="center">Ecommerce backend with Node.js</h1>

## Test Plans - e2e

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

- Node.js v18 (use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions.)
- pnpm v8 (minimum)
- Create an `.env` file that looks like the `.env.example` file.
- Import default sample database records with `pnpm import:db` script then CTRL+C to stop the script.

## Installation

```bash
$ nvm install 18
$ nvm use 18 # Manual call to use the right Node.js version
# Automatic call node version by .nvmrc reference: https://github.com/nvm-sh/nvm#bash, so
# when you open a new terminal, the right Node.js version will be used
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm dev

# production mode
$ pnpm build

# run production build (will run the build script if not built yet)
$ pnpm start
```

## Usage

```bash
# run tests
$ pnpm test
# run tests with coverage
$ pnpm test:coverage
# run tests with verbose output
$ pnpm test:verbose
# run tests with watch mode
$ pnpm test:watch
# inspect code linting
$ pnpm lint
# fix code linting
$ pnpm lint:fix
# import default sample database records, be sure
# to have a running mongodb engine running and database empty (with no records)
$ pnpm import:db
```

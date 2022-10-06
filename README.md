<p align="center"><img src="logo.png" style="height: 300px; width: auto;" /></p>

<h1 align="center">Ecommerce backend with Node.js</h1>

## e2e Testing steps

- [x] Record a new user as a customer
  - [ ] Login with the customer
- [ ] Record user balance
- [ ] Record an user as a seller
  - [ ] Login with the new seller
- [ ] Record a new article with a seller price
- [ ] Customer tries to buy the article
  - [ ] The customer has not enough balance, the article is not bought and the customer has to add enough money to buy the article
  - [ ] The customer has enough balance, the article is bought
- [ ] The balance of the customer is updated after the purchase and the seller balance is updated too
- [ ] The article quantity is updated after the purchase, this means the seller inventory is updated and the customer has the article in his purchases history

## Requirements

- Node.js v16 (minimum)
- yarn v1.22 (minimum)
- Create an `.env` file that looks like the `.env.example` file.

## Installation

```bash
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
$ yarn test:cov
```

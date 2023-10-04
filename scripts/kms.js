// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require('@aws-sdk/client-secrets-manager')
const fs = require('fs')

const secret_name = `${process.env.APP_ENV}/ecommerce`

const client = new SecretsManagerClient({
  region: 'us-east-2'
})

const run = async () => {
  let response

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: 'AWSCURRENT' // VersionStage defaults to AWSCURRENT if unspecified
      })
    )
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    console.error('KMSError', error)
    throw error
  }

  const secret = JSON.parse(response.SecretString)
  const env = Object.keys(secret).reduce((acc, key) => {
    return `${acc}${key}=${secret[key]}\n`
  }, '')

  // Create .env file
  fs.writeFileSync('.env', env)
}

run()

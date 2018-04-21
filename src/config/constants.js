import { config } from 'dotenv/config'

const devConfig = {}

const prodConfig = {
  DB_HOST: process.env.DB_HOST,
  PROD_DATABASE: process.env.PROD_DATABASE,
  PROD_USER: process.env.PROD_USER,
  PROD_PASSWORD: process.env.PROD_PASSWORD,
  PROD_PORT: process.env.PROD_PORT,
  DATABASE: process.env.DATABASE,
  DATABASE_URL: process.env.DATABASE_URL,
}

const defaultConfig = {
  PORT: process.env.PORT || 3010,
  JWT_SECRET: process.env.JWT_SECRET,
  GRAPHQL_URL: process.env.GRAPHQL_URL,
  GRAPHQL_SUBSCRIPTIONS_URL: process.env.GRAPHQL_SUBSCRIPTIONS_URL,
  GRAPHQL_SECRET: process.env.GRAPHQL_SECRET
}

function envConfig(env) {
  switch (env) {
    case 'dev':
      return devConfig
    case 'prod':
      return prodConfig
    default:
      return prodConfig
  }
}

export default Object.assign(defaultConfig, envConfig(process.env.NODE_ENV))

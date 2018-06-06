import express from 'express'
import path from 'path'
import constants from './config/constants'
import cors from 'cors'
import bodyParser from 'body-parser'
import { knex } from './config/database'
import knexConfig from './knexfile'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas'
import { makeExecutableSchema } from 'graphql-tools'
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { createServer } from 'http'
import { Model } from 'objection'
import { Post, User } from './models'
import jwt from 'jsonwebtoken'
import formidable from 'formidable'

const app = express()
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')))
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers'))
)
const schema = makeExecutableSchema({ typeDefs, resolvers })

Model.knex(knex)

const addUser = async req => {
  try {
    const token = req.headers.authorization
    if (token) {
      const user = await jwt.verify(token.split(' ')[1], constants.JWT_SECRET)
      req.user = user
    } else {
      req.user = null
    }
  } catch (err) {
    console.log(err)
  }
  req.next()
}

app.use(cors())
app.use(addUser)
const uploadDir = 'files'

const fileMiddleware = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next()
  }

  const form = formidable.IncomingForm({
    uploadDir
  })

  form.parse(req, (error, { operations }, files) => {
    if (error) {
      console.log(error)
    }

    const document = JSON.parse(operations)

    if (Object.keys(files).length) {
      const { file: { type, path: filePath } } = files
      console.log('type', type)
      console.log('filePath', filePath)
      document.variables.file = {
        type,
        path: filePath
      }
    }

    req.body = document
    next()
  })
}

app.use(
  '/graphql',
  bodyParser.json(),
  fileMiddleware,
  graphqlExpress(req => ({
    schema,
    context: {
      user: req.user,
      SECRET: constants.JWT_SECRET,
      serverUrl: `${req.protocol}://${req.get('host')}`
    }
  }))
)

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: constants.GRAPHQL_SUBSCRIPTIONS_URL
  })
)

const ws = createServer(app)

ws.listen(constants.PORT, err => {
  if (err) {
    console.log(`Error: ${err}`)
  } else {
    new SubscriptionServer(
      {
        schema,
        subscribe,
        execute
      },
      {
        server: ws,
        path: '/subscriptions'
      }
    )
    console.log(`
      App listening on ${constants.PORT}
      Env: ${process.env.NODE_ENV}
    `)
  }
})

export default app

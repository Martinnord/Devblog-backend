import GraphQLDate from 'graphql-date'
import User from '../models/user'
import Post from '../models/post'
import bcrypt from 'bcryptjs'
import { promisify } from 'util'
import { knex } from '../config/database'
import yup from 'yup'
import _ from 'lodash'
import jwt from 'jsonwebtoken'
import constants from '../config/constants'
import { requireAuth } from '../services/auth'

const hashAsync = promisify(bcrypt.hash)

const schema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required('Please enter an email address'),
  username: yup.string().required('Please enter an username'),
  password: yup
    .string()
    .required('Please enter a password')
    .min(5)
})

export default {
  Date: GraphQLDate,
  User: {
    posts: ({ id }) => {
      return Post.query()
        .where('user_id', id)
        .orderBy('created_at', 'desc')
    }
  },
  Query: {
    currentUser: async (_, args, { user }) => {
      if (user) {
        return User.query().findById(user.id)
      }
      return null
    },
    getAllUsers: async () => {
      return User.query()
    },
    getUser: async (_, args) => {
      const user = await User.query()
        .where('username', args.username)
        .first()
      return user
    }
  },
  Mutation: {
    login: async (_, { email, password }, { SECRET }) => {
      // Finding the user
      const user = await knex('users')
        .where('email', email)
        .first()

      if (!user) {
        throw new Error('Invalid email/password')
      }

      // Validating the password
      const validPassword = await bcrypt.compare(password, user.password)

      if (!validPassword) {
        throw new Error('Invalid email/password')
      }

      // Adding a jwt token to the user
      user.jwt = jwt.sign({ id: user.id }, SECRET)
      console.log(user)

      return user
    },
    register: async (_, { email, username, password }, { SECRET }) => {
      await schema.validate({ email, username, password })
      const users = await knex('users').where('email', email)

      const userExists =
        (await knex('users')
          .where({ email })
          .orWhere({ username })).length === 1

      if (userExists) {
        throw new Error('Email/username already in use')
      } else {
        const hashedPassword = await hashAsync(password, bcrypt.genSaltSync(10))

        const user = await User.query().insert({
          email,
          username,
          password: hashedPassword
        })

        // Adding a jwt token to the user
        user.jwt = jwt.sign({ id: user.id }, SECRET)

        return user
      }
    },
    updateUserInfo: async (_, args, { user }) => {
      // Should be able to update password later
      try {
        // const user = User.query().findById(user.id)
        await requireAuth(user)
        return User.query().patchAndFetchById(user.id, {
          username: args.username,
          email: args.email,
          name: args.name,
          profile_image: args.profile_image,
          website_url: args.website_url,
          bio: args.bio,
          location: args.location,
          work_status: args.work_status,
          twitter_username: args.twitter_username,
          github_username: args.github_username
        })
      } catch (err) {
        throw err
      }
    }
  }
}

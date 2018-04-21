import GraphQLDate from 'graphql-date'
import Post from '../models/post'
import User from '../models/user'
import PostLikes from '../models/PostLikes'
import yup from 'yup'
import { knex } from '../config/database'
import { PubSub, withFilter } from 'graphql-subscriptions'
import { requireAuth } from '../services/auth'

const pubsub = new PubSub()

const POST_LIKED = 'POST_LIKED'

export default {
  Subscription: {
    postLiked: {
      subscribe: () => pubsub.asyncIterator(POST_LIKED)
    }
  },
  Date: GraphQLDate,
  Post: {
    user: ({ user_id }) => {
      return User.query().findById(user_id)
    },
    likes: async ({ id, user_id }) => {
      return await PostLikes.query()
        .where('post_id', id)
        .select('users.username', 'users.profile_image')
        .from('post_likes')
        .fullOuterJoin('users', 'post_likes.user_id', 'users.id')
    }
  },
  Query: {
    getAllPosts: async () => {
      return await Post.query().orderBy('created_at', 'desc')
    },
    getPost: async (_, { id }) => {
      return await Post.query().findById(id)
    },
    getUserPosts: async (_, args, { user }) => {
      try {
        return await Post.query().where('user_id', user.id)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createPost: async (_, { title, content, image_url }, { user }) => {
      try {
        await requireAuth(user)
        return await Post.query().insert({
          title,
          content,
          image_url,
          user_id: user.id
        })
      } catch (err) {
        throw err
      }
    },
    updatePost: async (_, { id, title, content, image_url }, { user }) => {
      try {
        await requireAuth(user)
        return await Post.query().patchAndFetchById(id, {
          title,
          content,
          image_url
        })
      } catch (err) {
        throw err
      }
    },
    deletePost: async (_, { id }, { user }) => {
      try {
        await requireAuth(user)
        return await Post.query().deleteById(id)
      } catch (err) {
        throw err
      }
    },
    likePost: async (_, { id }, { user }) => {
      try {
        await requireAuth(user)

        const alreadyLiked =
          (await knex('post_likes')
            .where({ post_id: id })
            .andWhere({ user_id: user.id })).length === 1

        if (alreadyLiked) {
          // TODO: If the user already have liked the post, "un-like it!"
          throw new Error('You have already liked this post ONCE')
          return
        }

        const newLike = await PostLikes.query()
          .where('post_id', id)
          .insert({
            user_id: user.id,
            post_id: parseInt(id)
          })

        const pupsubb = pubsub.publish(POST_LIKED, {
          postLiked: {
            id: newLike.post_id,
            user_id: user.id
          }
        })

        return newLike
      } catch (err) {
        throw err
      }
    }
  }
}
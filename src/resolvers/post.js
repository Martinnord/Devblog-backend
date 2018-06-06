import GraphQLDate from 'graphql-date'
import Post from '../models/post'
import User from '../models/user'
import PostLikes from '../models/postLikes'
import Comment from '../models/comment'
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
        .select('users.username', 'users.profile_image', 'users.id')
        .from('post_likes')
        .fullOuterJoin('users', 'post_likes.user_id', 'users.id')
    },
    comments: async ({ id, user_id }) => {
      const test = await Comment.query()
        .where('post_id', id)
        .select(
          'users.username',
          'users.profile_image',
          'users.id',
          'post_comments.comment'
        )
        .from('post_comments')
        .fullOuterJoin('users', 'post_comments.user_id', 'users.id')
      // .select('users.username', 'users.profile_image', 'users.id')
      console.log('test', test)
      return test
      // return await Comment.query()
      //   .where('post_id', id)
      //   .select('users.username', 'users.profile_image', 'users.id')
      //   .from('post_comments')
      //   .fullOuterJoin('users', 'post_comments.user_id', 'user.id')
    }
    // is_liked: async (_, { id }, { user }) => {
    //   let is_liked = false

    //   const postLike =
    //     (await knex('post_likes')
    //       .where({ post_id: id })
    //       .andWhere({ user_id: user.id })).length === 1

    //   console.log('postLike', postLike)

    //   if (!user) {
    //     return (is_liked = false)
    //   }
    //   if (postLike.user_id === user.id) {
    //     return (is_liked = true)
    //   } else {
    //     return (is_liked = false)
    //   }
    //   console.log('is_liked', is_liked)

    //   return await is_liked
    // }
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

        // const postData = args
        // if (file) {
        //   console.log('pfile', file)
        //   postData.filetype = file.type
        //   postData.url = file.path
        // }
        //
        // console.log('args', ...args)
        // console.log('file', file)

        return await Post.query().insert({
          // file,
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
    deletePost: async (_, { input: { id } }, { user }) => {
      try {
        await requireAuth(user)

        const post = await Post.query().deleteById(id)
        console.log('post', post)
        // const test = await post.query().delete().where({ id })
        // console.log('test', test)
        return post
      } catch (err) {
        throw err
      }
    },
    createComment: async (_, { id, comment }, { user }) => {
      try {
        await requireAuth(user)
        console.log(id)
        console.log(comment)
        console.log(user)
        const newComment = await Comment.query()
          .where('post_id', id)
          .insert({
            user_id: user.id,
            comment,
            post_id: parseInt(id)
          })

        return newComment

        console.log('id', id)
        console.log('user', user)
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
          .insert({ user_id: user.id, post_id: parseInt(id) })

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

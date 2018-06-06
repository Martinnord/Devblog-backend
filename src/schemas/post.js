export default `
  scalar Date

  type Post {
    id: ID!
    title: String!
    content: String!
    image_url: String!
    user: User!
    likes: [User]!
    comments: [Comment]!
    updated_at: String
    created_at: String
  }

  type Subscription {
    postLiked(id: ID!): Post
  }

  type Query {
    getAllPosts: [Post]
    getPost(id: Int!): Post
    getUserPosts: [Post]
  }

  type Mutation {
    createPost(title: String!, content: String!, image_url: String): Post
    updatePost(id: Int!, title: String, content: String!, image_url: String): Post
    deletePost(input: deletePostInput!): deletePostPayload
    likePost(id: ID!): Post
  }

  input deletePostInput {
    id: ID!
  }

  type deletePostPayload{
    id: ID!
    title: String!
    content: String!
    image_url: String!
    user: User!
    likes: [User]!
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`

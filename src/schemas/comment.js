export default `
  type Comment {
    id: ID!
    comment: String!
    user: User
    updated_at: String
    created_at: String
  }

  type Query {
    getAllComments: [Comment]
    getComment(id: Int!): Comment
  }

  type Mutation {
    createComment(id: ID!, comment: String!): Comment
    updateComment(id: ID!, comment: String!): Comment
    deleteComment(id: ID!): Comment
  }

  schema {
    query: Query
    mutation: Mutation
  }
`

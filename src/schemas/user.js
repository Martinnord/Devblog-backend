export default `
  type User {
    id: ID!
    username: String
    email: String!
    name: String    
    profile_image: String
    website_url: String
    bio: String
    location: String
    work_status: String
    twitter_username: String
    github_username: String
    jwt: String
    posts: [Post!]!
    updated_at: Date!
    created_at: Date!
  }

  type UserLike {
    id: ID!
    username: String!
    profile_image: String!
  }

  type Query {
    getAllUsers: [User]
    getUser(username: String!, id: ID): User
    currentUser: User
  }

  type registerResponse {
    ok: Boolean!
    user: User
  }

  type LoginResponse {
    ok: Boolean!
    token: String
    refreshToken: String
    test: String
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    login(email: String!, password: String!): User
    updateUserInfo(
      id: Int!
      username: String
      email: String
      name: String
      profile_image: String
      website_url: String
      bio: String
      location: String
      work_status: String
      twitter_username: String
      github_username: String
    ): User
  }
`

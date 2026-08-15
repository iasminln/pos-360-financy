export const typeDefs = /* GraphQL */ `
  scalar DateTime

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: DateTime!
  }

  type Category {
    id: ID!
    title: String!
    description: String
    icon: String!
    color: String!
    createdAt: DateTime!
    transactionsCount: Int!
    totalAmount: Float!
  }

  type Transaction {
    id: ID!
    description: String!
    amount: Float!
    type: TransactionType!
    date: DateTime!
    category: Category!
    createdAt: DateTime!
  }

  enum TransactionType {
    INCOME
    EXPENSE
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DashboardSummary {
    totalBalance: Float!
    monthlyIncome: Float!
    monthlyExpenses: Float!
    totalCategories: Int!
    totalTransactions: Int!
    mostUsedCategory: Category
    recentTransactions: [Transaction!]!
    categorySummaries: [Category!]!
  }

  input TransactionFilterInput {
    search: String
    type: TransactionType
    categoryId: String
    month: Int
    year: Int
  }

  type Query {
    me: User!
    categories: [Category!]!
    category(id: ID!): Category
    transactions(filter: TransactionFilterInput): [Transaction!]!
    transaction(id: ID!): Transaction
    dashboard: DashboardSummary!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(name: String!): User!

    createCategory(
      title: String!
      description: String
      icon: String!
      color: String!
    ): Category!
    updateCategory(
      id: ID!
      title: String
      description: String
      icon: String
      color: String
    ): Category!
    deleteCategory(id: ID!): Boolean!

    createTransaction(
      description: String!
      amount: Float!
      type: TransactionType!
      date: DateTime!
      categoryId: ID!
    ): Transaction!
    updateTransaction(
      id: ID!
      description: String
      amount: Float
      type: TransactionType
      date: DateTime
      categoryId: ID
    ): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;

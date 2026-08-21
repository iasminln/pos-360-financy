import { gql } from "graphql-tag";

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    createdAt
  }
`;

export const CATEGORY_FIELDS = gql`
  fragment CategoryFields on Category {
    id
    title
    description
    icon
    color
    transactionsCount
    totalAmount
    createdAt
  }
`;

export const TRANSACTION_FIELDS = gql`
  fragment TransactionFields on Transaction {
    id
    description
    amount
    type
    date
    createdAt
    category {
      ...CategoryFields
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const ME_QUERY = gql`
  query Me {
    me {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String!) {
    updateProfile(name: $name) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const DASHBOARD_QUERY = gql`
  query Dashboard {
    dashboard {
      totalBalance
      monthlyIncome
      monthlyExpenses
      totalCategories
      totalTransactions
      mostUsedCategory {
        ...CategoryFields
      }
      recentTransactions {
        ...TransactionFields
      }
      categorySummaries {
        ...CategoryFields
      }
    }
  }
  ${CATEGORY_FIELDS}
  ${TRANSACTION_FIELDS}
`;

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`;

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory(
    $title: String!
    $description: String
    $icon: String!
    $color: String!
  ) {
    createCategory(
      title: $title
      description: $description
      icon: $icon
      color: $color
    ) {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`;

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory(
    $id: ID!
    $title: String
    $description: String
    $icon: String
    $color: String
  ) {
    updateCategory(
      id: $id
      title: $title
      description: $description
      icon: $icon
      color: $color
    ) {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`;

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const TRANSACTIONS_QUERY = gql`
  query Transactions($filter: TransactionFilterInput) {
    transactions(filter: $filter) {
      ...TransactionFields
    }
  }
  ${CATEGORY_FIELDS}
  ${TRANSACTION_FIELDS}
`;

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction(
    $description: String!
    $amount: Float!
    $type: TransactionType!
    $date: DateTime!
    $categoryId: ID!
  ) {
    createTransaction(
      description: $description
      amount: $amount
      type: $type
      date: $date
      categoryId: $categoryId
    ) {
      ...TransactionFields
    }
  }
  ${CATEGORY_FIELDS}
  ${TRANSACTION_FIELDS}
`;

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction(
    $id: ID!
    $description: String
    $amount: Float
    $type: TransactionType
    $date: DateTime
    $categoryId: ID
  ) {
    updateTransaction(
      id: $id
      description: $description
      amount: $amount
      type: $type
      date: $date
      categoryId: $categoryId
    ) {
      ...TransactionFields
    }
  }
  ${CATEGORY_FIELDS}
  ${TRANSACTION_FIELDS}
`;

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

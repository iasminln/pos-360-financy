import type { Category, Prisma } from "@prisma/client";
import { GraphQLScalarType, Kind } from "graphql";
import type { GraphQLContext } from "../context.js";
import { requireAuth } from "../context.js";
import {
  comparePassword,
  hashPassword,
  signToken,
} from "../utils/auth.js";
import { badRequest, notFound } from "../utils/errors.js";

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string" || typeof value === "number") {
      return new Date(value).toISOString();
    }
    throw new Error("DateTime inválido");
  },
  parseValue(value: unknown) {
    if (typeof value === "string" || typeof value === "number") {
      return new Date(value);
    }
    if (value instanceof Date) return value;
    throw new Error("DateTime inválido");
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  },
});

type CategoryWithCount = Category & {
  _count?: { transactions: number };
  transactions?: { amount: number; type: string }[];
};

function mapCategory(category: CategoryWithCount) {
  const transactionsCount =
    category._count?.transactions ?? category.transactions?.length ?? 0;
  const totalAmount =
    category.transactions?.reduce((sum, t) => {
      return sum + (t.type === "INCOME" ? t.amount : -t.amount);
    }, 0) ?? 0;

  return {
    ...category,
    transactionsCount,
    totalAmount,
  };
}

async function getOwnedCategory(
  context: GraphQLContext,
  userId: string,
  categoryId: string,
) {
  const category = await context.prisma.category.findFirst({
    where: { id: categoryId, userId },
    include: {
      _count: { select: { transactions: true } },
      transactions: { select: { amount: true, type: true } },
    },
  });

  if (!category) {
    notFound("Categoria não encontrada");
  }

  return category!;
}

async function getOwnedTransaction(
  context: GraphQLContext,
  userId: string,
  transactionId: string,
) {
  const transaction = await context.prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    include: {
      category: {
        include: {
          _count: { select: { transactions: true } },
          transactions: { select: { amount: true, type: true } },
        },
      },
    },
  });

  if (!transaction) {
    notFound("Transação não encontrada");
  }

  return transaction!;
}

function monthRange(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export const resolvers = {
  DateTime: DateTimeScalar,

  Category: {
    transactionsCount: (parent: CategoryWithCount) =>
      parent._count?.transactions ?? parent.transactions?.length ?? 0,
    totalAmount: (parent: CategoryWithCount) => {
      const withTotal = parent as CategoryWithCount & { totalAmount?: number };
      if (typeof withTotal.totalAmount === "number") {
        return withTotal.totalAmount;
      }
      return (
        parent.transactions?.reduce((sum, t) => {
          return sum + (t.type === "INCOME" ? t.amount : -t.amount);
        }, 0) ?? 0
      );
    },
  },

  Transaction: {
    category: (parent: { category?: CategoryWithCount }) => {
      if (parent.category) {
        return mapCategory(parent.category);
      }
      return null;
    },
  },

  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const user = await context.prisma.user.findUnique({ where: { id: userId } });
      if (!user) notFound("Usuário não encontrado");
      return user;
    },

    categories: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const categories = await context.prisma.category.findMany({
        where: { userId },
        include: {
          _count: { select: { transactions: true } },
          transactions: { select: { amount: true, type: true } },
        },
        orderBy: { title: "asc" },
      });
      return categories.map(mapCategory);
    },

    category: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      return mapCategory(await getOwnedCategory(context, userId, args.id));
    },

    transactions: async (
      _: unknown,
      args: {
        filter?: {
          search?: string | null;
          type?: "INCOME" | "EXPENSE" | null;
          categoryId?: string | null;
          month?: number | null;
          year?: number | null;
        } | null;
      },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      const filter = args.filter ?? {};

      const where: Prisma.TransactionWhereInput = { userId };

      if (filter.search) {
        where.description = {
          contains: filter.search,
        };
      }

      if (filter.type) {
        where.type = filter.type;
      }

      if (filter.categoryId) {
        where.categoryId = filter.categoryId;
      }

      if (filter.month && filter.year) {
        const { start, end } = monthRange(filter.month, filter.year);
        where.date = { gte: start, lt: end };
      }

      return context.prisma.transaction.findMany({
        where,
        include: {
          category: {
            include: {
              _count: { select: { transactions: true } },
              transactions: { select: { amount: true, type: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      });
    },

    transaction: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      return getOwnedTransaction(context, userId, args.id);
    },

    dashboard: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const now = new Date();
      const { start, end } = monthRange(now.getMonth() + 1, now.getFullYear());

      const [allTransactions, categories, recentTransactions] =
        await Promise.all([
          context.prisma.transaction.findMany({
            where: { userId },
            select: { amount: true, type: true, date: true },
          }),
          context.prisma.category.findMany({
            where: { userId },
            include: {
              _count: { select: { transactions: true } },
              transactions: { select: { amount: true, type: true } },
            },
            orderBy: { title: "asc" },
          }),
          context.prisma.transaction.findMany({
            where: { userId },
            include: {
              category: {
                include: {
                  _count: { select: { transactions: true } },
                  transactions: { select: { amount: true, type: true } },
                },
              },
            },
            orderBy: { date: "desc" },
            take: 5,
          }),
        ]);

      const totalBalance = allTransactions.reduce((sum, t) => {
        return sum + (t.type === "INCOME" ? t.amount : -t.amount);
      }, 0);

      const monthlyIncome = allTransactions
        .filter((t) => t.type === "INCOME" && t.date >= start && t.date < end)
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = allTransactions
        .filter((t) => t.type === "EXPENSE" && t.date >= start && t.date < end)
        .reduce((sum, t) => sum + t.amount, 0);

      const mappedCategories = categories.map(mapCategory);
      const mostUsedCategory =
        [...mappedCategories].sort(
          (a, b) => b.transactionsCount - a.transactionsCount,
        )[0] ?? null;

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        totalCategories: categories.length,
        totalTransactions: allTransactions.length,
        mostUsedCategory:
          mostUsedCategory && mostUsedCategory.transactionsCount > 0
            ? mostUsedCategory
            : null,
        recentTransactions,
        categorySummaries: mappedCategories
          .filter((c) => c.transactionsCount > 0)
          .slice(0, 5),
      };
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      args: { name: string; email: string; password: string },
      context: GraphQLContext,
    ) => {
      const email = args.email.trim().toLowerCase();
      const name = args.name.trim();

      if (!name) badRequest("Nome é obrigatório");
      if (!email) badRequest("E-mail é obrigatório");
      if (args.password.length < 8) {
        badRequest("A senha deve ter no mínimo 8 caracteres");
      }

      const existing = await context.prisma.user.findUnique({
        where: { email },
      });
      if (existing) badRequest("E-mail já cadastrado");

      const passwordHash = await hashPassword(args.password);
      const user = await context.prisma.user.create({
        data: { name, email, passwordHash },
      });

      return { token: signToken(user.id), user };
    },

    login: async (
      _: unknown,
      args: { email: string; password: string },
      context: GraphQLContext,
    ) => {
      const email = args.email.trim().toLowerCase();
      const user = await context.prisma.user.findUnique({ where: { email } });
      if (!user) badRequest("E-mail ou senha inválidos");

      const valid = await comparePassword(args.password, user!.passwordHash);
      if (!valid) badRequest("E-mail ou senha inválidos");

      return { token: signToken(user!.id), user };
    },

    updateProfile: async (
      _: unknown,
      args: { name: string },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      const name = args.name.trim();
      if (!name) badRequest("Nome é obrigatório");

      return context.prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    },

    createCategory: async (
      _: unknown,
      args: {
        title: string;
        description?: string | null;
        icon: string;
        color: string;
      },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      const title = args.title.trim();
      if (!title) badRequest("Título é obrigatório");

      const category = await context.prisma.category.create({
        data: {
          title,
          description: args.description?.trim() || null,
          icon: args.icon,
          color: args.color,
          userId,
        },
        include: {
          _count: { select: { transactions: true } },
          transactions: { select: { amount: true, type: true } },
        },
      });

      return mapCategory(category);
    },

    updateCategory: async (
      _: unknown,
      args: {
        id: string;
        title?: string | null;
        description?: string | null;
        icon?: string | null;
        color?: string | null;
      },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      await getOwnedCategory(context, userId, args.id);

      const data: Prisma.CategoryUpdateInput = {};
      if (args.title != null) {
        const title = args.title.trim();
        if (!title) badRequest("Título é obrigatório");
        data.title = title;
      }
      if (args.description !== undefined) {
        data.description = args.description?.trim() || null;
      }
      if (args.icon != null) data.icon = args.icon;
      if (args.color != null) data.color = args.color;

      const category = await context.prisma.category.update({
        where: { id: args.id },
        data,
        include: {
          _count: { select: { transactions: true } },
          transactions: { select: { amount: true, type: true } },
        },
      });

      return mapCategory(category);
    },

    deleteCategory: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      const category = await getOwnedCategory(context, userId, args.id);

      if (category._count.transactions > 0) {
        badRequest(
          "Não é possível excluir uma categoria com transações vinculadas",
        );
      }

      await context.prisma.category.delete({ where: { id: args.id } });
      return true;
    },

    createTransaction: async (
      _: unknown,
      args: {
        description: string;
        amount: number;
        type: "INCOME" | "EXPENSE";
        date: string | Date;
        categoryId: string;
      },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      const description = args.description.trim();
      if (!description) badRequest("Descrição é obrigatória");
      if (args.amount <= 0) badRequest("Valor deve ser maior que zero");

      await getOwnedCategory(context, userId, args.categoryId);

      return context.prisma.transaction.create({
        data: {
          description,
          amount: args.amount,
          type: args.type,
          date: new Date(args.date),
          categoryId: args.categoryId,
          userId,
        },
        include: {
          category: {
            include: {
              _count: { select: { transactions: true } },
              transactions: { select: { amount: true, type: true } },
            },
          },
        },
      });
    },

    updateTransaction: async (
      _: unknown,
      args: {
        id: string;
        description?: string | null;
        amount?: number | null;
        type?: "INCOME" | "EXPENSE" | null;
        date?: string | Date | null;
        categoryId?: string | null;
      },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      await getOwnedTransaction(context, userId, args.id);

      if (args.categoryId) {
        await getOwnedCategory(context, userId, args.categoryId);
      }

      const data: Prisma.TransactionUpdateInput = {};
      if (args.description != null) {
        const description = args.description.trim();
        if (!description) badRequest("Descrição é obrigatória");
        data.description = description;
      }
      if (args.amount != null) {
        if (args.amount <= 0) badRequest("Valor deve ser maior que zero");
        data.amount = args.amount;
      }
      if (args.type != null) data.type = args.type;
      if (args.date != null) data.date = new Date(args.date);
      if (args.categoryId != null) {
        data.category = { connect: { id: args.categoryId } };
      }

      return context.prisma.transaction.update({
        where: { id: args.id },
        data,
        include: {
          category: {
            include: {
              _count: { select: { transactions: true } },
              transactions: { select: { amount: true, type: true } },
            },
          },
        },
      });
    },

    deleteTransaction: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      await getOwnedTransaction(context, userId, args.id);
      await context.prisma.transaction.delete({ where: { id: args.id } });
      return true;
    },
  },
};

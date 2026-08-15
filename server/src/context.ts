import type { YogaInitialContext } from "graphql-yoga";
import { prisma } from "./lib/prisma.js";
import { verifyToken } from "./utils/auth.js";
import { unauthorized } from "./utils/errors.js";

export type GraphQLContext = {
  prisma: typeof prisma;
  userId: string | null;
};

export async function createContext(
  initialContext: YogaInitialContext,
): Promise<GraphQLContext> {
  const authHeader = initialContext.request.headers.get("authorization");
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
    } catch {
      userId = null;
    }
  }

  return { prisma, userId };
}

export function requireAuth(context: GraphQLContext): string {
  if (!context.userId) {
    unauthorized();
  }
  return context.userId!;
}

import { GraphQLError } from "graphql";

export function unauthorized(message = "Não autenticado") {
  throw new GraphQLError(message, {
    extensions: { code: "UNAUTHENTICATED" },
  });
}

export function badRequest(message: string) {
  throw new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT" },
  });
}

export function notFound(message: string) {
  throw new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
}

export function forbidden(message = "Acesso negado") {
  throw new GraphQLError(message, {
    extensions: { code: "FORBIDDEN" },
  });
}

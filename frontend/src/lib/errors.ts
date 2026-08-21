import { CombinedGraphQLErrors } from "@apollo/client/errors";

export function getErrorMessage(error: unknown, fallback: string) {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors[0]?.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

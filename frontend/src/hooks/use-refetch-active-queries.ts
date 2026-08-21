import { useApolloClient } from "@apollo/client/react";
import { useCallback } from "react";

/** Refetch all currently active queries so lists/dashboard update after mutations. */
export function useRefetchActiveQueries() {
  const client = useApolloClient();

  return useCallback(async () => {
    await client.refetchQueries({ include: "active" });
  }, [client]);
}

import type { QueryClient } from "@tanstack/react-query";

const userScopedQueryRoots = new Set(["users", "conversations", "messages"]);

export function clearUserScopedQueries(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) =>
      userScopedQueryRoots.has(String(query.queryKey[0] ?? ""))
  });
}

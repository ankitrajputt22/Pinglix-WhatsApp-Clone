import { useQuery } from "@tanstack/react-query";

import { searchUsers } from "../api/users-api";

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: ({ signal }) => searchUsers(query, signal),
    enabled: query.length >= 2 && query.length <= 100
  });
}

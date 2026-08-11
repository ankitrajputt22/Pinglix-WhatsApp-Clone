import { useQuery } from "@tanstack/react-query";

import { getConversations } from "../api/conversations-api";

export const CONVERSATIONS_QUERY_KEY = ["conversations"] as const;

export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: ({ signal }) => getConversations(signal)
  });
}

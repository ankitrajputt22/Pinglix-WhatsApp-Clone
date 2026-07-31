import { useQuery } from "@tanstack/react-query";

import { getCurrentUserProfile } from "../api/users-api";

export const CURRENT_USER_PROFILE_QUERY_KEY = ["users", "me"] as const;

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: CURRENT_USER_PROFILE_QUERY_KEY,
    queryFn: ({ signal }) => getCurrentUserProfile(signal)
  });
}

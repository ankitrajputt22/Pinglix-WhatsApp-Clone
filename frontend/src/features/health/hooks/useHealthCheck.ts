import { useQuery } from "@tanstack/react-query";

import { getHealth } from "../api/health-api";

export const HEALTH_QUERY_KEY = ["health"] as const;

export function useHealthCheck() {
  return useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: ({ signal }) => getHealth(signal)
  });
}

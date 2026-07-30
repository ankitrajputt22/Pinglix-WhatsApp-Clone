import { Navigate } from "react-router-dom";

import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { AuthRouteState } from "./AuthRouteState";

export function RootRedirect() {
  const { data: user, error, isPending, refetch } = useCurrentUser();

  return (
    <AuthRouteState
      isLoading={isPending}
      error={error}
      onRetry={() => void refetch()}
    >
      <Navigate to={user ? "/app" : "/login"} replace />
    </AuthRouteState>
  );
}

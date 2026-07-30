import { Navigate, Outlet } from "react-router-dom";

import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { AuthRouteState } from "./AuthRouteState";

export function PublicOnlyRoute() {
  const { data: user, error, isPending, refetch } = useCurrentUser();

  return (
    <AuthRouteState
      isLoading={isPending}
      error={error}
      onRetry={() => void refetch()}
    >
      {user ? <Navigate to="/app" replace /> : <Outlet />}
    </AuthRouteState>
  );
}

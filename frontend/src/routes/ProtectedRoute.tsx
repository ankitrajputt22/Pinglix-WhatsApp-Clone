import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { AuthRouteState } from "./AuthRouteState";

export function ProtectedRoute() {
  const location = useLocation();
  const { data: user, error, isPending, refetch } = useCurrentUser();

  return (
    <AuthRouteState
      isLoading={isPending}
      error={error}
      onRetry={() => void refetch()}
    >
      {user ? (
        <Outlet />
      ) : (
        <Navigate
          to="/login"
          replace
          state={{ from: location.pathname }}
        />
      )}
    </AuthRouteState>
  );
}

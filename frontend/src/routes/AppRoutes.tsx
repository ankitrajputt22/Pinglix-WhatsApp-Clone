import { Route, Routes } from "react-router-dom";

import { HealthCheckPage } from "../features/health/components/HealthCheckPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HealthCheckPage />} />
    </Routes>
  );
}

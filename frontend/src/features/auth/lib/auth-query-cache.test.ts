import { describe, expect, it } from "vitest";

import { createQueryClient } from "../../../lib/query-client";
import { clearUserScopedQueries } from "./auth-query-cache";

describe("authenticated query cache", () => {
  it("removes user data while keeping public queries", () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(["users", "me"], { id: 1 });
    queryClient.setQueryData(["users", "search", "a"], [{ id: 2 }]);
    queryClient.setQueryData(["conversations"], [{ id: 10 }]);
    queryClient.setQueryData(["messages", 10], { pages: [] });
    queryClient.setQueryData(["health"], { status: "UP" });

    clearUserScopedQueries(queryClient);

    expect(queryClient.getQueryData(["users", "me"])).toBeUndefined();
    expect(
      queryClient.getQueryData(["users", "search", "a"])
    ).toBeUndefined();
    expect(queryClient.getQueryData(["conversations"])).toBeUndefined();
    expect(queryClient.getQueryData(["messages", 10])).toBeUndefined();
    expect(queryClient.getQueryData(["health"])).toEqual({ status: "UP" });
  });
});

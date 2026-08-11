import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MessageStatusIndicator } from "./MessageStatusIndicator";

describe("MessageStatusIndicator", () => {
  it.each([
    ["SENT", "Sent"],
    ["DELIVERED", "Delivered"],
    ["READ", "Read"]
  ] as const)("renders %s as %s", (status, label) => {
    render(<MessageStatusIndicator status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByLabelText(`Message status: ${label}`)).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardPage, { DASHBOARD_STATS } from "@/app/(app)/dashboard/page";

describe("Dashboard shell", () => {
  it("renders the six stat cards the plan names", () => {
    render(<DashboardPage />);

    for (const stat of DASHBOARD_STATS) {
      expect(screen.getByText(stat.label)).toBeTruthy();
    }
    expect(DASHBOARD_STATS).toHaveLength(6);
  });

  it("marks every unwired value as a placeholder", () => {
    // This is what makes "wire the dashboard" a grep in a later milestone
    // rather than a hunt, and it is what stops a shell from being mistaken
    // for working software.
    const { container } = render(<DashboardPage />);

    expect(container.querySelectorAll("[data-placeholder]")).toHaveLength(8);
  });

  it("renders the two overview panels empty", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Subscription Overview")).toBeTruthy();
    expect(screen.getByText("Client Concerns Overview")).toBeTruthy();
    expect(screen.getAllByText("No data yet")).toHaveLength(2);
  });
});

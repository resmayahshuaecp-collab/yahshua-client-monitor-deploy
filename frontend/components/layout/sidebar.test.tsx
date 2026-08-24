import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

describe("Sidebar", () => {
  it("links to the sections that exist", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("renders unbuilt sections as disabled, not as links", () => {
    // A screen that is reachable but empty and a screen that does not
    // exist must not look the same. Linking to an unbuilt route is how six
    // Done screens ended up unreachable.
    render(<Sidebar />);

    const globe = screen.getByText("Globe Clients");
    expect(globe.closest("a")).toBeNull();
    expect(globe.closest("[aria-disabled='true']")).not.toBeNull();
  });

  it("marks the current section", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});

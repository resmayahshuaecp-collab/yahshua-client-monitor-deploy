import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Topbar } from "@/components/layout/topbar";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("Topbar", () => {
  it("shows the actor's name and role", () => {
    render(
      <Topbar
        actor={{ user_id: 1, email: "a@b.c", name: "Ada Admin", role: "ADMIN" }}
      />,
    );

    expect(screen.getByText("Ada Admin")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("offers sign out", () => {
    render(<Topbar actor={{ user_id: 1, email: "a@b.c", name: "Ada", role: "ADMIN" }} />);

    expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
  });

  it("says so when the actor has no role rather than showing nothing", () => {
    render(<Topbar actor={{ user_id: 1, email: "a@b.c", name: "Orphan", role: null }} />);

    expect(screen.getByText("No role assigned")).toBeTruthy();
  });
});

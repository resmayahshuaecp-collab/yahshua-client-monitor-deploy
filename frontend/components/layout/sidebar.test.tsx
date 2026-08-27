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

  it("renders grouped navigation with collapsed controls", () => {
    render(<Sidebar />);

    expect(screen.getByRole("button", { name: /Consultant Onboarding/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /Communication/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "AI Support" })).toHaveAttribute("href", "/ai-support");
  });

  it("reveals only client chats when Communication is expanded", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    render(<Sidebar />);

    await user.click(screen.getByRole("button", { name: /Communication/ }));
    expect(screen.queryByRole("link", { name: "Consultant Channel" })).toBeNull();
    expect(screen.queryByRole("link", { name: "System Engineer Channel" })).toBeNull();
    expect(screen.getByRole("link", { name: "Globe Group Chat" })).toHaveAttribute("href", "/communication/globe-chat");
    expect(screen.getByRole("link", { name: "SME Group Chat" })).toHaveAttribute("href", "/communication/sme-chat");
    expect(screen.getByText("CLIENT")).toBeTruthy();
  });

  it("marks the current section", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});

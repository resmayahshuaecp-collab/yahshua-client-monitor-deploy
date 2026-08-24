import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/app/login/login-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockReset();
    vi.restoreAllMocks();
  });

  it("posts to the proxy route, not to Django directly", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "admin@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "pw-12345678");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/login");
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows the refusal message and stays put on bad credentials", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "invalid_credentials", message: "Email or password is incorrect." }), {
        status: 403,
      }),
    );
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "admin@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.");
    expect(push).not.toHaveBeenCalled();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

describe("Card", () => {
  it("renders its title and content", () => {
    render(
      <Card>
        <CardTitle>Total Clients</CardTitle>
        <CardContent>42</CardContent>
      </Card>,
    );

    expect(screen.getByText("Total Clients")).toBeTruthy();
    expect(screen.getByText("42")).toBeTruthy();
  });

  it("passes className through so callers can lay it out", () => {
    const { container } = render(<Card className="col-span-2" />);

    expect(container.firstElementChild?.className).toContain("col-span-2");
  });
});

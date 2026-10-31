import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { HashRedirect } from "./App";

const Where = () => <span data-testid="where">{useLocation().pathname}</span>;

test("old /#/admin links redirect to /admin", async () => {
  render(
    <MemoryRouter initialEntries={["/#/admin"]}>
      <HashRedirect />
      <Routes><Route path="*" element={<Where />} /></Routes>
    </MemoryRouter>
  );
  expect(await screen.findByText("/admin")).toBeInTheDocument();
});

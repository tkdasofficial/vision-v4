import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), signOut: vi.fn(), isAdmin: false }));
vi.mock("@/lib/router-compat", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ profile: { full_name: "Taylor Morgan", email: "taylor@example.com" }, user: null, isAdmin: mocks.isAdmin, signOut: mocks.signOut }) }));
import SettingsDirectory, { SETTINGS_CATEGORIES } from "@/pages/settings";

afterEach(() => { cleanup(); vi.clearAllMocks(); mocks.isAdmin = false; });

describe("Settings directory", () => {
  it("preserves every category and account, upgrade, help and legal destinations", () => {
    render(<SettingsDirectory />);
    for (const category of SETTINGS_CATEGORIES) {
      fireEvent.click(screen.getByRole("button", { name: category.to === "/settings/about" ? "About Vision" : category.title }));
      expect(mocks.navigate).toHaveBeenLastCalledWith(category.to);
    }
    for (const [label, path] of [["Edit profile", "/account"], ["Manage account", "/account"], ["Inbox", "/inbox"], ["Upgrade plan", "/billing/plans"], ["Support", "/support"], ["FAQ", "/help/faq"], ["Privacy Policy", "/legal/privacy"], ["Terms of Service", "/legal/terms"], ["Close settings", "/chat"]]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(mocks.navigate).toHaveBeenLastCalledWith(path);
    }
    expect(screen.queryByRole("button", { name: "Admin Panel" })).not.toBeInTheDocument();
  });
  it("compacts the header on scroll and restores it at the top", () => {
    const { container } = render(<SettingsDirectory />);
    const scroller = container.querySelector(".overflow-y-auto");
    if (!scroller) throw new Error("Missing settings scroller");
    fireEvent.scroll(scroller, { target: { scrollTop: 180 } });
    expect(container.querySelector("header")).toHaveAttribute("data-compact", "true");
    expect(screen.queryByRole("heading", { name: "Settings" })).not.toBeInTheDocument();
    fireEvent.scroll(scroller, { target: { scrollTop: 0 } });
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
  });
  it("shows admin navigation only for admins and signs out once", async () => {
    mocks.isAdmin = true;
    mocks.signOut.mockResolvedValue(undefined);
    render(<SettingsDirectory />);
    fireEvent.click(screen.getByRole("button", { name: "Admin Panel" }));
    expect(mocks.navigate).toHaveBeenLastCalledWith("/admin/dashboard");
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(screen.getByRole("button", { name: "Logging out…" })).toBeDisabled();
    await waitFor(() => expect(mocks.navigate).toHaveBeenLastCalledWith("/auth/login", { replace: true }));
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });
});
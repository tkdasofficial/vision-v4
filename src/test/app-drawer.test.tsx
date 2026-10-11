import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), rename: vi.fn(), remove: vi.fn() }));
vi.mock("@/lib/router-compat", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ profile: null }) }));
vi.mock("@/context/ChatHistoryContext", () => ({ useChatHistory: () => ({ history: [{ id: "chat-1", title: "Design notes" }, { id: "chat-2", title: "Project chat", projectId: "project-1" }], renameChat: mocks.rename, deleteChat: mocks.remove }) }));
vi.mock("@/components/sidebar-features", () => ({ default: () => <nav aria-label="Workspace features">Library · Projects · Plugins</nav> }));
vi.mock("@/components/workspace-search", () => ({ default: ({ onNavigate }: { onNavigate: () => void }) => <div><input aria-label="Search anything" /><button onClick={onNavigate}>Search result</button></div> }));
import AppDrawer, { AppDrawerView } from "@/components/app-drawer";
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("AppDrawer", () => {
  it("opens as a fullscreen accessible dialog with no separator", () => {
    const close = vi.fn();
    render(<AppDrawer open onClose={close} onNewChat={vi.fn()} onSelectChat={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: "App drawer" })).toHaveClass("inset-0", "w-full");
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close app drawer" }));
    expect(close).toHaveBeenCalled();
  });
  it("keeps recent chat selection, rename, delete and settings", () => {
    const select = vi.fn(); const close = vi.fn();
    render(<AppDrawerView onClose={close} onNewChat={vi.fn()} onSelectChat={select} />);
    expect(screen.queryByText("Project chat")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Design notes" }));
    expect(select).toHaveBeenCalledWith("chat-1");
    fireEvent.click(screen.getByRole("button", { name: "Rename Design notes" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Chat title" }), { target: { value: "Updated notes" } });
    fireEvent.click(screen.getByRole("button", { name: "Save chat title" }));
    expect(mocks.rename).toHaveBeenCalledWith("chat-1", "Updated notes");
    fireEvent.click(screen.getByRole("button", { name: "Delete Design notes" }));
    expect(mocks.remove).toHaveBeenCalledWith("chat-1");
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/settings");
  });
  it("embeds search and returns to navigation without page navigation", () => {
    const close = vi.fn();
    render(<AppDrawerView onClose={close} onNewChat={vi.fn()} onSelectChat={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Search workspace" }));
    expect(screen.getByRole("textbox", { name: "Search anything" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Search result" }));
    expect(close).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Back to drawer" }));
    expect(screen.getByRole("button", { name: "New chat" })).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
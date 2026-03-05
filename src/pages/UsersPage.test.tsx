import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersPage } from "./UsersPage";
import { fetchUsers } from "../api/usersApi";
import { useNavigate } from "react-router-dom";
import {vi} from "vitest";
import type { Mock } from "vitest";

vi.mock("../api/usersApi");
vi.mock("react-router-dom", () => ({
    ...vi.importActual("react-router-dom"),
    useNavigate: vi.fn(),
}));

describe("UsersPage", () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
        sessionStorage.clear();
        mockNavigate.mockClear();
        vi.clearAllMocks();
    });

    it("показывает ошибку, если API вернул ошибку", async () => {
        (fetchUsers as Mock).mockResolvedValue({
            code: 500,
            message: "Server error",
        });

        render(<UsersPage />);

        expect(await screen.findByText("Server error")).toBeInTheDocument();
    });

    it("показывает список пользователей при успешном ответе", async () => {
        (fetchUsers as Mock).mockResolvedValue([
            { id: 1, username: "Alice", contacts: [] },
            { id: 2, username: "Bob", contacts: [] },
        ]);

        render(<UsersPage />);

        expect(await screen.findByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    it("восстанавливает скролл из sessionStorage", async () => {
        sessionStorage.setItem("users_scroll", "300");

        const scrollToMock = vi.fn() as unknown as typeof window.scrollTo;
        window.scrollTo = scrollToMock;

        (fetchUsers as Mock).mockResolvedValue([]);

        render(<UsersPage />);

        await waitFor(() => {
            expect(scrollToMock).toHaveBeenCalledWith({
                top: 300,
                behavior: "instant",
            });
        });
    });

    it("сохраняет скролл и вызывает navigate при клике на пользователя", async () => {
        (fetchUsers as Mock).mockResolvedValue([
            { id: 1, username: "Alice", contacts: [] },
        ]);

        render(<UsersPage />);

        const userItem = await screen.findByText("Alice");
        await userEvent.click(userItem);

        expect(sessionStorage.getItem("users_scroll")).not.toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith("/users/1");
    });
});

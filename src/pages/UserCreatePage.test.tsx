import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { Mock } from "vitest";

import { UserCreatePage } from "./UserCreatePage";
import { createUser } from "../api/usersApi";

vi.mock("../api/usersApi");

describe("UserCreatePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("показывает ошибку, если username невалидный", async () => {
        render(<UserCreatePage />);

        const submitBtn = screen.getByText("Create");
        await userEvent.click(submitBtn);

        expect(
            screen.getByText("Username must be 3–20 characters (letters, digits, _ or -)")
        ).toBeInTheDocument();
    });

    it("добавляет новый контакт при клике '+ Add Contact'", async () => {
        render(<UserCreatePage />);

        const addBtn = screen.getByText("+ Add Contact");
        await userEvent.click(addBtn);

        expect(screen.getAllByPlaceholderText("Type (email, phone...)").length).toBe(1);
        expect(screen.getAllByPlaceholderText("Content").length).toBe(1);
    });

    it("удаляет контакт при клике на ✕", async () => {
        render(<UserCreatePage />);

        const addBtn = screen.getByText("+ Add Contact");
        await userEvent.click(addBtn);

        const deleteBtn = screen.getByText("✕");
        await userEvent.click(deleteBtn);

        expect(screen.queryByPlaceholderText("Type (email, phone...)")).toBeNull();
    });

    it("отправляет форму и показывает ошибку сервера", async () => {
        (createUser as Mock).mockResolvedValue({
            code: 500,
            message: "Server error",
        });

        render(<UserCreatePage />);

        await userEvent.type(screen.getByPlaceholderText("Enter username"), "Alice");

        const addBtn = screen.getByText("+ Add Contact");
        await userEvent.click(addBtn);

        await userEvent.type(
            screen.getByPlaceholderText("Type (email, phone...)"),
            "email"
        );
        await userEvent.type(screen.getByPlaceholderText("Content"), "alice@example.com");

        const submitBtn = screen.getByText("Create");
        await userEvent.click(submitBtn);

        expect(await screen.findByText("Server error")).toBeInTheDocument();
    });

    it("успешно создаёт пользователя и показывает success-блок", async () => {
        (createUser as Mock).mockResolvedValue({
            id: 123,
            username: "Alice",
            contacts: [],
        });

        render(<UserCreatePage />);

        await userEvent.type(screen.getByPlaceholderText("Enter username"), "Alice");

        const submitBtn = screen.getByText("Create");
        await userEvent.click(submitBtn);

        expect(
            await screen.findByText("User created successfully (ID: 123)")
        ).toBeInTheDocument();
    });

    it("очищает предыдущие ошибки и success при новом сабмите", async () => {
        (createUser as Mock).mockResolvedValue({
            code: 500,
            message: "Server error",
        });

        render(<UserCreatePage />);

        await userEvent.type(screen.getByPlaceholderText("Enter username"), "Alice");

        const submitBtn = screen.getByText("Create");
        await userEvent.click(submitBtn);

        expect(await screen.findByText("Server error")).toBeInTheDocument();

        (createUser as Mock).mockResolvedValue({ id: 10, username: "Alice", contacts: [] });

        await userEvent.click(submitBtn);

        expect(await screen.findByText("User created successfully (ID: 10)")).toBeInTheDocument();
        expect(screen.queryByText("Server error")).toBeNull();
    });
});

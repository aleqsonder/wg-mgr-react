import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { UserItem } from "./UserItem";

describe("UserItem", () => {
    const user = {
        id: 5,
        username: "Alice",
        contacts: [
            { contactType: "email", content: "alice@example.com" },
            { contactType: "phone", content: "+123" }
        ]
    };

    it("отображает id, username и количество контактов", () => {
        render(<UserItem user={user} />);

        expect(screen.getByText("#5")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("2 contacts")).toBeInTheDocument();
    });

    it("вызывает onClick с id пользователя при клике", async () => {
        const handleClick = vi.fn();

        render(<UserItem user={user} onClick={handleClick} />);

        const item = screen.getByText("Alice");
        await userEvent.click(item);

        expect(handleClick).toHaveBeenCalledWith(5);
    });

    it("не вызывает onClick, если он не передан", async () => {
        render(<UserItem user={user} />);

        const item = screen.getByText("Alice");
        await userEvent.click(item);

    });
});

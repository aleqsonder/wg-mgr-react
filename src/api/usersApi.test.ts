import { vi, describe, it, expect, beforeEach } from "vitest";

import {
    fetchUsers,
    fetchUserById,
    createUser,
} from "./usersApi";

// Достаём type-guards через прямой импорт, если они экспортируются.
// Если нет — можно протестировать только публичные функции.
import {
    isUserContactResponse,
    isUserResponse,
    isUserResponseArray,
    isResponseMessage,
} from "./usersApi";

describe("Type guards", () => {
    it("isUserContactResponse — корректный объект", () => {
        expect(
            isUserContactResponse({ contactType: "email", content: "a@b.com" })
        ).toBe(true);
    });

    it("isUserContactResponse — некорректный объект", () => {
        expect(isUserContactResponse({ contactType: 123, content: "x" })).toBe(false);
        expect(isUserContactResponse(null)).toBe(false);
        expect(isUserContactResponse({})).toBe(false);
    });

    it("isUserResponse — корректный объект", () => {
        expect(
            isUserResponse({
                id: 1,
                username: "Alice",
                contacts: [{ contactType: "email", content: "a@b.com" }],
            })
        ).toBe(true);
    });

    it("isUserResponse — некорректный объект", () => {
        expect(isUserResponse({ id: "1", username: "A", contacts: [] })).toBe(false);
        expect(isUserResponse(null)).toBe(false);
        expect(isUserResponse({})).toBe(false);
    });

    it("isUserResponseArray — корректный массив", () => {
        expect(
            isUserResponseArray([
                {
                    id: 1,
                    username: "A",
                    contacts: [{ contactType: "email", content: "x" }],
                },
            ])
        ).toBe(true);
    });

    it("isUserResponseArray — некорректный массив", () => {
        expect(isUserResponseArray([{ id: "1" }])).toBe(false);
        expect(isUserResponseArray("not array")).toBe(false);
    });

    it("isResponseMessage — корректный объект", () => {
        expect(isResponseMessage({ code: 400, message: "Bad" })).toBe(true);
    });

    it("isResponseMessage — некорректный объект", () => {
        expect(isResponseMessage({ code: "400", message: "Bad" })).toBe(false);
        expect(isResponseMessage(null)).toBe(false);
    });
});

describe("API functions", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    const mockFetch = (status: number, json: unknown) => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: status >= 200 && status < 300,
            status,
            json: vi.fn().mockResolvedValue(json),
        } as Partial<Response>) as unknown as typeof fetch;
    };


    const mockFetchJsonError = (status: number) => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: status >= 200 && status < 300,
            status,
            json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
        } as Partial<Response>) as unknown as typeof fetch;
    };

    const mockFetchReject = (error: string) => {
        global.fetch = vi.fn().mockRejectedValue(new Error(error) as Partial<Response>) as unknown as typeof fetch;
    };

    // -----------------------------
    // fetchUsers
    // -----------------------------
    describe("fetchUsers", () => {
        it("возвращает список пользователей при корректном ответе", async () => {
            mockFetch(200, [
                {
                    id: 1,
                    username: "Alice",
                    contacts: [{ contactType: "email", content: "a@b.com" }],
                },
            ]);

            const result = await fetchUsers();
            expect(Array.isArray(result)).toBe(true);

            if (Array.isArray(result)) {
                expect(result[0].username).toBe("Alice");
            }
        });

        it("возвращает ошибку, если формат списка неверный", async () => {
            mockFetch(200, [{ id: "wrong" }]);

            const result = await fetchUsers();
            expect(result).toEqual({
                code: 500,
                message: "Invalid user list format",
            });
        });

        it("возвращает ResponseMessage при ошибке сервера", async () => {
            mockFetch(404, { code: 404, message: "Not found" });

            const result = await fetchUsers();
            expect(result).toEqual({ code: 404, message: "Not found" });
        });

        it("возвращает Unexpected server error, если сервер вернул мусор", async () => {
            mockFetch(500, { foo: "bar" });

            const result = await fetchUsers();
            expect(result).toEqual({
                code: 500,
                message: "Unexpected server error",
            });
        });

        it("возвращает ошибку сети", async () => {
            mockFetchReject("Network down");

            const result = await fetchUsers();
            expect(result).toEqual({
                code: 0,
                message: "Network down",
            });
        });

        it("возвращает ошибку, если JSON не парсится", async () => {
            mockFetchJsonError(200);

            const result = await fetchUsers();
            expect(result).toEqual({
                code: 500,
                message: "Invalid user list format",
            });
        });
    });

    // -----------------------------
    // fetchUserById
    // -----------------------------
    describe("fetchUserById", () => {
        it("возвращает пользователя при корректном ответе", async () => {
            mockFetch(200, {
                id: 1,
                username: "Alice",
                contacts: [{ contactType: "email", content: "a@b.com" }],
            });

            const result = await fetchUserById(1);
            if ("username" in result) {
                expect(result.username).toBe("Alice");
            }
        });

        it("возвращает ошибку, если формат неверный", async () => {
            mockFetch(200, { id: "wrong" });

            const result = await fetchUserById(1);
            expect(result).toEqual({
                code: 500,
                message: "Invalid user format",
            });
        });

        it("возвращает ResponseMessage при ошибке сервера", async () => {
            mockFetch(404, { code: 404, message: "Not found" });

            const result = await fetchUserById(1);
            expect(result).toEqual({ code: 404, message: "Not found" });
        });

        it("возвращает Unexpected server error, если сервер вернул мусор", async () => {
            mockFetch(500, { foo: "bar" });

            const result = await fetchUserById(1);
            expect(result).toEqual({
                code: 500,
                message: "Unexpected server error",
            });
        });

        it("возвращает ошибку сети", async () => {
            mockFetchReject("Network down");

            const result = await fetchUserById(1);
            expect(result).toEqual({
                code: 0,
                message: "Network down",
            });
        });
    });

    // -----------------------------
    // createUser
    // -----------------------------
    describe("createUser", () => {
        const payload = {
            username: "Alice",
            contacts: [],
        };

        it("возвращает созданного пользователя", async () => {
            mockFetch(201, {
                id: 10,
                username: "Alice",
                contacts: [],
            });

            const result = await createUser(payload);
            if ("id" in result) {
                expect(result.id).toBe(10);
            }
        });

        it("возвращает ошибку, если формат неверный", async () => {
            mockFetch(201, { foo: "bar" });

            const result = await createUser(payload);
            expect(result).toEqual({
                code: 500,
                message: "Invalid user format",
            });
        });

        it("возвращает ResponseMessage при ошибке сервера", async () => {
            mockFetch(400, { code: 400, message: "Bad request" });

            const result = await createUser(payload);
            expect(result).toEqual({ code: 400, message: "Bad request" });
        });

        it("возвращает Unexpected server error, если сервер вернул мусор", async () => {
            mockFetch(500, { foo: "bar" });

            const result = await createUser(payload);
            expect(result).toEqual({
                code: 500,
                message: "Unexpected server error",
            });
        });

        it("возвращает ошибку сети", async () => {
            mockFetchReject("Network down");

            const result = await createUser(payload);
            expect(result).toEqual({
                code: 0,
                message: "Network down",
            });
        });
    });
});

import type {UserContactResponse, UserRequest, UserResponse} from "../types/userRelated.ts";
import type {ResponseMessage} from "../types/responseMessages.ts";


function isUserContactResponse(obj: unknown): obj is UserContactResponse {
    if (typeof obj !== "object" || obj === null) return false;

    const o = obj as Record<string, unknown>;

    return (
        typeof o.contactType === "string" &&
        typeof o.content === "string"
    );
}

function isUserResponse(obj: unknown): obj is UserResponse {
    if (typeof obj !== "object" || obj === null) return false;

    const o = obj as Record<string, unknown>;

    return (
        typeof o.id === "number" &&
        typeof o.username === "string" &&
        Array.isArray(o.contacts) &&
        o.contacts.every(isUserContactResponse)
    );
}

function isUserResponseArray(data: unknown): data is UserResponse[] {
    return Array.isArray(data) && data.every(isUserResponse);
}

function isResponseMessage(obj: unknown): obj is ResponseMessage {
    if (typeof obj !== "object" || obj === null) return false;

    const o = obj as Record<string, unknown>;

    return (
        typeof o.code === "number" &&
        typeof o.message === "string"
    );
}

export async function fetchUsers(): Promise<UserResponse[] | ResponseMessage> {
    try {
        const response = await fetch(`/api/users`, {
            method: "GET"
        });

        const data: unknown = await response.json().catch(() => null);
        console.log(data);

        if (response.ok) {
            if (isUserResponseArray(data)) {
                return data;
            } else {
                return {
                    code: 500,
                    message: "Invalid user list format"
                };
            }
        }

        if (isResponseMessage(data)) {
            return data;
        } else {
            return {
                code: response.status,
                message: "Unexpected server error"
            };
        }

    } catch (err: unknown) {
        return {
            code: 0,
            message: err instanceof Error ? err.message : "Unknown network error"
        };
    }
}

export async function fetchUserById(id: number): Promise<UserResponse | ResponseMessage> {
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: "GET"
        });

        const data: unknown = await response.json().catch(() => null);

        if (response.ok) {
            if (isUserResponse(data)) {
                return data;
            }

            return {
                code: 500,
                message: "Invalid user format"
            };
        }

        if (isResponseMessage(data)) {
            return data;
        } else {
            return {
                code: response.status,
                message: "Unexpected server error"
            };

        }

    } catch (err: unknown) {
        return {
            code: 0,
            message: err instanceof Error ? err.message : "Unknown network error"
        };
    }
}

export async function createUser(
    payload: UserRequest
): Promise<UserResponse | ResponseMessage> {
    try {
        const response = await fetch(`/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data: unknown = await response.json().catch(() => null);

        if (response.ok) {
            if (isUserResponse(data)) {
                return data;
            }

            return {
                code: 500,
                message: "Invalid user format"
            };
        }

        if (isResponseMessage(data)) {
            return data;
        } else {
            return {
                code: response.status,
                message: "Unexpected server error"
            };

        }

    } catch (err: unknown) {
        return {
            code: 0,
            message: err instanceof Error ? err.message : "Unknown network error"
        };
    }
}



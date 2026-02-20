import React, {useState} from "react";

import { createUser } from "../api/usersApi";
import type { UserRequest, UserContactRequest } from "../types/userRelated";

import styles from "./UserCreatePage.module.css";

export function UserCreatePage() {

    const [form, setForm] = useState<UserRequest>({
        username: "",
        contacts: []
    });

    const [error, setError] = useState<string | null>(null);
    const [createdUserId, setCreatedUserId] = useState<number | null>(null);

    const validate = (): string | null => {
        // username: ^[a-zA-Z0-9_-]{3,20}$
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(form.username)) {
            return "Username must be 3–20 characters (letters, digits, _ or -)";
        }

        for (const c of form.contacts) {
            if (!c.contactType.trim()) {
                return "Contact type is required";
            }
            if (!c.content.trim()) {
                return "Contact content must not be blank";
            }
        }

        return null;
    };

    const handleAddContact = () => {
        setForm({
            ...form,
            contacts: [...form.contacts, { contactType: "", content: "" }]
        });
    };

    const handleContactChange = (
        index: number,
        field: keyof UserContactRequest,
        value: string
    ) => {
        const updated = [...form.contacts];
        updated[index] = { ...updated[index], [field]: value };
        setForm({ ...form, contacts: updated });
    };

    const handleDeleteContact = (index: number) => {
        const updated = [...form.contacts];
        updated.splice(index, 1);
        setForm({ ...form, contacts: updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);
        setCreatedUserId(null);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const result = await createUser(form);

        if ("code" in result) {
            // Ошибка от сервера
            setError(result.message);
        } else {
            // Успех — сервер вернул UserResponse
            setCreatedUserId(result.id);

            // Через секунду возвращаемся к списку
            //setTimeout(() => navigate("/users"), 1200);
        }
    };

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Create User</h1>

            {error && <div className={styles.error}>{error}</div>}

            {createdUserId && (
                <div className={styles.success}>
                    User created successfully (ID: {createdUserId})
                </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>Username</label>
                <input
                    className={styles.input}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Enter username"
                />

                <div className={styles.contactsHeader}>
                    <h3>Contacts</h3>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={handleAddContact}
                    >
                        + Add Contact
                    </button>
                </div>

                {form.contacts.map((c, index) => (
                    <div key={index} className={styles.contactItem}>
                        <input
                            className={styles.input}
                            placeholder="Type (email, phone...)"
                            value={c.contactType}
                            onChange={(e) =>
                                handleContactChange(index, "contactType", e.target.value)
                            }
                        />
                        <input
                            className={styles.input}
                            placeholder="Content"
                            value={c.content}
                            onChange={(e) =>
                                handleContactChange(index, "content", e.target.value)
                            }
                        />

                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => handleDeleteContact(index)}
                        >
                            ✕
                        </button>
                    </div>
                ))}


                <button className={styles.submitButton} type="submit">
                    Create
                </button>
            </form>
        </div>
    );
}

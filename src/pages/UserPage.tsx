import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchUserById, deleteUser, editUser } from "../api/usersApi";

import type { UserResponse, UserRequest } from "../types/userRelated";
import type { ResponseMessage } from "../types/responseMessages";

import styles from "./UserPage.module.css";

export function UserPage() {
    const { id } = useParams();
    const userId = Number(id);

    const [user, setUser] = useState<UserResponse | null>(null);
    const [error, setError] = useState<ResponseMessage | null>(null);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(false);
    const [newUsername, setNewUsername] = useState("");


    const navigate = useNavigate();

    const handleClose = () => {
        navigate("/");
    };

    const handleSave = async () => {

        const userRequest: UserRequest = {
            username: newUsername,
            contacts: []
        }

        const result = await editUser(
            userId, userRequest
        );

        if ("code" in result) {
            alert(`Error ${result.code}: ${result.message}`);
            return;
        }

        setUser(result);
        setEditing(false);
    };

    const startEditing = () => {
        setNewUsername(user!.username);
        setEditing(true);
    };


    const handleDelete = async () => {
        if (!confirm("Delete this user?")) return;

        const result = await deleteUser(userId);

        if ("code" in result) {
            alert(`Error ${result.code}: ${result.message}`);
            return;
        }

        navigate("/");
    };

    useEffect(() => {
        let isMounted = true;

        fetchUserById(userId).then((result) => {
            if (!isMounted) return;

            if ("code" in result) {
                setError(result);
            } else {
                setUser(result);
            }

            setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [userId]);

    if (loading) {
        return <div className={styles.loading}>Loading user...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>Error {error.code}</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    if (!user) {
        return <div className={styles.error}>User not found</div>;
    }

    return (
        <div className={styles.wrapper}>
            <button className={styles.closeButton} onClick={handleClose}>
                ✕
            </button>

            <h1 className={styles.title}>User #{user.id}</h1>

            <div className={styles.userCard}>
                <div className={styles.usernameRow}>
                    {editing ? (
                        <>
                            <input
                                className={styles.usernameInput}
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                            <button className={styles.saveButton} onClick={handleSave}>
                                Save
                            </button>
                            <button className={styles.cancelButton} onClick={() => setEditing(false)}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className={styles.username}>{user.username}</h2>
                            <button className={styles.editButton} onClick={startEditing}>
                                Edit
                            </button>
                        </>
                    )}
                </div>
                <p className={styles.info}>Total contacts: {user.contacts.length}</p>
            </div>

            <h3 className={styles.contactsTitle}>Contacts</h3>

            <div className={styles.contactsList}>
                {user.contacts.map((c, index) => (
                    <div key={index} className={styles.contactItem}>
                        <span className={styles.contactType}>{c.contactType}</span>
                        <span className={styles.contactValue}>{c.content}</span>
                    </div>
                ))}
            </div>

            <button className={styles.deleteButton} onClick={handleDelete}>
                Delete user
            </button>

        </div>
    );
}

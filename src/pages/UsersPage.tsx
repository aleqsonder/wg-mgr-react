import { useEffect, useState } from "react";
import { fetchUsers } from "../api/usersApi";

import styles from "./UsersPage.module.css";
import { useNavigate } from "react-router-dom";
import type { UserResponse } from "../types/userRelated.ts";
import { UserItem } from "../components/UserItem.tsx";
import type { ResponseMessage } from "../types/responseMessages.ts";

export function UsersPage() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ResponseMessage | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        fetchUsers().then((result) => {
            if (!isMounted) return;

            if ("code" in result) {
                setError(result);
            } else {
                setUsers(result);
            }

            setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!loading) {
            const savedScroll = sessionStorage.getItem("users_scroll");

            if (savedScroll) {
                window.scrollTo({
                    top: Number(savedScroll),
                    behavior: "instant" as ScrollBehavior
                });

                sessionStorage.removeItem("users_scroll");
            }
        }
    }, [loading]);

    const handleUserClick = (id: number) => {
        sessionStorage.setItem("users_scroll", String(window.scrollY));
        navigate(`/users/${id}`);
    };

    if (loading) {
        return <div className={styles.loading}>Loading users...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error.message}</div>;
    }

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Users</h1>

            <div className={styles.list}>
                {users.map((user) => (
                    <UserItem
                        key={user.id}
                        user={user}
                        onClick={handleUserClick}
                    />
                ))}
            </div>
        </div>
    );
}

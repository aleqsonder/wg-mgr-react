import styles from "./UserItem.module.css";
import type { UserResponse } from "../types/userRelated.ts";

interface Props {
    user: UserResponse;
    onClick?: (id: number) => void;
}

export function UserItem({ user, onClick }: Props) {
    return (
        <div
            className={styles.item}
            onClick={() => onClick?.(user.id)}
        >
            <div className={styles.header}>
                <span className={styles.id}>#{user.id}</span>
                <span className={styles.username}>{user.username}</span>
            </div>

            <div className={styles.contacts}>
                {user.contacts.length} contacts
            </div>
        </div>
    );
}

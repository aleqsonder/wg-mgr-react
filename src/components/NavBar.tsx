import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";

export function NavBar() {
    return (
        <header className={styles.navbar}>
            <nav className={styles.nav}>
                <div className={styles.leftGroup}>
                    <NavLink
                        to="/"
                        className={({isActive}) =>
                            isActive ? styles.activeButton : styles.button
                        }
                    >
                        Users Management
                    </NavLink>
                    <NavLink
                        to="/create"
                        className={({ isActive }) =>
                            isActive ? styles.activeButton : styles.button
                        }
                    >
                        Create Users
                    </NavLink>
                </div>

                <div className={styles.rightGroup}>
                    <NavLink
                        to="/account"
                        className={({ isActive }) =>
                            isActive ? styles.activeButton : styles.button
                        }
                    >
                        Account
                    </NavLink>
                </div>
            </nav>
        </header>
    );
}

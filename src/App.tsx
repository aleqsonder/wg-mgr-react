import { Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { AccountPage } from "./pages/AccountPage";
import { UsersPage } from "./pages/UsersPage";

import styles from "./App.module.css";
import {UserPage} from "./pages/UserPage.tsx";
import {UserCreatePage} from "./pages/UserCreatePage.tsx";

function App() {
    return (
        <div className={styles.appWrapper}>
            <NavBar />

            <main className={styles.content}>
                <Routes>
                    <Route path="/" element={<UsersPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/create" element={<UserCreatePage />} />
                    <Route path="/users/:id" element={<UserPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;


import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = sessionStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            sessionStorage.removeItem("user");
            return null;
        }
    });

    const isAuthenticated = user !== null;

    function login(userData) {
        const authenticatedUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
        };

        sessionStorage.setItem(
            "user",
            JSON.stringify(authenticatedUser)
        );

        setUser(authenticatedUser);
    }

    function logout() {
        sessionStorage.removeItem("user");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("AuthProvider nerastas");
    }

    return context;
}

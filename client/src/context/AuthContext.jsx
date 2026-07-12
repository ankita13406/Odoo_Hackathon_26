import { createContext, useEffect, useState } from "react";
import { loginUser } from "../api/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("af_user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("af_token");
    });

    const [loading, setLoading] = useState(false);

   const login = async (email, password) => {

    setLoading(true);

    try {

        const response = await loginUser(
            email,
            password
        );

        const { token, user } =
            response.data.data;

        localStorage.setItem(
            "af_token",
            token
        );

        localStorage.setItem(
            "af_user",
            JSON.stringify(user)
        );

        setToken(token);
        setUser(user);

        return {
            success: true,
        };

    } catch (error) {

        return {
            success: false,
            message:
                error.response?.data?.error ||
                "Invalid email or password",
        };

    } finally {

        setLoading(false);

    }

};

    const logout = () => {
        localStorage.removeItem("af_token");
        localStorage.removeItem("af_user");

        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("af_token");
        const storedUser = localStorage.getItem("af_user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
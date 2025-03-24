import React, { createContext, useState } from "react"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./ApiHelper";

export type UserContextType = {
    user: AuthUser | null;
    token: string | null;
    login: (userData: AuthUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

type UserContextProviderType = {
    children: React.ReactNode;
}

type AuthUser = {
    id: string;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phone: string;
    address: string;
    token: string;
    refreshToken: string;
}

export const UserContext = createContext({} as UserContextType);

export const UserContextProvider = ({ children }: UserContextProviderType) => {
    const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Initialize state directly from localStorage
    const [user, setUser] = useState<AuthUser | null>(savedUser);
    const [token, setToken] = useState<string | null>(savedToken);

    const login = (userData: AuthUser) => {
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem(ACCESS_TOKEN_KEY, userData.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, userData.refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('user');
    };

    const isAuthenticated = !!user && !!token;

    return (
        <UserContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
            {children}
        </UserContext.Provider>
    );
};
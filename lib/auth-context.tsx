"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
    id: string
    email: string
    name: string
    role: "admin" | "cajero"
    createdAt: Date
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    isLoading: boolean
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Verificar si hay una sesión guardada
        const savedUserId = localStorage.getItem("userId")
        if (savedUserId) {
            const savedUser = getUserById(savedUserId)
            if (savedUser) {
                setUser(savedUser)
            }
        }
        setIsLoading(false)
    }, [])



    // Funciones de usuarios
    function getUserById(id: string): User | undefined {
        return users.find((user) => user.id === id)
    }

    function authenticateUser(email: string, password: string): User | null {
        // Simulación de autenticación - en producción usar hash de contraseñas
        const user = users.find((u) => u.email === email)
        return user || null
    }

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true)
        try {
            // Simulación de autenticación - en producción usar API real
            const authenticatedUser = authenticateUser(email, password)
            if (authenticatedUser) {
                setUser(authenticatedUser)
                localStorage.setItem("userId", authenticatedUser.id)
                setIsLoading(false)
                return true
            }
            setIsLoading(false)
            return false
        } catch (error) {
            setIsLoading(false)
            return false
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("userId")
    }

    return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

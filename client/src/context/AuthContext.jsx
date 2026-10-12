import { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthContextProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('authUser'))
        } catch {
            return null
        }
    })

    async function login(credentials) {
        const { data } = await api.post('/auth/login', credentials)
        const authenticatedUser = {
            name: data.name,
            email: data.email,
            token: data.token,
            role: data.role,
            address: data.address,
            workphone_no: data.workphone_no,
            cellphone_no: data.cellphone_no,
            dob: data.dob,
        }
        localStorage.setItem('authUser', JSON.stringify(authenticatedUser))
        setUser(authenticatedUser)
        return data
    }

    async function register(details) {
        const { data } = await api.post('/auth/register', details)
        return data
    }

    async function logout() {
        try {
            await api.post('/auth/logout')
        } finally {
            localStorage.removeItem('authUser')
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}

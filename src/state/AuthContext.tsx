import React, { createContext, useContext, useEffect, useState } from 'react'
type User = { username: string; role: 'admin' | 'docente'; sub: number }
type AuthState = { token: string | null; user: User | null }
type AuthContextType = AuthState & { login: (token: string, user: User) => void; logout: () => void }
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  useEffect(()=>{ const t=localStorage.getItem('token'); const u=localStorage.getItem('user'); if(t&&u){ setToken(t); setUser(JSON.parse(u)) } }, [])
  const login = (t: string, u: User) => { setToken(t); setUser(u); localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)) }
  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user') }
  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => { const ctx = useContext(AuthContext); if(!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }
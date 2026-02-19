import React, { createContext, useContext, useEffect, useState } from 'react'

// Aceptar tanto role (string único) como roles (array)
type User = { username: string; roles: string[]; sub: number }
type AuthState = { token: string | null; user: User | null }
type AuthContextType = AuthState & { login: (token: string, user: any) => void; logout: () => void }

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Normalizar usuario: convertir role -> roles si es necesario
function normalizeUser(userData: any): User {
  const roles = Array.isArray(userData.roles) 
    ? userData.roles 
    : userData.role 
    ? [userData.role] 
    : []
  
  return {
    username: userData.username,
    roles,
    sub: userData.sub,
  }
}

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(()=>{ 
    const t=localStorage.getItem('token')
    const u=localStorage.getItem('user')
    if(t&&u){ 
      setToken(t)
      const userData = JSON.parse(u)
      setUser(normalizeUser(userData))
    } 
  }, [])
  
  const login = (t: string, u: any) => { 
    const normalizedUser = normalizeUser(u)
    setToken(t)
    setUser(normalizedUser)
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(normalizedUser)) 
  }
  
  const logout = () => { 
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user') 
  }
  
  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => { 
  const ctx = useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx 
}
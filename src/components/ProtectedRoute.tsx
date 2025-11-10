import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
export default function ProtectedRoute({ children, roles }:{ children: JSX.Element, roles?: ('admin'|'docente')[] }){
  const { token, user } = useAuth()
  if(!token || !user) return <Navigate to="/login" replace />
  if(roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}
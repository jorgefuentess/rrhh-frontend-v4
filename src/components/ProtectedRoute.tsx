import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { hasRole } from '../config/roles'

export default function ProtectedRoute({ 
  children, 
  roles 
}: { 
  children: JSX.Element
  roles?: string[]
}) {
  const { token, user } = useAuth()
  
  if(!token || !user) return <Navigate to="/login" replace />
  
  if(roles && !hasRole(user.roles, roles)) {
    return <Navigate to="/" replace />
  }
  
  return children
}
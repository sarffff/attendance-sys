import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

const ProtectedRoute = ({ children }) => {
  const token = useAppSelector(state => state.user.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

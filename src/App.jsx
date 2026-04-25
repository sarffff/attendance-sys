import { useRoutes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getRoutes } from './router'

const App = () => {
  const userInfo = useSelector(state => state.user.userInfo);
  const routes = getRoutes(userInfo);
  return useRoutes(routes);
}

export default App

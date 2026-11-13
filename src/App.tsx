import UserList from './components/UserList'
import { useUsers } from './hooks/useUsers'

function App() {
  const { users } = useUsers()

  return (
    <main>
      <UserList users={users} />
    </main>
  )
}

export default App

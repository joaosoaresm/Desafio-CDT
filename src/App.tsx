import { useState } from 'react'
import UserList from './components/UserList'
import UserSearch from './components/UserSearch'
import { useUsers } from './hooks/useUsers'
import { filterUsersByName } from './utils/filterUsers'

function App() {
  const { users, loading, error } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = filterUsersByName(users, searchTerm)
  const hasSearchTerm = searchTerm.trim() !== ''
  const noResults =
    !loading && !error && hasSearchTerm && filteredUsers.length === 0

  return (
    <main>
      <UserSearch value={searchTerm} onChange={setSearchTerm} />
      {noResults ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <UserList users={filteredUsers} />
      )}
    </main>
  )
}

export default App

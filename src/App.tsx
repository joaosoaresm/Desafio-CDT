import { useState } from 'react'
import UserList from './components/UserList'
import UserModal from './components/UserModal'
import UserSearch from './components/UserSearch'
import { useUsers } from './hooks/useUsers'
import type { User } from './types/user'
import { filterUsersByName } from './utils/filterUsers'

function App() {
  const { users, loading, error } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filteredUsers = filterUsersByName(users, searchTerm)
  const hasSearchTerm = searchTerm.trim() !== ''
  const noResults =
    !loading && !error && hasSearchTerm && filteredUsers.length === 0

  function handleCloseModal() {
    setSelectedUser(null)
  }

  return (
    <>
      <main>
        <UserSearch value={searchTerm} onChange={setSearchTerm} />
        {noResults ? (
          <p>Nenhum usuário encontrado.</p>
        ) : (
          <UserList users={filteredUsers} onSelect={setSelectedUser} />
        )}
      </main>
      <UserModal user={selectedUser} onClose={handleCloseModal} />
    </>
  )
}

export default App

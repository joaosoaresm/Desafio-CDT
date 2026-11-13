import { useState } from 'react'
import ErrorState from './components/ErrorState'
import LoadingState from './components/LoadingState'
import UserList from './components/UserList'
import UserModal from './components/UserModal'
import UserSearch from './components/UserSearch'
import { useUsers } from './hooks/useUsers'
import type { User } from './types/user'
import { filterUsersByName } from './utils/filterUsers'

function App() {
  const { users, loading, error, reload } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filteredUsers = filterUsersByName(users, searchTerm)
  const hasSearchTerm = searchTerm.trim() !== ''
  const noResults =
    !loading && !error && hasSearchTerm && filteredUsers.length === 0

  function handleCloseModal() {
    setSelectedUser(null)
  }

  function renderContent() {
    if (loading) {
      return <LoadingState />
    }

    if (error) {
      return <ErrorState message={error} onRetry={reload} />
    }

    return (
      <>
        <UserSearch value={searchTerm} onChange={setSearchTerm} />
        {noResults ? (
          <p>Nenhum usuário encontrado.</p>
        ) : (
          <UserList users={filteredUsers} onSelect={setSelectedUser} />
        )}
      </>
    )
  }

  return (
    <>
      <main>{renderContent()}</main>
      <UserModal user={selectedUser} onClose={handleCloseModal} />
    </>
  )
}

export default App

import { useState } from 'react'
import ErrorState from './components/ErrorState'
import LoadingState from './components/LoadingState'
import UserList from './components/UserList'
import UserModal from './components/UserModal'
import UserSearch from './components/UserSearch'
import { useUsers } from './hooks/useUsers'
import type { User } from './types/user'
import { filterUsersByName } from './utils/filterUsers'
import './App.css'

function App() {
  const { users, loading, error, reload } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filteredUsers = filterUsersByName(users, searchTerm)
  const hasSearchTerm = searchTerm.trim() !== ''
  const noResults =
    !loading && !error && hasSearchTerm && filteredUsers.length === 0

  // O contador do cabeçalho só aparece quando a lista foi carregada.
  const showUserCount = !loading && !error
  const userCountLabel = `${users.length} ${users.length === 1 ? 'usuário' : 'usuários'}`

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
          <p className="empty-state">Nenhum usuário encontrado.</p>
        ) : (
          <UserList users={filteredUsers} onSelect={setSelectedUser} />
        )}
      </>
    )
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <h1 className="site-header__title">Desafio CDT</h1>
          {showUserCount && (
            <span className="site-header__count">{userCountLabel}</span>
          )}
        </div>
      </header>
      <main className="app">{renderContent()}</main>
      <UserModal user={selectedUser} onClose={handleCloseModal} />
    </>
  )
}

export default App

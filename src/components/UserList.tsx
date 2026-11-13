import type { User } from '../types/user'

type UserListProps = {
  users: User[]
  onSelect: (user: User) => void
}

function UserList({ users, onSelect }: UserListProps) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <button type="button" onClick={() => onSelect(user)}>
            {user.name}
          </button>
          <p>{user.email}</p>
        </li>
      ))}
    </ul>
  )
}

export default UserList

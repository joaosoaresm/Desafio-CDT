import type { User } from '../types/user'

type UserListProps = {
  users: User[]
}

function UserList({ users }: UserListProps) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <strong>{user.name}</strong>
          <p>{user.email}</p>
        </li>
      ))}
    </ul>
  )
}

export default UserList

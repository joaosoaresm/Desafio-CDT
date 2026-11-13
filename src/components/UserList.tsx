import type { User } from '../types/user'
import { getInitials } from '../utils/getInitials'
import './UserList.css'

type UserListProps = {
  users: User[]
  onSelect: (user: User) => void
}

function UserList({ users, onSelect }: UserListProps) {
  return (
    <ul className="user-list">
      {users.map((user) => (
        <li key={user.id} className="user-list__item">
          <span className="user-list__avatar" aria-hidden="true">
            {getInitials(user.name)}
          </span>
          <div className="user-list__info">
            <button
              type="button"
              className="user-list__name"
              onClick={() => onSelect(user)}
            >
              {user.name}
            </button>
            <p className="user-list__email">
              <svg
                className="user-list__email-icon"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              {user.email}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default UserList

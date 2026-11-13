import './UserSearch.css'

type UserSearchProps = {
  value: string
  onChange: (value: string) => void
}

function UserSearch({ value, onChange }: UserSearchProps) {
  return (
    <div className="user-search">
      <label className="user-search__label" htmlFor="user-search">
        Buscar por nome
      </label>
      <div className="user-search__field">
        <svg
          className="user-search__icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="user-search"
          className="user-search__input"
          type="search"
          placeholder="Buscar por nome..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}

export default UserSearch

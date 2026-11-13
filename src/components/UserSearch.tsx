type UserSearchProps = {
  value: string
  onChange: (value: string) => void
}

function UserSearch({ value, onChange }: UserSearchProps) {
  return (
    <div>
      <label htmlFor="user-search">Buscar por nome</label>
      <input
        id="user-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export default UserSearch

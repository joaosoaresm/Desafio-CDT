import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { mockUsers } from '../test/fixtures'
import UserList from './UserList'

describe('UserList', () => {
  it('mostra um item para cada usuário', () => {
    render(<UserList users={mockUsers} onSelect={vi.fn()} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(mockUsers.length)
  })

  it('mostra o nome e o e-mail de cada usuário no mesmo item', () => {
    render(<UserList users={mockUsers} onSelect={vi.fn()} />)

    const items = screen.getAllByRole('listitem')

    mockUsers.forEach((user, index) => {
      const item = within(items[index])
      expect(item.getByText(user.name)).toBeInTheDocument()
      expect(item.getByText(user.email)).toBeInTheDocument()
    })
  })

  it('mantém a ordem recebida', () => {
    render(<UserList users={mockUsers} onSelect={vi.fn()} />)

    const names = screen.getAllByRole('button').map((button) => button.textContent)

    expect(names).toEqual(mockUsers.map((user) => user.name))
  })

  it('não mostra nenhum item quando a lista está vazia', () => {
    render(<UserList users={[]} onSelect={vi.fn()} />)

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('tem um botão com o nome de cada usuário', () => {
    render(<UserList users={mockUsers} onSelect={vi.fn()} />)

    for (const user of mockUsers) {
      expect(screen.getByRole('button', { name: user.name })).toBeInTheDocument()
    }
  })

  it('chama onSelect com o usuário clicado', async () => {
    const onSelect = vi.fn()
    render(<UserList users={mockUsers} onSelect={onSelect} />)

    await userEvent.click(screen.getByRole('button', { name: 'Maria Conceição' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(mockUsers[1])
  })

  it('chama onSelect pelo teclado, com Tab e Enter', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<UserList users={mockUsers} onSelect={onSelect} />)

    await user.tab()
    await user.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith(mockUsers[0])
  })

  it('não chama onSelect sem interação', () => {
    const onSelect = vi.fn()
    render(<UserList users={mockUsers} onSelect={onSelect} />)

    expect(onSelect).not.toHaveBeenCalled()
  })
})

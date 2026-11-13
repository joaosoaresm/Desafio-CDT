import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { mockUsers } from '../test/fixtures'
import UserModal from './UserModal'

const selectedUser = mockUsers[0]

// O fundo é o elemento que envolve a caixa do modal.
function getBackdrop() {
  const backdrop = screen.getByRole('dialog').parentElement
  if (!backdrop) {
    throw new Error('O modal não tem um elemento de fundo')
  }
  return backdrop
}

describe('UserModal', () => {
  describe('quando user é null', () => {
    it('não renderiza nada', () => {
      const { container } = render(<UserModal user={null} onClose={vi.fn()} />)

      expect(container).toBeEmptyDOMElement()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('a tecla Esc não chama onClose', async () => {
      const onClose = vi.fn()
      render(<UserModal user={null} onClose={onClose} />)

      await userEvent.keyboard('{Escape}')

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('os cinco campos', () => {
    it('mostra o nome como título do modal', () => {
      render(<UserModal user={selectedUser} onClose={vi.fn()} />)

      expect(
        screen.getByRole('heading', { name: selectedUser.name }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('dialog', { name: selectedUser.name }),
      ).toBeInTheDocument()
    })

    it.each([
      ['E-mail', selectedUser.email],
      ['Telefone', selectedUser.phone],
      ['Empresa', selectedUser.company.name],
      ['Cidade', selectedUser.address.city],
    ])('mostra %s com o valor do usuário', (label, value) => {
      render(<UserModal user={selectedUser} onClose={vi.fn()} />)

      const dialog = within(screen.getByRole('dialog'))
      const term = dialog.getByText(label)

      // O valor fica logo depois do rótulo.
      expect(term.nextElementSibling).toHaveTextContent(value)
    })

    it('mostra os dados do novo usuário quando a prop muda', () => {
      const { rerender } = render(
        <UserModal user={selectedUser} onClose={vi.fn()} />,
      )

      rerender(<UserModal user={mockUsers[2]} onClose={vi.fn()} />)

      const dialog = within(screen.getByRole('dialog'))
      expect(dialog.getByText(mockUsers[2].email)).toBeInTheDocument()
      expect(dialog.queryByText(selectedUser.email)).not.toBeInTheDocument()
    })
  })

  describe('fechar', () => {
    it('fecha pelo botão Fechar', async () => {
      const onClose = vi.fn()
      render(<UserModal user={selectedUser} onClose={onClose} />)

      await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('fecha pela tecla Esc', async () => {
      const onClose = vi.fn()
      render(<UserModal user={selectedUser} onClose={onClose} />)

      await userEvent.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('fecha pela tecla Esc mesmo com o foco fora do modal', async () => {
      const onClose = vi.fn()
      render(<UserModal user={selectedUser} onClose={onClose} />)
      screen.getByRole('button', { name: 'Fechar' }).blur()

      await userEvent.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('fecha ao clicar no fundo', async () => {
      const onClose = vi.fn()
      render(<UserModal user={selectedUser} onClose={onClose} />)

      await userEvent.click(getBackdrop())

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('não fecha ao clicar dentro da caixa do modal', async () => {
      const onClose = vi.fn()
      render(<UserModal user={selectedUser} onClose={onClose} />)

      await userEvent.click(screen.getByRole('dialog'))
      await userEvent.click(screen.getByRole('heading', { name: selectedUser.name }))
      await userEvent.click(screen.getByText(selectedUser.email))

      expect(onClose).not.toHaveBeenCalled()
    })

    it('não fecha com outras teclas', async () => {
      const onClose = vi.fn()
      render(<UserModal user={selectedUser} onClose={onClose} />)

      await userEvent.keyboard('a{ArrowDown}{Tab}')

      expect(onClose).not.toHaveBeenCalled()
    })

    it('para de ouvir a tecla Esc depois que user volta a ser null', async () => {
      const onClose = vi.fn()
      const { rerender } = render(
        <UserModal user={selectedUser} onClose={onClose} />,
      )

      rerender(<UserModal user={null} onClose={onClose} />)
      await userEvent.keyboard('{Escape}')

      expect(onClose).not.toHaveBeenCalled()
    })

    it('para de ouvir a tecla Esc depois de desmontado', async () => {
      const onClose = vi.fn()
      const { unmount } = render(
        <UserModal user={selectedUser} onClose={onClose} />,
      )

      unmount()
      await userEvent.keyboard('{Escape}')

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('foco', () => {
    it('leva o foco para o botão Fechar ao abrir', () => {
      render(<UserModal user={selectedUser} onClose={vi.fn()} />)

      expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    })

    it('devolve o foco para o elemento anterior ao fechar', () => {
      render(<button type="button">Abrir</button>)
      const opener = screen.getByRole('button', { name: 'Abrir' })
      opener.focus()

      const { rerender } = render(
        <UserModal user={selectedUser} onClose={vi.fn()} />,
      )
      rerender(<UserModal user={null} onClose={vi.fn()} />)

      expect(opener).toHaveFocus()
    })
  })
})

import { useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import type { User } from '../types/user'
import './UserModal.css'

type UserModalProps = {
  user: User | null
  onClose: () => void
}

function UserModal({ user, onClose }: UserModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const isOpen = user !== null

  // Fecha com a tecla Esc enquanto o modal estiver aberto.
  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Ao abrir, leva o foco para o botão Fechar; ao fechar, devolve para onde estava.
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previouslyFocused = document.activeElement
    closeButtonRef.current?.focus()

    return () => {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [isOpen])

  if (user === null) {
    return null
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    // Só fecha se o clique foi no fundo, não em algo dentro da caixa do modal.
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="user-modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="user-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
      >
        <h2 id="user-modal-title">{user.name}</h2>
        <dl>
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
          <dt>Telefone</dt>
          <dd>{user.phone}</dd>
          <dt>Empresa</dt>
          <dd>{user.company.name}</dd>
          <dt>Cidade</dt>
          <dd>{user.address.city}</dd>
        </dl>
        <button
          type="button"
          className="button"
          ref={closeButtonRef}
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

export default UserModal

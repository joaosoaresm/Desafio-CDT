import { useCallback, useEffect, useState } from 'react'
import { fetchUsers } from '../services/userService'
import type { User } from '../types/user'

type UseUsersResult = {
  users: User[]
  loading: boolean
  error: string | null
  reload: () => void
}

function toErrorMessage(error: unknown): string {
  // O fetch lança TypeError quando a requisição nem chega a ter resposta (rede, DNS, CORS).
  if (error instanceof TypeError) {
    return 'Falha de conexão. Verifique sua internet e tente novamente.'
  }

  // O response.json() lança SyntaxError quando o corpo da resposta não é um JSON válido.
  if (error instanceof SyntaxError) {
    return 'A resposta do servidor veio em formato inválido. Tente novamente mais tarde.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Erro inesperado ao buscar usuários.'
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await fetchUsers()
        if (!ignore) {
          setUsers(data)
        }
      } catch (err) {
        if (!ignore) {
          setError(toErrorMessage(err))
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      ignore = true
    }
  }, [reloadCount])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadCount((count) => count + 1)
  }, [])

  return { users, loading, error, reload }
}

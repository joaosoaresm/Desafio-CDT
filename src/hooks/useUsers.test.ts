import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockUsers } from '../test/fixtures'
import { deferred, jsonResponse, stubFetch } from '../test/mockFetch'
import { useUsers } from './useUsers'

describe('useUsers', () => {
  describe('carregando', () => {
    it('começa com loading true, lista vazia e sem erro', async () => {
      const fetchMock = stubFetch()
      const request = deferred<Response>()
      fetchMock.mockReturnValue(request.promise)

      const { result } = renderHook(() => useUsers())

      expect(result.current.loading).toBe(true)
      expect(result.current.users).toEqual([])
      expect(result.current.error).toBeNull()

      // Termina a requisição para o teste não deixar nada pendente.
      await act(async () => request.resolve(jsonResponse(mockUsers)))
    })

    it('continua carregando enquanto a resposta não chega', async () => {
      const fetchMock = stubFetch()
      const request = deferred<Response>()
      fetchMock.mockReturnValue(request.promise)

      const { result } = renderHook(() => useUsers())
      await act(async () => {})

      expect(result.current.loading).toBe(true)

      await act(async () => request.resolve(jsonResponse(mockUsers)))
    })
  })

  describe('sucesso', () => {
    it('entrega os usuários e desliga o loading', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse(mockUsers))

      const { result } = renderHook(() => useUsers())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.users).toEqual(mockUsers)
      expect(result.current.error).toBeNull()
    })

    it('busca os usuários uma única vez ao montar', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse(mockUsers))

      const { result, rerender } = renderHook(() => useUsers())
      await waitFor(() => expect(result.current.loading).toBe(false))
      rerender()

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('mensagem de erro', () => {
    it('resposta não ok: mostra a mensagem com o status', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse(null, 500))

      const { result } = renderHook(() => useUsers())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.error).toBe('Erro ao buscar usuários (status 500)')
      expect(result.current.users).toEqual([])
    })

    it('falha de rede: mostra mensagem de conexão em português', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

      const { result } = renderHook(() => useUsers())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.error).toBe(
        'Falha de conexão. Verifique sua internet e tente novamente.',
      )
    })

    it('corpo que não é JSON: mostra mensagem de formato inválido', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token <')),
      } as Response)

      const { result } = renderHook(() => useUsers())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.error).toBe(
        'A resposta do servidor veio em formato inválido. Tente novamente mais tarde.',
      )
    })

    it('valor lançado que não é Error: mostra mensagem genérica', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockRejectedValue('algo estranho')

      const { result } = renderHook(() => useUsers())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.error).toBe('Erro inesperado ao buscar usuários.')
    })

    it('o erro é sempre um texto, nunca o objeto de erro', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

      const { result } = renderHook(() => useUsers())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(typeof result.current.error).toBe('string')
    })
  })

  describe('reload', () => {
    it('busca de novo e entrega os usuários depois de um erro', async () => {
      const fetchMock = stubFetch()
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(jsonResponse(mockUsers))

      const { result } = renderHook(() => useUsers())
      await waitFor(() => expect(result.current.error).not.toBeNull())

      act(() => result.current.reload())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.users).toEqual(mockUsers)
      expect(result.current.error).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('liga o loading e limpa o erro assim que é chamado', async () => {
      const fetchMock = stubFetch()
      const retry = deferred<Response>()
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockReturnValueOnce(retry.promise)

      const { result } = renderHook(() => useUsers())
      await waitFor(() => expect(result.current.error).not.toBeNull())

      act(() => result.current.reload())

      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()

      await act(async () => retry.resolve(jsonResponse(mockUsers)))
    })

    it('mostra o novo erro quando a nova tentativa também falha', async () => {
      const fetchMock = stubFetch()
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(jsonResponse(null, 503))

      const { result } = renderHook(() => useUsers())
      await waitFor(() => expect(result.current.error).not.toBeNull())

      act(() => result.current.reload())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.error).toBe('Erro ao buscar usuários (status 503)')
    })

    it('atualiza a lista com os dados da nova busca', async () => {
      const fetchMock = stubFetch()
      const updatedUsers = mockUsers.slice(0, 2)
      fetchMock
        .mockResolvedValueOnce(jsonResponse(mockUsers))
        .mockResolvedValueOnce(jsonResponse(updatedUsers))

      const { result } = renderHook(() => useUsers())
      await waitFor(() => expect(result.current.users).toEqual(mockUsers))

      act(() => result.current.reload())

      await waitFor(() => expect(result.current.users).toEqual(updatedUsers))
      expect(result.current.loading).toBe(false)
    })

    it('ignora a resposta antiga que chega depois da nova', async () => {
      const fetchMock = stubFetch()
      const firstRequest = deferred<Response>()
      const secondRequest = deferred<Response>()
      const newerUsers = mockUsers.slice(0, 1)
      fetchMock
        .mockReturnValueOnce(firstRequest.promise)
        .mockReturnValueOnce(secondRequest.promise)

      const { result } = renderHook(() => useUsers())
      act(() => result.current.reload())

      await act(async () => secondRequest.resolve(jsonResponse(newerUsers)))
      await act(async () => firstRequest.resolve(jsonResponse(mockUsers)))

      expect(result.current.users).toEqual(newerUsers)
      expect(result.current.loading).toBe(false)
    })

    it('ignora o erro de uma requisição antiga que falha depois da nova', async () => {
      const fetchMock = stubFetch()
      const firstRequest = deferred<Response>()
      const secondRequest = deferred<Response>()
      fetchMock
        .mockReturnValueOnce(firstRequest.promise)
        .mockReturnValueOnce(secondRequest.promise)

      const { result } = renderHook(() => useUsers())
      act(() => result.current.reload())

      await act(async () => secondRequest.resolve(jsonResponse(mockUsers)))
      await act(async () => firstRequest.reject(new TypeError('Failed to fetch')))

      expect(result.current.error).toBeNull()
      expect(result.current.users).toEqual(mockUsers)
    })

    it('é a mesma função entre renderizações', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse(mockUsers))

      const { result } = renderHook(() => useUsers())
      const firstReload = result.current.reload
      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(result.current.reload).toBe(firstReload)
    })
  })
})

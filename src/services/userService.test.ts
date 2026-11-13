import { describe, expect, it, vi } from 'vitest'
import { mockUsers } from '../test/fixtures'
import { jsonResponse, stubFetch } from '../test/mockFetch'
import { fetchUsers } from './userService'

describe('fetchUsers', () => {
  describe('sucesso', () => {
    it('devolve os usuários da resposta', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse(mockUsers))

      await expect(fetchUsers()).resolves.toEqual(mockUsers)
    })

    it('faz uma única requisição para o endpoint de usuários', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse(mockUsers))

      await fetchUsers()

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users',
      )
    })

    it('devolve lista vazia quando a API não tem usuários', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse([]))

      await expect(fetchUsers()).resolves.toEqual([])
    })
  })

  describe('resposta não ok', () => {
    it.each([400, 404, 500, 503])(
      'lança erro com a mensagem e o status %i',
      async (status) => {
        const fetchMock = stubFetch()
        fetchMock.mockResolvedValue(jsonResponse(null, status))

        await expect(fetchUsers()).rejects.toThrow(
          `Erro ao buscar usuários (status ${status})`,
        )
      },
    )

    it('lança um Error, não outro tipo de valor', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse(null, 500))

      await expect(fetchUsers()).rejects.toBeInstanceOf(Error)
    })

    it('não tenta ler o corpo da resposta', async () => {
      const fetchMock = stubFetch()
      const response = jsonResponse(null, 500)
      const jsonSpy = vi.spyOn(response, 'json')
      fetchMock.mockResolvedValue(response)

      await expect(fetchUsers()).rejects.toThrow()
      expect(jsonSpy).not.toHaveBeenCalled()
    })
  })

  describe('falha de rede', () => {
    it('repassa o erro lançado pelo fetch', async () => {
      const fetchMock = stubFetch()
      const networkError = new TypeError('Failed to fetch')
      fetchMock.mockRejectedValue(networkError)

      await expect(fetchUsers()).rejects.toBe(networkError)
    })
  })

  describe('resposta com corpo inválido', () => {
    it('repassa o erro de leitura do JSON', async () => {
      const fetchMock = stubFetch()
      const syntaxError = new SyntaxError('Unexpected token < in JSON')
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(syntaxError),
      } as Response)

      await expect(fetchUsers()).rejects.toBe(syntaxError)
    })
  })
})

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { mockUsers } from './test/fixtures'
import { deferred, jsonResponse, stubFetch } from './test/mockFetch'

const NO_RESULTS = 'Nenhum usuário encontrado.'

// Renderiza o App com a API respondendo com sucesso e espera a lista aparecer.
async function renderLoadedApp() {
  const fetchMock = stubFetch()
  fetchMock.mockResolvedValue(jsonResponse(mockUsers))
  const user = userEvent.setup()

  render(<App />)
  await screen.findByRole('list')

  return { user, fetchMock, search: screen.getByLabelText('Buscar por nome') }
}

function visibleNames() {
  return screen.getAllByRole('listitem').map((item) => {
    return within(item).getByRole('button').textContent
  })
}

describe('App', () => {
  describe('carregamento', () => {
    it('mostra "Carregando usuários..." enquanto a resposta não chega', async () => {
      const fetchMock = stubFetch()
      const request = deferred<Response>()
      fetchMock.mockReturnValue(request.promise)

      render(<App />)

      expect(screen.getByRole('status')).toHaveTextContent('Carregando usuários...')

      request.resolve(jsonResponse(mockUsers))
      await screen.findByRole('list')
    })

    it('não mostra a busca, a lista nem erro enquanto carrega', async () => {
      const fetchMock = stubFetch()
      const request = deferred<Response>()
      fetchMock.mockReturnValue(request.promise)

      render(<App />)

      expect(screen.queryByLabelText('Buscar por nome')).not.toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.queryByText(NO_RESULTS)).not.toBeInTheDocument()

      request.resolve(jsonResponse(mockUsers))
      await screen.findByRole('list')
    })

    it('troca o carregamento pela busca e pela lista quando a resposta chega', async () => {
      await renderLoadedApp()

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Buscar por nome')).toBeInTheDocument()
      expect(visibleNames()).toEqual(mockUsers.map((user) => user.name))
    })

    it('mostra o e-mail de cada usuário na lista', async () => {
      await renderLoadedApp()

      for (const user of mockUsers) {
        expect(screen.getByText(user.email)).toBeInTheDocument()
      }
    })
  })

  describe('busca', () => {
    it('filtra a lista pelo nome digitado', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, 'maria')

      expect(visibleNames()).toEqual(['Maria Conceição'])
    })

    it('ignora maiúsculas, acentos e espaços nas pontas', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, '  JOAO  ')

      // A Maria tem "joao" no e-mail e não pode aparecer.
      expect(visibleNames()).toEqual(['João Silva'])
    })

    it('não busca pelo e-mail', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, 'exemplo.com')

      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
      expect(screen.getByText(NO_RESULTS)).toBeInTheDocument()
    })

    it('trata caracteres especiais como texto comum', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, '(aninha)')

      expect(visibleNames()).toEqual(["Ana (Aninha) D'Ávila"])
    })

    it('mostra todos os usuários de novo quando o termo é apagado', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, 'maria')
      await user.clear(search)

      expect(visibleNames()).toEqual(mockUsers.map((item) => item.name))
    })

    it('mantém no campo o texto digitado', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, 'Leanne')

      expect(search).toHaveValue('Leanne')
    })

    it('não faz nova requisição ao digitar', async () => {
      const { user, search, fetchMock } = await renderLoadedApp()

      await user.type(search, 'maria')

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('nenhum resultado', () => {
    it('mostra a mensagem quando o termo não combina com nenhum nome', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, 'zzz')

      expect(screen.getByText(NO_RESULTS)).toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })

    it('mantém a busca na tela para a pessoa corrigir o termo', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, 'zzz')

      expect(search).toBeInTheDocument()
      expect(search).toHaveValue('zzz')
    })

    it('some quando o termo passa a ter resultado', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, 'zzz')
      await user.clear(search)
      await user.type(search, 'leanne')

      expect(screen.queryByText(NO_RESULTS)).not.toBeInTheDocument()
      expect(visibleNames()).toEqual(['Leanne Graham'])
    })

    it('não aparece sem termo digitado', async () => {
      await renderLoadedApp()

      expect(screen.queryByText(NO_RESULTS)).not.toBeInTheDocument()
    })

    it('não aparece quando o termo só tem espaços', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, '    ')

      expect(screen.queryByText(NO_RESULTS)).not.toBeInTheDocument()
      expect(visibleNames()).toEqual(mockUsers.map((item) => item.name))
    })

    it('não quebra nem vira curinga com ".*"', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, '.*')

      expect(screen.getByText(NO_RESULTS)).toBeInTheDocument()
    })

    it('não aparece quando a API devolve lista vazia e não há termo', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse([]))

      render(<App />)
      await screen.findByLabelText('Buscar por nome')

      expect(screen.queryByText(NO_RESULTS)).not.toBeInTheDocument()
    })
  })

  describe('erro', () => {
    it('falha de rede: mostra a mensagem de conexão como alerta', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

      render(<App />)

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Falha de conexão. Verifique sua internet e tente novamente.',
      )
    })

    it('resposta não ok: mostra a mensagem com o status', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue(jsonResponse(null, 500))

      render(<App />)

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Erro ao buscar usuários (status 500)',
      )
    })

    it('corpo inválido: mostra a mensagem de formato inválido', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token <')),
      } as Response)

      render(<App />)

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'A resposta do servidor veio em formato inválido. Tente novamente mais tarde.',
      )
    })

    it('não mostra a busca, a lista, o carregamento nem "nenhum resultado"', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

      render(<App />)
      await screen.findByRole('alert')

      expect(screen.queryByLabelText('Buscar por nome')).not.toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(screen.queryByText(NO_RESULTS)).not.toBeInTheDocument()
    })

    it('mostra o botão "Tentar novamente"', async () => {
      const fetchMock = stubFetch()
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

      render(<App />)

      expect(
        await screen.findByRole('button', { name: 'Tentar novamente' }),
      ).toBeInTheDocument()
    })
  })

  describe('botão "Tentar novamente"', () => {
    it('busca de novo e mostra a lista quando a nova tentativa dá certo', async () => {
      const fetchMock = stubFetch()
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(jsonResponse(mockUsers))
      const user = userEvent.setup()

      render(<App />)
      await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))

      await screen.findByRole('list')
      expect(visibleNames()).toEqual(mockUsers.map((item) => item.name))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('mostra o carregamento e esconde o erro durante a nova tentativa', async () => {
      const fetchMock = stubFetch()
      const retry = deferred<Response>()
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockReturnValueOnce(retry.promise)
      const user = userEvent.setup()

      render(<App />)
      await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))

      expect(screen.getByRole('status')).toHaveTextContent('Carregando usuários...')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Tentar novamente' }),
      ).not.toBeInTheDocument()

      retry.resolve(jsonResponse(mockUsers))
      await screen.findByRole('list')
    })

    it('mostra o erro de novo quando a nova tentativa também falha', async () => {
      const fetchMock = stubFetch()
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(jsonResponse(null, 503))
      const user = userEvent.setup()

      render(<App />)
      await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Erro ao buscar usuários (status 503)',
      )
      expect(
        screen.getByRole('button', { name: 'Tentar novamente' }),
      ).toBeInTheDocument()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('funciona pelo teclado, com Tab e Enter', async () => {
      const fetchMock = stubFetch()
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(jsonResponse(mockUsers))
      const user = userEvent.setup()

      render(<App />)
      await screen.findByRole('alert')
      await user.tab()
      await user.keyboard('{Enter}')

      expect(await screen.findByRole('list')).toBeInTheDocument()
    })
  })

  describe('modal de detalhes', () => {
    it('abre com os dados do usuário clicado e fecha com Esc', async () => {
      const { user } = await renderLoadedApp()

      await user.click(screen.getByRole('button', { name: 'Leanne Graham' }))

      const dialog = within(screen.getByRole('dialog', { name: 'Leanne Graham' }))
      expect(dialog.getByText('leanne@exemplo.com')).toBeInTheDocument()
      expect(dialog.getByText('1-770-736-8031 x56442')).toBeInTheDocument()
      expect(dialog.getByText('Romaguera-Crona')).toBeInTheDocument()
      expect(dialog.getByText('Gwenborough')).toBeInTheDocument()

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('não está aberto antes de um usuário ser escolhido', async () => {
      await renderLoadedApp()

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('abre o usuário certo depois de filtrar a lista', async () => {
      const { user, search } = await renderLoadedApp()

      await user.type(search, 'conceicao')
      await user.click(screen.getByRole('button', { name: 'Maria Conceição' }))

      expect(
        screen.getByRole('dialog', { name: 'Maria Conceição' }),
      ).toBeInTheDocument()
    })
  })
})

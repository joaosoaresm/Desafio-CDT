import { vi } from 'vitest'

// Troca o fetch global por um mock, para os testes não dependerem da internet.
// O setup devolve o fetch original depois de cada teste.
export function stubFetch() {
  const fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

// Resposta falsa com o mínimo que o fetchUsers lê: ok, status e json().
export function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response
}

// Promise que o teste resolve ou rejeita quando quiser, para simular uma requisição em andamento.
export function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

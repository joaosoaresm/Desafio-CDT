import type { User } from '../types/user'

// Deixa o texto em uma forma comparável: sem maiúsculas, sem acentos e sem espaços sobrando.
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// A busca compara o termo somente com o nome do usuário.
export function filterUsersByName(users: User[], term: string): User[] {
  const normalizedTerm = normalizeText(term)

  if (normalizedTerm === '') {
    return users
  }

  return users.filter((user) =>
    normalizeText(user.name).includes(normalizedTerm),
  )
}

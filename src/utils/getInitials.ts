// Títulos ignorados quando aparecem no início do nome.
const TITLES = new Set(['mr.', 'mrs.', 'ms.', 'dr.', 'prof.'])

function firstLetter(word: string): string {
  // Array.from separa por caractere completo, sem partir letras fora do alfabeto básico.
  return Array.from(word)[0] ?? ''
}

// Iniciais para o avatar: primeira letra do primeiro e do último nome, em maiúsculas.
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)

  // Remove os títulos do início, mas nunca a única palavra que restar.
  while (words.length > 1 && TITLES.has(words[0].toLowerCase())) {
    words.shift()
  }

  if (words.length === 0) {
    return ''
  }

  const first = firstLetter(words[0])
  const last = words.length > 1 ? firstLetter(words[words.length - 1]) : ''

  return (first + last).toUpperCase()
}

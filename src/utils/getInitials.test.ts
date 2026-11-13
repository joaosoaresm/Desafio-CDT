import { describe, expect, it } from 'vitest'
import { getInitials } from './getInitials'

describe('getInitials', () => {
  it('usa a primeira letra do primeiro e do último nome', () => {
    expect(getInitials('Leanne Graham')).toBe('LG')
  })

  it('ignora os nomes do meio', () => {
    expect(getInitials('Nicholas Runolfsdottir V')).toBe('NV')
    expect(getInitials('Maria da Conceição Silva')).toBe('MS')
  })

  it('ignora o título no início: "Mrs. Dennis Schulist" gera "DS"', () => {
    expect(getInitials('Mrs. Dennis Schulist')).toBe('DS')
  })

  it.each(['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'dr.', 'PROF.'])(
    'ignora o título "%s" no início do nome',
    (title) => {
      expect(getInitials(`${title} Leanne Graham`)).toBe('LG')
    },
  )

  it('não ignora o título quando ele não está no início', () => {
    expect(getInitials('Leanne Graham Dr.')).toBe('LD')
  })

  it('usa o título quando o nome não tem mais nada', () => {
    expect(getInitials('Dr.')).toBe('D')
  })

  it('devolve uma letra só quando o nome tem uma palavra', () => {
    expect(getInitials('Leanne')).toBe('L')
  })

  it('devolve as iniciais em maiúsculas', () => {
    expect(getInitials('leanne graham')).toBe('LG')
  })

  it('mantém letras acentuadas', () => {
    expect(getInitials('Érica Ávila')).toBe('ÉÁ')
  })

  it('ignora espaços sobrando', () => {
    expect(getInitials('  Leanne    Graham  ')).toBe('LG')
  })

  it('devolve texto vazio para nome vazio ou só com espaços', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('    ')).toBe('')
  })
})

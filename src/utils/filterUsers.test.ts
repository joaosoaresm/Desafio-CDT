import { describe, expect, it } from 'vitest'
import { mockUsers } from '../test/fixtures'
import { filterUsersByName, normalizeText } from './filterUsers'

const namesFor = (term: string) =>
  filterUsersByName(mockUsers, term).map((user) => user.name)

describe('normalizeText', () => {
  it('passa o texto para minúsculas', () => {
    expect(normalizeText('LEANNE Graham')).toBe('leanne graham')
  })

  it('remove acentos e cedilha', () => {
    expect(normalizeText('João Conceição Ávila Müller Peña')).toBe(
      'joao conceicao avila muller pena',
    )
  })

  it('remove espaços no início e no fim', () => {
    expect(normalizeText('   joão   ')).toBe('joao')
  })

  it('reduz espaços repetidos, tabs e quebras de linha a um espaço só', () => {
    expect(normalizeText('joão    da \t silva\n\nneto')).toBe(
      'joao da silva neto',
    )
  })

  it('devolve texto vazio para termo vazio ou só com espaços', () => {
    expect(normalizeText('')).toBe('')
    expect(normalizeText('     ')).toBe('')
  })

  it('mantém caracteres especiais como estão', () => {
    expect(normalizeText("D'Ávila (Jr.) [x] \\ .* + ? $ ^")).toBe(
      "d'avila (jr.) [x] \\ .* + ? $ ^",
    )
  })
})

describe('filterUsersByName', () => {
  describe('termo vazio', () => {
    it('devolve a lista completa quando o termo é vazio', () => {
      expect(filterUsersByName(mockUsers, '')).toEqual(mockUsers)
    })

    it('devolve a lista completa quando o termo só tem espaços', () => {
      expect(filterUsersByName(mockUsers, '    ')).toEqual(mockUsers)
    })
  })

  describe('busca só pelo nome', () => {
    it('não encontra usuário cujo e-mail contém o termo', () => {
      // "joao" aparece no e-mail da Maria, mas só o João tem isso no nome.
      expect(namesFor('joao')).toEqual(['João Silva'])
    })

    it('não busca em e-mail, telefone, cidade ou empresa', () => {
      expect(namesFor('exemplo.com')).toEqual([])
      expect(namesFor('91234')).toEqual([])
      expect(namesFor('gwenborough')).toEqual([])
      expect(namesFor('romaguera')).toEqual([])
    })

    it('encontra por um trecho no meio do nome', () => {
      expect(namesFor('anne gra')).toEqual(['Leanne Graham'])
    })

    it('devolve todos os usuários que combinam, na ordem original', () => {
      expect(namesFor('an')).toEqual(['Leanne Graham', "Ana (Aninha) D'Ávila"])
    })
  })

  describe('maiúsculas e minúsculas', () => {
    it.each(['leanne', 'LEANNE', 'LeAnNe'])('encontra com o termo "%s"', (term) => {
      expect(namesFor(term)).toEqual(['Leanne Graham'])
    })
  })

  describe('acentos', () => {
    it('"joao" encontra "João"', () => {
      expect(namesFor('joao')).toEqual(['João Silva'])
    })

    it('"JOÃO" encontra "João"', () => {
      expect(namesFor('JOÃO')).toEqual(['João Silva'])
    })

    it('"conceicao" encontra "Conceição"', () => {
      expect(namesFor('conceicao')).toEqual(['Maria Conceição'])
    })

    it('termo com acento encontra nome sem acento', () => {
      expect(namesFor('léanne')).toEqual(['Leanne Graham'])
    })
  })

  describe('espaços', () => {
    it('ignora espaços no início e no fim do termo', () => {
      expect(namesFor('   maria   ')).toEqual(['Maria Conceição'])
    })

    it('ignora espaços repetidos entre as palavras do termo', () => {
      expect(namesFor('maria     conceicao')).toEqual(['Maria Conceição'])
    })

    it('ignora espaços repetidos no nome do usuário', () => {
      const users = [{ ...mockUsers[0], name: '  João    Silva ' }]
      expect(filterUsersByName(users, 'joao silva')).toEqual(users)
    })
  })

  describe('termo sem resultado', () => {
    it('devolve lista vazia quando nenhum nome combina', () => {
      expect(filterUsersByName(mockUsers, 'zzz')).toEqual([])
    })

    it('devolve lista vazia quando não há usuários', () => {
      expect(filterUsersByName([], 'joao')).toEqual([])
      expect(filterUsersByName([], '')).toEqual([])
    })
  })

  describe('caracteres especiais', () => {
    it('trata parênteses como texto comum', () => {
      expect(namesFor('(')).toEqual(["Ana (Aninha) D'Ávila"])
      expect(namesFor('(aninha)')).toEqual(["Ana (Aninha) D'Ávila"])
    })

    it('trata apóstrofo como texto comum', () => {
      expect(namesFor("d'avila")).toEqual(["Ana (Aninha) D'Ávila"])
    })

    it('não trata ".*" como curinga', () => {
      expect(namesFor('.*')).toEqual([])
      expect(namesFor('a.*a')).toEqual([])
    })

    it.each(['[', ']', '\\', '+', '?', '*', '$', '^', '|', '{', '(?', '[a-'])(
      'não quebra com o termo "%s"',
      (term) => {
        expect(() => filterUsersByName(mockUsers, term)).not.toThrow()
        expect(filterUsersByName(mockUsers, term)).toEqual([])
      },
    )
  })

  it('não altera a lista original', () => {
    const copy = structuredClone(mockUsers)
    filterUsersByName(mockUsers, 'joao')
    expect(mockUsers).toEqual(copy)
  })
})

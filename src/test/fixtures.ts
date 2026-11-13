import type { User } from '../types/user'

// Usuários fictícios usados nos testes.
// O e-mail da Maria contém "joao" de propósito, para provar que a busca olha só o nome.
export const mockUsers: User[] = [
  {
    id: 1,
    name: 'João Silva',
    email: 'silva@exemplo.com',
    phone: '(11) 91234-5678',
    address: { city: 'São Paulo' },
    company: { name: 'Silva & Filhos' },
  },
  {
    id: 2,
    name: 'Maria Conceição',
    email: 'contato.joao@exemplo.com',
    phone: '(21) 99876-5432',
    address: { city: 'Rio de Janeiro' },
    company: { name: 'Conceição Ltda' },
  },
  {
    id: 3,
    name: 'Leanne Graham',
    email: 'leanne@exemplo.com',
    phone: '1-770-736-8031 x56442',
    address: { city: 'Gwenborough' },
    company: { name: 'Romaguera-Crona' },
  },
  {
    id: 4,
    name: "Ana (Aninha) D'Ávila",
    email: 'ana@exemplo.com',
    phone: '(31) 3333-4444',
    address: { city: 'Belo Horizonte' },
    company: { name: 'Ávila Tech' },
  },
]

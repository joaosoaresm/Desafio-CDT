# Desafio-CDT
Aplicação React + Vite + TypeScript que lista usuários da API JSONPlaceholder, com busca por nome e detalhes em modal.

## Pré-requisitos

- Node.js 22.22.2 ou superior, ou 24.15 ou superior (testado com Node 26)
- npm, que já vem com o Node.

O Node 20 não é suportado pelo Vitest 5 e pelo jsdom 31, usados nos testes.

## Instalação e execução

```bash
npm install
npm run dev
```

Depois, abra `http://localhost:5173` no navegador.

## Testes

```bash
npm run test
```

Os testes usam Vitest, React Testing Library e jsdom. O `fetch` é simulado, então eles rodam sem internet.

## Build

```bash
npm run build
```

O comando checa os tipos com o TypeScript e gera a versão de produção na pasta `dist/`.

## Estrutura de pastas

Todas as pastas ficam dentro de `src/`.

| Pasta | Conteúdo |
|---|---|
| `components/` | Componentes de tela: busca, lista, modal e estados de carregamento e erro. |
| `hooks/` | O hook `useUsers`, que busca os usuários e controla carregamento, erro e recarga. |
| `services/` | A chamada à API (`fetchUsers`). |
| `types/` | O tipo `User`, com os campos da API que o projeto usa. |
| `utils/` | Funções puras da busca: normalização de texto e filtro por nome. |
| `test/` | Apoio aos testes: configuração, usuários fictícios e simulação do `fetch`. |

Cada arquivo de teste fica ao lado do código que ele testa, com o sufixo `.test.ts` ou `.test.tsx`.

## Decisões técnicas

### Vitest no lugar de Jest

O Vitest reaproveita a configuração do Vite. TypeScript, JSX e módulos ES funcionam sem Babel e sem configuração duplicada. A API de testes é quase igual à do Jest.

### Normalização de acentos na busca

O termo e o nome passam pela mesma função antes da comparação. Ela converte para minúsculas, separa os acentos das letras com `normalize('NFD')`, remove os acentos e ajusta os espaços. Assim, "joao" encontra "João".

A comparação usa `includes`, e não uma expressão regular montada com o texto digitado. Caracteres como `(` e `.*` são tratados como texto comum. A busca considera só o nome.

### Respostas antigas ignoradas no hook

Cada busca do `useUsers` tem uma flag `ignore`. Quando o componente é desmontado ou uma nova busca começa, a flag da busca anterior vira `true`. Se a resposta antiga chegar depois, ela é descartada.

Isso evita que uma resposta atrasada sobrescreva a mais nova. Também cobre o `StrictMode`, que executa o efeito duas vezes em desenvolvimento. A requisição não é abortada na rede; só o resultado é ignorado.

### `role="status"` e `role="alert"` nos estados

Os dois fazem o leitor de tela anunciar o texto sem a pessoa navegar até ele. O carregamento usa `role="status"`, que espera o leitor terminar o que está falando. O erro usa `role="alert"`, que interrompe e anuncia na hora, porque a pessoa precisa agir.

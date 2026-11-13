import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  // Desmonta o que foi renderizado e devolve o fetch original depois de cada teste.
  cleanup()
  vi.unstubAllGlobals()
})

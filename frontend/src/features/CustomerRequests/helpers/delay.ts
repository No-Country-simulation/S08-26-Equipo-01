export const MOCK_DELAY_MS = 500

export const delay = (ms: number = MOCK_DELAY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))
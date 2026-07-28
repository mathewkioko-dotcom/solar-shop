const MOCK_DELAY_MS = 700

export async function submitContactRequest(payload) {
  // TODO: Replace this isolated mock with the production contact API before launch.
  await new Promise((resolve) => window.setTimeout(resolve, MOCK_DELAY_MS))

  return {
    accepted: true,
    delivery: 'local-mock',
    reference: `local-${Date.now()}`,
    payload,
  }
}

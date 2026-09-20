const BASE_URL = import.meta.env.VITE_BASE_URL

export async function apiFetch<T> (
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {})
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    let errorMessage = errorData.message || `Error: ${response.status}`

    if (errorData.errors && Array.isArray(errorData.errors)) {
      errorMessage = errorData.errors
        .map((err: { path?: string; param?: string; msg?: string }) => `${err.path || err.param}: ${err.msg}`)
        .join('\n')
    }

    throw new Error(errorMessage)
  }

  // Some endpoints might return no content (like DELETE)
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

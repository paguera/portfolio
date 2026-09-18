const BASE_URL = (import.meta.env.VITE_BASE_URL || '') + '/api'

async function apiFetch<T> (
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
        .map((err: any) => `${err.msg || err.message}`)
        .join('\n')
    }

    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export default apiFetch

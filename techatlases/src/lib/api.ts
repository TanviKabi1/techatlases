const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private token: string | null = localStorage.getItem('techatlas_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('techatlas_token', token);
    else localStorage.removeItem('techatlas_token');
  }

  getToken() {
    return this.token;
  }

  async request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'API Request failed' }));
      throw new Error(error.error || 'API Request failed');
    }
    return response.json();
  }

  get(path: string) { return this.request(path); }
  post(path: string, data: any) { return this.request(path, { method: 'POST', body: JSON.stringify(data) }); }
  put(path: string, data: any) { return this.request(path, { method: 'PUT', body: JSON.stringify(data) }); }
  delete(path: string) { return this.request(path, { method: 'DELETE' }); }
}

export const api = new ApiClient();

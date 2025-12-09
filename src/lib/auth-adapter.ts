const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'admin' | 'customer';
  is_active?: boolean;
}

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: AuthError;
}

class LocalAuthAdapter {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch {
        this.user = null;
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  async signUp(email: string, password: string, full_name?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Signup failed' } };
      }

      this.token = data.token;
      this.refreshToken = data.refreshToken;
      this.user = data.user;

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      return { user: data.user, token: data.token };
    } catch (error) {
      return { error: { message: 'Network error' } };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Login failed' } };
      }

      this.token = data.token;
      this.refreshToken = data.refreshToken;
      this.user = data.user;

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      return { user: data.user, token: data.token };
    } catch (error) {
      return { error: { message: 'Network error' } };
    }
  }

  async signOut(): Promise<void> {
    this.token = null;
    this.refreshToken = null;
    this.user = null;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
    } catch {
      // Ignore errors on logout
    }
  }

  async getSession(): Promise<{ user: User | null; token: string | null }> {
    if (!this.token || !this.user) {
      return { user: null, token: null };
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.signOut();
        return { user: null, token: null };
      }

      const data = await response.json();
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));

      return { user: this.user, token: this.token };
    } catch {
      return { user: this.user, token: this.token };
    }
  }

  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!this.token) return null;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.user as UserProfile;
    } catch {
      return null;
    }
  }

  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }
}

export const authAdapter = new LocalAuthAdapter();

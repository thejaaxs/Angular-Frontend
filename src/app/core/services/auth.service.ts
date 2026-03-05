import { Injectable } from '@angular/core';
import { AuthResponse, UserRole } from '../../shared/models/auth.model';

const KEY = 'jwt_auth_v1';

export interface JwtAuthState {
  token: string;
  emailId: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly roleHomeMap: Record<UserRole, string> = {
    ROLE_CUSTOMER: '/home',
    ROLE_DEALER: '/home',
    ROLE_ADMIN: '/forbidden',
  };

  getState(): JwtAuthState | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as JwtAuthState;
    } catch {
      localStorage.removeItem(KEY);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getState()?.token;
  }

  saveLogin(res: AuthResponse) {
    const state: JwtAuthState = {
      token: res.token,
      emailId: res.emailId,
      role: res.role,
    };
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  logout() {
    localStorage.removeItem(KEY);
  }

  getToken(): string | null {
    return this.getState()?.token ?? null;
  }

  getRole(): UserRole | null {
    return this.getState()?.role ?? null;
  }

  getEmail(): string | null {
    return this.getState()?.emailId ?? null;
  }

  getHomeRoute(role = this.getRole()): string {
    if (!role) return '/login';
    return this.roleHomeMap[role] ?? '/login';
  }
}

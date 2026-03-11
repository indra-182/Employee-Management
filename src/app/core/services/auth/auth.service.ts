import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _authenticated = signal(false);
  readonly authenticated = this._authenticated.asReadonly();

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin123') {
      this._authenticated.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    this._authenticated.set(false);
  }
}

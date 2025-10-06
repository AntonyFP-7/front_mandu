import { Injectable, inject } from '@angular/core';
import { StorageService } from '../storage.service';

interface Session {
  token: string;
  data: {
    id: number;
    email: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private _storageService = inject(StorageService);

  getSession(): Session | null {
    let currentSession: Session | null = null;
    const maybeSession = this._storageService.get<Session>('session');
    if (this.isValidSession(maybeSession)) {
      currentSession = maybeSession;
    } else {
      // Si la sesión no es válida, eliminarla del almacenamiento
      this.clearSession();
    }
    return currentSession;
  }
  private isValidSession(maybeSession: unknown): boolean {
    const isValidSession =
      typeof maybeSession === 'object' && maybeSession !== null && 'token' in maybeSession;
    return isValidSession;
  }

  clearSession(): void {
    this._storageService.remove('session');
  }
}

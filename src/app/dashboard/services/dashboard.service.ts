import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../login/services/storage.service';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

// Interfaz para la sesión guardada
interface SessionData {
  statusCode: number;
  message: string;
  data: {
    id: number;
    email: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient, private storage: StorageService, private router: Router) {}

  getDivisions() {
    const sessionData = this.storage.get<SessionData>('session');
    // Validar que la sesión existe
    if (!sessionData) {
      this.logout();
      return [];
    }
    // Extraer el token de la sesión
    const { token } = sessionData;

    // Validar que el token existe
    if (!token) {
      this.logout();
        return [];
    }

    return this.http
      .get(`${environment.API_URL}/divisions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log('Respuesta de divisiones:', response);
          return response;
        })
      );
  }
  logout() {
    this.storage.remove('session');
    //redigirimos al login
    this.router.navigate(['/login']);
  }
}

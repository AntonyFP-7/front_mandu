import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../login/services/storage.service';
import { environment } from '../../../environments/environment';
import { tap, catchError, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

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

// Interfaces para la respuesta completa de la API
interface Ambassador {
  id: number;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: boolean;
  divisionId: number;
  createdAt: string;
  updatedAt: string;
}

interface DivisionParent {
  id: number;
  name: string;
  level: number;
  status: boolean;
  parentId: number | null;
  ambassadorId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DivisionChild {
  id: number;
  name: string;
  level: number;
  status: boolean;
  parentId: number;
  ambassadorId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Interfaz principal para las divisiones
interface Division {
  id: number;
  name: string;
  level: number;
  status: boolean;
  parentId: number | null;
  ambassadorId: number | null;
  createdAt: string;
  updatedAt: string;
  ambassador: Ambassador | null;
  parent: DivisionParent | null;
  children: DivisionChild[];
  employees: Employee[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient, private storage: StorageService, private router: Router) {}

  getDivisions(): Observable<Division[]> {
    const session = this.storage.get<{ token: string }>('session');
    const token = session?.token || null;
    if (!token) {
      this.logout();
      return of([]);
    }

    return this.http
      .get<Division[]>(`${environment.API_URL}/divisions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((response) => {
          console.log('Respuesta de divisiones:', response);
        }),
        catchError((error) => {
          // Si es error 401 (Unauthorized), hacer logout
          if (error.status === 401) {
            console.log('Token expirado o inválido, cerrando sesión');
            this.logout();
          }

          // Retornar array vacío en caso de error
          return of([]);
        })
      );
  }
  createDivision(divisionData: any): Observable<any> {
    const session = this.storage.get<{ token: string }>('session');
    const token = session?.token || null;

    if (!token) {
      this.logout();
      return throwError(() => new Error('No token available'));
    }

    return this.http.post(`${environment.API_URL}/divisions`, divisionData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  deleteDivision(divisionId: number): Observable<any> {
    const session = this.storage.get<{ token: string }>('session');
    const token = session?.token || null;

    if (!token) {
      this.logout();
      return throwError(() => new Error('No token available'));
    }

    return this.http.delete(`${environment.API_URL}/divisions/${divisionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).pipe(
      tap((response) => {
        console.log('División eliminada exitosamente:', response);
      }),
      catchError((error) => {
        console.error('Error al eliminar división:', error);
        
        // Si es error 401 (Unauthorized), hacer logout
        if (error.status === 401) {
          console.log('Token expirado o inválido, cerrando sesión');
          this.logout();
        }

        return throwError(() => error);
      })
    );
  }

  updateDivision(divisionId: number, divisionData: any): Observable<any> {
    const session = this.storage.get<{ token: string }>('session');
    const token = session?.token || null;

    if (!token) {
      this.logout();
      return throwError(() => new Error('No token available'));
    }
console.log('Datos para actualizar división:', divisionData);
    return this.http.put(`${environment.API_URL}/divisions/${divisionId}`, divisionData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).pipe(
      tap((response) => {
        console.log('División actualizada exitosamente:', response);
      }),
      catchError((error) => {
        console.error('Error al actualizar división:', error);
        
        // Si es error 401 (Unauthorized), hacer logout
        if (error.status === 401) {
          console.log('Token expirado o inválido, cerrando sesión');
          this.logout();
        }

        return throwError(() => error);
      })
    );
  }

  logout() {
    this.storage.remove('session');
    this.router.navigate(['/login']);
  }
}

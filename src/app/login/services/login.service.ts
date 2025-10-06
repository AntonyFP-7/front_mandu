import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { tap } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  // Aquí puedes agregar métodos para manejar la lógica de autenticación
  constructor(private http: HttpClient, private storage: StorageService) {}
  Login(emial: string, password: string) {
    {
      // Lógica de inicio de sesión
      return this.http
        .post(`${environment.API_URL}/login`, {
          // datos de inicio de sesión
          email: emial,
          password: password,
        })
        .pipe(
          tap((response) => {
            // Manejar la respuesta del servidor aquí si es necesario
            this.storage.set('session', response);
          })
        );
    }
  }
}

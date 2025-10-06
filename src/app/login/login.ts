import { Component, inject } from '@angular/core';
import { Validators, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoginService } from './services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export default class Login {
  private _loginService = inject(LoginService);
  private _route = inject(Router);

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private message: NzMessageService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this._loginService.Login(email, password).subscribe({
        next: (response) => {
          //console.log('Respuesta del servidor:', response);
          this.message.success('Inicio de sesión exitoso');
          this._route.navigate(['/dashboard']);
        },
        error: (error) => {
          //console.error('Error en el inicio de sesión:', error);
          this.message.error('Error en el inicio de sesión. Por favor, verifica tus credenciales.');
        },
      });
      /*  this.message.success('¡Formulario válido! NgZorro está funcionando correctamente.');
      console.log('Datos del formulario:', this.loginForm.value); */
    } else {
      this.message.error('Por favor, completa todos los campos correctamente.');
      Object.values(this.loginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}

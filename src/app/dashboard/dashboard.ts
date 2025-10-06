import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from './services/dashboard.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { toSignal } from '@angular/core/rxjs-interop';

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

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzTableModule,
    NzSpinModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzLayoutModule,
    NzMenuModule,
    NzDropDownModule,
    NzAvatarModule,
    NzBadgeModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export default class Dashboard {
  private dashboardService = inject(DashboardService);
  private fb = inject(FormBuilder);

  divisions = toSignal(this.dashboardService.getDivisions());
  
  // Estado del menú seleccionado
  selectedMenuItem = 'dashboard';
  
  // Contador de notificaciones (simulado)
  notificationCount = 3;
  messageCount = 5;

  // Modal para crear división
  isCreateModalVisible = false;
  createDivisionForm: FormGroup;

  constructor() {
    this.createDivisionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      level: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      status: [true],
      parentId: [null],
      ambassadorId: [null]
    });
  }

  // Computed properties para estadísticas
  get totalEmployees(): number {
    const divisionsList = this.divisions();
    if (!divisionsList) return 0;
    return divisionsList.reduce((total, div) => total + (div.employees?.length || 0), 0);
  }

  get totalAmbassadors(): number {
    const divisionsList = this.divisions();
    if (!divisionsList) return 0;
    return divisionsList.filter(div => div.ambassador).length;
  }

  get activeDivisions(): number {
    const divisionsList = this.divisions();
    if (!divisionsList) return 0;
    return divisionsList.filter(div => div.status).length;
  }

  // Método para seleccionar item del menú
  selectMenuItem(item: string): void {
    this.selectedMenuItem = item;
    console.log('Menú seleccionado:', item);
  }

  // Método para cerrar sesión
  logout(): void {
    this.dashboardService.logout();
  }

  // Método para ir a mensajes
  goToMessages(): void {
    console.log('Ir a mensajes');
  }

  // Método para ir a notificaciones
  goToNotifications(): void {
    console.log('Ir a notificaciones');
    // Resetear contador al hacer clic
    this.notificationCount = 0;
  }

  // Métodos para el modal de crear división
  showCreateModal(): void {
    this.isCreateModalVisible = true;
  }

  handleCancel(): void {
    this.isCreateModalVisible = false;
    this.createDivisionForm.reset({
      name: '',
      level: 1,
      status: true,
      parentId: null,
      ambassadorId: null
    });
  }

  handleOk(): void {
    if (this.createDivisionForm.valid) {
      const formData = this.createDivisionForm.value;
      console.log('Crear nueva división:', formData);
      
      // Aquí iría la llamada al servicio para crear la división
      // this.dashboardService.createDivision(formData).subscribe(...)
      
      this.isCreateModalVisible = false;
      this.createDivisionForm.reset({
        name: '',
        level: 1,
        status: true,
        parentId: null,
        ambassadorId: null
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.values(this.createDivisionForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  // Métodos helper para colores de las etiquetas
  getLevelColor(level: number): string {
    const colors = ['blue', 'green', 'orange', 'red', 'purple'];
    return colors[level - 1] || 'default';
  }

  getEmployeeCountColor(count: number): string {
    if (count === 0) return 'red';
    if (count <= 5) return 'orange';
    if (count <= 10) return 'blue';
    return 'green';
  }

  getSubdivisionCountColor(count: number): string {
    if (count === 0) return 'default';
    if (count <= 2) return 'blue';
    if (count <= 5) return 'green';
    return 'purple';
  }
}

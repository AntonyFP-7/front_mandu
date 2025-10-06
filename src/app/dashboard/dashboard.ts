import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './services/dashboard.service';
import ModalCreate from '../modal-create/modal-create';
import { signal, WritableSignal } from '@angular/core';
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
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

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
  deleting?: boolean; // Propiedad opcional para manejar estado de loading
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ModalCreate,
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
    NzTooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export default class Dashboard {
  constructor(private message: NzMessageService, private _route: Router) {
    // Cargar divisiones al inicializar
    this.loadDivisions();
  }
  
  private dashboardService = inject(DashboardService);

  // Usar WritableSignal para poder actualizar manualmente
  divisions: WritableSignal<Division[]> = signal([]);

  // Estado del menú seleccionado
  selectedMenuItem = 'dashboard';

  // Contador de notificaciones (simulado)
  notificationCount = 3;
  messageCount = 5;

  // Modal para crear división
  isCreateModalVisible = false;
  @ViewChild(ModalCreate) modalCreateComponent!: ModalCreate;

  // Método para cargar divisiones inicialmente
  private loadDivisions(): void {
    this.dashboardService.getDivisions().subscribe({
      next: (divisionsData) => {
        this.divisions.set(divisionsData);
      },
      error: (error) => {
        console.error('Error al cargar divisiones:', error);
        this.divisions.set([]);
      }
    });
  }

  // Método para refrescar las divisiones
  refreshDivisions(): void {
    this.loadDivisions();
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
    return divisionsList.filter((div) => div.ambassador).length;
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

  onModalVisibilityChange(visible: boolean): void {
    this.isCreateModalVisible = visible;
  }

  onDivisionCreated(divisionData: any): void {
    // Aquí llamo al servicio para crear la división
    this.dashboardService.createDivision(divisionData).subscribe({
      next: (response) => {
        this.message.success('División creada exitosamente');
        
        // Refrescar la lista de divisiones
        this.refreshDivisions();
        
        // Cerrar el modal y resetear formulario solo cuando es exitoso
        this.isCreateModalVisible = false;
        this.modalCreateComponent.resetForm();
      },
      error: (error) => {
        console.log('Error al crear la división:', error);
        this.message.error(error.error.message || 'Error al crear la división. Por favor, intenta nuevamente.');
        
        // Solo cerrar sesión si es error 401 (token inválido)
        if (error.status === 401) {
          this.logout();
          this.isCreateModalVisible = false;
          this.modalCreateComponent.resetForm();
        }
        // Para otros errores, el modal permanece abierto y el formulario mantiene los datos
      },
    });
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

  // Métodos para eliminar división
  confirmDeleteDivision(division: Division): void {
      this.deleteDivision(division);
  }

  deleteDivision(division: Division): void {
    // Agregar flag de loading a la división
    division.deleting = true;
    
    this.dashboardService.deleteDivision(division.id).subscribe({
      next: (response: any) => {
        this.message.success(`División "${division.name}" eliminada exitosamente`);
        
        // Refrescar la lista de divisiones
        this.refreshDivisions();
      },
      error: (error: any) => {
        console.error('Error al eliminar división:', error);
        division.deleting = false; // Quitar loading en caso de error
        
        const errorMessage = error.error?.message || 'Error al eliminar la división. Por favor, intenta nuevamente.';
        this.message.error(errorMessage);
        
        // Solo cerrar sesión si es error 401 (token inválido)
        if (error.status === 401) {
          this.logout();
        }
      },
    });
  }
}

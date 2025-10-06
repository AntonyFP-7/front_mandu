import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from './services/dashboard.service';
import ModalCreate from '../modal-create/modal-create';
import { signal, WritableSignal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule, NzTableSortOrder } from 'ng-zorro-antd/table';
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
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
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
  deleting?: boolean; // Propiedad opcional para manejar estado de loading
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
  showSubdivisions?: boolean; // Propiedad para mostrar/ocultar subdivisiones
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    NzFormModule,
    NzInputModule,
    NzSelectModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export default class Dashboard {
  constructor(private message: NzMessageService, private _route: Router) {
    // Cargar divisiones al inicializar
    this.loadDivisions();
    
    // Inicializar formulario de edición
    this.editDivisionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(45)]],
      level: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      parentId: [null]
    });
  }
  
  private dashboardService = inject(DashboardService);
  private fb = inject(FormBuilder);

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

  // Modal para editar división
  isEditModalVisible = false;
  editDivisionForm: FormGroup;
  editingDivision: Division | null = null;
  editLoading = false;

  // Sistema de ordenamiento
  sortOrder = {
    name: null as 'ascend' | 'descend' | null,
    parent: null as 'ascend' | 'descend' | null,
    employees: null as 'ascend' | 'descend' | null,
    level: null as 'ascend' | 'descend' | null,
    subdivisions: null as 'ascend' | 'descend' | null,
    ambassador: null as 'ascend' | 'descend' | null,
  };
  
  currentSortColumn: string | null = null;
  
  // Direcciones de ordenamiento permitidas
  sortDirections: NzTableSortOrder[] = ['ascend', 'descend', null];

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

  // Función computed para obtener divisiones ordenadas
  sortedDivisions = () => {
    const data = this.divisions();
    if (!data || data.length === 0) return [];
    
    if (!this.currentSortColumn) return data;
    
    const sorted = [...data].sort((a, b) => {
      let result = 0;
      
      switch (this.currentSortColumn) {
        case 'name':
          result = a.name.localeCompare(b.name);
          break;
        case 'parent':
          const parentA = a.parent?.name || '';
          const parentB = b.parent?.name || '';
          result = parentA.localeCompare(parentB);
          break;
        case 'employees':
          const employeesA = a.employees?.length || 0;
          const employeesB = b.employees?.length || 0;
          result = employeesA - employeesB;
          break;
        case 'level':
          result = a.level - b.level;
          break;
        case 'subdivisions':
          const subdivisionsA = a.children?.length || 0;
          const subdivisionsB = b.children?.length || 0;
          result = subdivisionsA - subdivisionsB;
          break;
        case 'ambassador':
          const ambassadorA = a.ambassador?.fullName || '';
          const ambassadorB = b.ambassador?.fullName || '';
          result = ambassadorA.localeCompare(ambassadorB);
          break;
      }
      
      return this.sortOrder[this.currentSortColumn as keyof typeof this.sortOrder] === 'descend' ? -result : result;
    });
    
    return sorted;
  };

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

  // Métodos para editar división
  showEditModal(division: Division): void {
    this.editingDivision = division;
    this.isEditModalVisible = true;
    
    console.log('División a editar:', division);
    console.log('Nivel original:', division.level, 'tipo:', typeof division.level);
    
    // Llenar el formulario con los datos actuales de la división
    const formValues = {
      name: division.name,
      level: Number(division.level), // Asegurar que sea número
      parentId: division.parentId
    };
    
    console.log('Valores del formulario:', formValues);
    
    this.editDivisionForm.patchValue(formValues);
    
    // Verificar que se haya asignado correctamente
    setTimeout(() => {
      console.log('Valor actual del formulario:', this.editDivisionForm.value);
    }, 100);
  }

  handleEditCancel(): void {
    this.isEditModalVisible = false;
    this.editingDivision = null;
    this.editDivisionForm.reset();
  }

  handleEditOk(): void {
    if (this.editDivisionForm.valid && this.editingDivision) {
      this.editLoading = true;
      const formData = this.editDivisionForm.value;
      
      this.dashboardService.updateDivision(this.editingDivision.id, formData).subscribe({
        next: (response: any) => {
          this.message.success(`División "${formData.name}" actualizada exitosamente`);
          
          // Refrescar la lista de divisiones
          this.refreshDivisions();
          
          // Cerrar el modal
          this.isEditModalVisible = false;
          this.editingDivision = null;
          this.editLoading = false;
          this.editDivisionForm.reset();
        },
        error: (error: any) => {
          console.error('Error al actualizar división:', error);
          this.editLoading = false;
          
          const errorMessage = error.error?.message || 'Error al actualizar la división. Por favor, intenta nuevamente.';
          this.message.error(errorMessage);
          
          // Solo cerrar sesión si es error 401 (token inválido)
          if (error.status === 401) {
            this.logout();
            this.isEditModalVisible = false;
            this.editingDivision = null;
          }
          // Para otros errores, el modal permanece abierto
        },
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.values(this.editDivisionForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  // Método para obtener divisiones disponibles como padre (excluyendo la división actual y sus hijos)
  getAvailableParentDivisions(): Division[] {
    if (!this.editingDivision) {
      return this.divisions() || [];
    }
    
    const allDivisions = this.divisions() || [];
    
    // Filtrar la división actual y sus subdivisiones para evitar referencia circular
    return allDivisions.filter(division => {
      // No puede ser padre de sí misma
      if (division.id === this.editingDivision!.id) {
        return false;
      }
      
      // No puede ser padre de una de sus subdivisiones
      if (division.parentId === this.editingDivision!.id) {
        return false;
      }
      
      return true;
    });
  }

  // Método para mostrar/ocultar subdivisiones
  toggleSubdivisions(division: Division): void {
    division.showSubdivisions = !division.showSubdivisions;
    console.log(`Subdivisiones de "${division.name}" ${division.showSubdivisions ? 'mostradas' : 'ocultadas'}`);
  }

  // Métodos adaptadores para manejar subdivisiones
  showEditModalForChild(child: DivisionChild): void {
    // Convertir DivisionChild a Division para editar
    const divisionToEdit: Division = {
      id: child.id,
      name: child.name,
      level: child.level,
      status: child.status,
      parentId: child.parentId,
      ambassadorId: child.ambassadorId,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
      ambassador: null,
      parent: null,
      children: [],
      employees: []
    };
    this.showEditModal(divisionToEdit);
  }

  confirmDeleteChildDivision(child: DivisionChild): void {
    // Convertir DivisionChild a Division para eliminar
    const divisionToDelete: Division = {
      id: child.id,
      name: child.name,
      level: child.level,
      status: child.status,
      parentId: child.parentId,
      ambassadorId: child.ambassadorId,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
      ambassador: null,
      parent: null,
      children: [],
      employees: [],
      deleting: child.deleting
    };
    this.confirmDeleteDivision(divisionToDelete);
  }

  // Método para manejar cambios de ordenamiento
  sort(column: string, order: NzTableSortOrder): void {
    // Resetear todos los órdenes de ordenamiento
    Object.keys(this.sortOrder).forEach(key => {
      this.sortOrder[key as keyof typeof this.sortOrder] = null;
    });
    
    // Establecer el nuevo orden
    if (order === 'ascend' || order === 'descend') {
      this.sortOrder[column as keyof typeof this.sortOrder] = order;
      this.currentSortColumn = column;
    } else {
      this.currentSortColumn = null;
    }
    
    console.log(`Ordenando por ${column}: ${order}`);
  }
}

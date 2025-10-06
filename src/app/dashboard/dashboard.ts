import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './services/dashboard.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
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
    NzCardModule,
    NzTableModule,
    NzSpinModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export default class Dashboard {
  private dashboardService = inject(DashboardService);

  divisions = toSignal(this.dashboardService.getDivisions());
}

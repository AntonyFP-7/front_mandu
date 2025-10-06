import { Component, inject } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export default class Dashboard {
  dashboardService = inject(DashboardService);
  divisions = toSignal(this.dashboardService.getDivisions(), { initialValue: [] });
}

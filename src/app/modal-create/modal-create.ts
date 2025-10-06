import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';

// Interfaz para las divisiones
interface Division {
  id: number;
  name: string;
  level: number;
  status: boolean;
  parentId: number | null;
  ambassadorId: number | null;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-modal-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
  ],
  templateUrl: './modal-create.html',
  styleUrl: './modal-create.scss',
})
export default class ModalCreate {
  private fb = inject(FormBuilder);

  // Inputs para recibir datos del componente padre
  @Input() isVisible = false;
  @Input() divisions: Division[] = [];

  // Outputs para emitir eventos al componente padre
  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() divisionCreated = new EventEmitter<any>();

  createDivisionForm: FormGroup;

  constructor() {
    this.createDivisionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]],
      level: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      parentId: [null],
      ambassadorId: [null],
    });
  }
  // Métodos para el modal de crear división
  handleCancel(): void {
    this.visibilityChange.emit(false);
    // Resetear el formulario cuando se cancela
    this.resetForm();
  }

  handleOk(): void {
    if (this.createDivisionForm.valid) {
      const formData = this.createDivisionForm.value;
      console.log('Formulario válido, enviando datos:', formData);

      // Emitir el evento con los datos del formulario
      // NO cerrar el modal aquí - dejar que el componente padre decida
      this.divisionCreated.emit(formData);

      // NO ejecutar visibilityChange.emit(false) ni reset aquí
      // El dashboard se encargará de cerrar el modal solo si es exitoso
    } else {
      // Marcar todos los campos como touched para mostrar errores
      console.log('Formulario inválido, mostrando errores');
      Object.values(this.createDivisionForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  // Método público para resetear el formulario desde el componente padre
  public resetForm(): void {
    this.createDivisionForm.reset({
      name: '',
      level: 1,
      parentId: null,
      ambassadorId: null,
    });
  }
}

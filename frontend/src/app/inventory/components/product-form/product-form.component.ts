import { Component, inject, signal, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../shared/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="p-4 sm:p-6 max-w-3xl mx-auto">
      <nav class="mb-4 text-sm" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 text-slate-500">
          <li>
            <a routerLink="/inventory/products" class="hover:text-slate-700 transition-colors">Inventario</a>
          </li>
          <li aria-hidden="true">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li class="font-medium text-slate-700">
            {{ isEditMode() ? 'Editar producto' : 'Nuevo producto' }}
          </li>
        </ol>
      </nav>

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">
          {{ isEditMode() ? 'Editar producto' : 'Registrar nuevo producto' }}
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Completa los datos del producto. Los campos marcados con * son obligatorios.
        </p>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <section class="card">
          <header class="card-header">
            <div>
              <h2 class="card-title">Información general</h2>
              <p class="card-subtitle">Datos básicos del producto</p>
            </div>
          </header>

          <div class="space-y-4">
            <div>
              <label for="nombre" class="input-label input-required">Nombre</label>
              <input id="nombre" [(ngModel)]="form.nombre" name="nombre" required class="input-field" placeholder="Ej. Antiparasitario para perros 10mg" />
            </div>

            <div>
              <label for="descripcion" class="input-label">Descripción</label>
              <textarea
                id="descripcion"
                [(ngModel)]="form.descripcion"
                name="descripcion"
                class="input-field"
                rows="3"
                placeholder="Descripción opcional del producto"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="categoria" class="input-label input-required">Categoría</label>
                <select id="categoria" [(ngModel)]="form.categoria" name="categoria" required class="input-field">
                  <option value="MEDICAMENTO">Medicamento</option>
                  <option value="ALIMENTO">Alimento</option>
                  <option value="ACCESORIO">Accesorio</option>
                </select>
              </div>

              <div>
                <label for="precio" class="input-label input-required">Precio (COP)</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm" aria-hidden="true">&#36;</span>
                  <input
                    id="precio"
                    type="number"
                    [(ngModel)]="form.precio"
                    name="precio"
                    required
                    min="0"
                    step="0.01"
                    class="input-field pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <header class="card-header">
            <div>
              <h2 class="card-title">Stock</h2>
              <p class="card-subtitle">Inventario y nivel mínimo de alerta</p>
            </div>
          </header>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="stock" class="input-label">Stock actual</label>
              <input id="stock" type="number" [(ngModel)]="form.stock" name="stock" min="0" class="input-field" />
              <p class="input-helper">Cantidad disponible para venta</p>
            </div>

            <div>
              <label for="stockMinimo" class="input-label">Stock mínimo</label>
              <input id="stockMinimo" type="number" [(ngModel)]="form.stockMinimo" name="stockMinimo" min="0" class="input-field" />
              <p class="input-helper">Genera alerta de bajo stock</p>
            </div>
          </div>
        </section>

        @if (requiresLote() || requiresFechaCaducidad()) {
          <section class="card">
            <header class="card-header">
              <div>
                <h2 class="card-title">Trazabilidad</h2>
                <p class="card-subtitle">Lote y caducidad según categoría</p>
              </div>
            </header>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @if (requiresLote()) {
                <div>
                  <label for="lote" class="input-label input-required">Lote</label>
                  <input id="lote" [(ngModel)]="form.lote" name="lote" required class="input-field" placeholder="L-2025-001" />
                </div>
              }

              @if (requiresFechaCaducidad()) {
                <div>
                  <label for="fechaCaducidad" class="input-label input-required">Fecha de caducidad</label>
                  <input
                    id="fechaCaducidad"
                    type="date"
                    [(ngModel)]="form.fechaCaducidad"
                    name="fechaCaducidad"
                    required
                    class="input-field"
                  />
                </div>
              }
            </div>
          </section>
        }

        @if (isEditMode()) {
          <section class="card">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="form.activo"
                name="activo"
                class="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500"
              />
              <span>
                <span class="block text-sm font-medium text-slate-800">Producto activo</span>
                <span class="block text-xs text-slate-500">Los productos inactivos no aparecen en ventas</span>
              </span>
            </label>
          </section>
        }

        @if (error()) {
          <div class="alert-danger" role="alert">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd" />
            </svg>
            <span>{{ error() }}</span>
          </div>
        }

        <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button type="button" (click)="cancel()" class="btn-secondary">
            Cancelar
          </button>
          <button type="submit" [disabled]="saving()" class="btn-primary">
            @if (saving()) {
              <span class="spinner" aria-hidden="true"></span>
              <span>Guardando...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Guardar producto</span>
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  productId = input<string | null>(null);
  isEditMode = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  form: any = {
    nombre: '',
    descripcion: '',
    categoria: 'MEDICAMENTO',
    precio: 0,
    stock: 0,
    stockMinimo: 0,
    lote: '',
    fechaCaducidad: '',
  };

  ngOnInit() {
    if (this.productId()) {
      this.isEditMode.set(true);
      this.loadProduct();
    }
  }

  loadProduct() {
    this.productService.getById(this.productId()!).subscribe({
      next: (product) => {
        this.form = {
          nombre: product.nombre,
          descripcion: product.descripcion || '',
          categoria: product.categoria,
          precio: product.precio,
          stock: product.stock,
          stockMinimo: product.stockMinimo,
          lote: product.lote || '',
          fechaCaducidad: product.fechaCaducidad ? product.fechaCaducidad.split('T')[0] : '',
          activo: product.activo,
        };
      },
      error: () => {
        this.error.set('Error al cargar producto');
      },
    });
  }

  requiresLote(): boolean {
    return this.form.categoria === 'MEDICAMENTO';
  }

  requiresFechaCaducidad(): boolean {
    return this.form.categoria === 'MEDICAMENTO' || this.form.categoria === 'ALIMENTO';
  }

  onSubmit() {
    this.saving.set(true);
    this.error.set(null);

    const dto = {
      ...this.form,
      lote: this.requiresLote() ? this.form.lote : undefined,
      fechaCaducidad: this.requiresFechaCaducidad() ? this.form.fechaCaducidad : undefined,
    };

    if (this.isEditMode() && this.productId()) {
      this.productService.update(this.productId()!, dto).subscribe({
        next: () => {
          this.router.navigate(['/inventory/products']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al guardar');
          this.saving.set(false);
        },
      });
    } else {
      this.productService.create(dto).subscribe({
        next: () => {
          this.router.navigate(['/inventory/products']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear');
          this.saving.set(false);
        },
      });
    }
  }

  cancel() {
    this.router.navigate(['/inventory/products']);
  }
}

import { Component, inject, signal, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../shared/services/product.service';
import { Product, CreateProductDto, CategoriaProducto } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">
        {{ isEditMode() ? 'Editar Producto' : 'Nuevo Producto' }}
      </h1>

      <form (ngSubmit)="onSubmit()" class="card space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
          <input [(ngModel)]="form.nombre" name="nombre" required class="input-field" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea [(ngModel)]="form.descripcion" name="descripcion" class="input-field" rows="2"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
            <select [(ngModel)]="form.categoria" name="categoria" required class="input-field">
              <option value="MEDICAMENTO">Medicamento</option>
              <option value="ALIMENTO">Alimento</option>
              <option value="ACCESORIO">Accesorio</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Precio *</label>
            <input type="number" [(ngModel)]="form.precio" name="precio" required min="0" step="0.01" class="input-field" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Stock</label>
            <input type="number" [(ngModel)]="form.stock" name="stock" min="0" class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
            <input type="number" [(ngModel)]="form.stockMinimo" name="stockMinimo" min="0" class="input-field" />
          </div>
        </div>

        @if (requiresLote()) {
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Lote *</label>
            <input [(ngModel)]="form.lote" name="lote" required class="input-field" />
          </div>
        }

        @if (requiresFechaCaducidad()) {
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Fecha de Caducidad *</label>
            <input type="date" [(ngModel)]="form.fechaCaducidad" name="fechaCaducidad" required class="input-field" />
          </div>
        }

        @if (isEditMode()) {
          <div>
            <label class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="form.activo" name="activo" class="rounded" />
              <span class="text-sm font-medium text-slate-700">Producto activo</span>
            </label>
          </div>
        }

        <div class="flex gap-3 pt-4">
          <button type="submit" [disabled]="saving()" class="btn-primary">
            {{ saving() ? 'Guardando...' : 'Guardar' }}
          </button>
          <button type="button" (click)="cancel()" class="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>

      @if (error()) {
        <div class="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
          <p class="text-red-700">{{ error() }}</p>
        </div>
      }
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
    fechaCaducidad: ''
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
          activo: product.activo
        };
      },
      error: () => {
        this.error.set('Error al cargar producto');
      }
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
      fechaCaducidad: this.requiresFechaCaducidad() ? this.form.fechaCaducidad : undefined
    };

    if (this.isEditMode() && this.productId()) {
      this.productService.update(this.productId()!, dto).subscribe({
        next: () => {
          this.router.navigate(['/inventory/products']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al guardar');
          this.saving.set(false);
        }
      });
    } else {
      this.productService.create(dto).subscribe({
        next: () => {
          this.router.navigate(['/inventory/products']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear');
          this.saving.set(false);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/inventory/products']);
  }
}
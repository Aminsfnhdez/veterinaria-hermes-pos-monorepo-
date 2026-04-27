import { Component, inject, signal, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../shared/services/client.service';
import { Client, CreateClientDto } from '../../../shared/models/client.model';

@Component({
  selector: 'app-client-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-2">
        <div class="flex-1 relative">
          <label for="client-search" class="sr-only">Buscar cliente</label>
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400" aria-hidden="true">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <input
            id="client-search"
            type="text"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            (focus)="showDropdown = true"
            placeholder="Buscar cliente por nombre o identificación..."
            class="input-field pl-10"
            aria-describedby="client-search-hint"
          />
          <span id="client-search-hint" class="sr-only">Escriba para buscar clientes</span>

          @if (showDropdown && filteredClients().length > 0) {
            <ul
              class="dropdown-panel max-h-60 overflow-auto"
              role="listbox"
              aria-label="Resultados de clientes"
            >
              @for (client of filteredClients(); track client.id) {
                <li>
                  <button
                    type="button"
                    (click)="selectClient(client)"
                    class="dropdown-item"
                    role="option"
                  >
                    <p class="font-medium text-slate-800 truncate">{{ client.nombre }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">
                      {{ client.identificacion }}
                      @if (client.nombreMascota) {
                        <span class="text-slate-400"> &middot; {{ client.nombreMascota }}</span>
                      }
                    </p>
                  </button>
                </li>
              }
            </ul>
          }
        </div>
        <button
          type="button"
          (click)="toggleNewClientForm()"
          class="btn-secondary"
          [attr.aria-expanded]="showNewClientForm"
          aria-controls="new-client-form"
        >
          @if (showNewClientForm) {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Cancelar</span>
          } @else {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo cliente</span>
          }
        </button>
      </div>

      @if (showNewClientForm) {
        <div id="new-client-form" class="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <h4 class="font-semibold text-sm text-slate-800">Registrar nuevo cliente</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="new-client-nombre" class="input-label input-required">Nombre</label>
              <input id="new-client-nombre" [(ngModel)]="newClient.nombre" placeholder="Nombre completo" class="input-field" />
            </div>
            <div>
              <label for="new-client-identificacion" class="input-label input-required">Identificación</label>
              <input id="new-client-identificacion" [(ngModel)]="newClient.identificacion" placeholder="Cédula / NIT" class="input-field" />
            </div>
            <div>
              <label for="new-client-telefono" class="input-label">Teléfono</label>
              <input id="new-client-telefono" [(ngModel)]="newClient.telefono" placeholder="3001234567" class="input-field" />
            </div>
            <div>
              <label for="new-client-email" class="input-label">Email</label>
              <input id="new-client-email" [(ngModel)]="newClient.email" type="email" placeholder="cliente@correo.com" class="input-field" />
            </div>
            <div>
              <label for="new-client-mascota" class="input-label">Nombre mascota</label>
              <input id="new-client-mascota" [(ngModel)]="newClient.nombreMascota" placeholder="Firulais" class="input-field" />
            </div>
            <div>
              <label for="new-client-tipo" class="input-label">Tipo mascota</label>
              <input id="new-client-tipo" [(ngModel)]="newClient.tipoMascota" placeholder="Perro, Gato..." class="input-field" />
            </div>
          </div>
          <button type="button" (click)="createClient()" class="btn-primary btn-sm">
            Guardar cliente
          </button>
        </div>
      }

      @if (selectedClient()) {
        <div
          class="flex items-center gap-3 p-3 rounded-xl border border-primary-200 bg-primary-50"
          role="status"
          aria-live="polite"
        >
          <span class="flex items-center justify-center w-9 h-9 rounded-full bg-primary-600 text-white font-semibold text-xs flex-shrink-0">
            {{ initials(selectedClient()!.nombre) }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-slate-900 truncate">{{ selectedClient()?.nombre }}</p>
            <p class="text-xs text-slate-600 truncate">
              {{ selectedClient()?.identificacion }}
              @if (selectedClient()?.nombreMascota) {
                <span class="text-slate-500"> &middot; {{ selectedClient()?.nombreMascota }}</span>
              }
            </p>
          </div>
          <button
            type="button"
            (click)="clearClient()"
            class="btn-icon flex-shrink-0"
            aria-label="Quitar cliente seleccionado"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ClientSelectComponent implements OnInit {
  private clientService = inject(ClientService);

  clientSelected = output<Client>();

  searchTerm = '';
  showDropdown = false;
  showNewClientForm = false;
  clients = signal<Client[]>([]);
  filteredClients = signal<Client[]>([]);
  selectedClient = signal<Client | null>(null);

  newClient: CreateClientDto = {
    nombre: '',
    identificacion: '',
    telefono: '',
    email: '',
    nombreMascota: '',
    tipoMascota: '',
  };

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.filteredClients.set(clients);
      },
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredClients.set(this.clients());
      return;
    }

    this.filteredClients.set(
      this.clients().filter(
        (c) =>
          c.nombre.toLowerCase().includes(term) ||
          c.identificacion.toLowerCase().includes(term),
      ),
    );
  }

  toggleNewClientForm() {
    this.showNewClientForm = !this.showNewClientForm;
  }

  selectClient(client: Client) {
    this.selectedClient.set(client);
    this.searchTerm = '';
    this.showDropdown = false;
    this.clientSelected.emit(client);
  }

  clearClient() {
    this.selectedClient.set(null);
    this.clientSelected.emit(null as any);
  }

  createClient() {
    if (this.newClient.nombre && this.newClient.identificacion) {
      this.clientService.create(this.newClient).subscribe({
        next: (client) => {
          this.clients.update((c) => [...c, client]);
          this.selectClient(client);
          this.showNewClientForm = false;
          this.newClient = {
            nombre: '',
            identificacion: '',
            telefono: '',
            email: '',
            nombreMascota: '',
            tipoMascota: '',
          };
        },
      });
    }
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}

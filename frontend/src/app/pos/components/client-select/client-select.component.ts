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
      <div class="flex gap-2 flex-wrap">
        <div class="flex-1 min-w-[200px]">
          <label for="client-search" class="sr-only">Buscar cliente</label>
          <input
            id="client-search"
            type="text"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            (focus)="showDropdown = true"
            placeholder="Buscar cliente por nombre o identificación..."
            class="input-field w-full"
            aria-describedby="client-search-hint"
          />
          <span id="client-search-hint" class="sr-only">Escriba para buscar clientes</span>
        </div>
        <button 
          type="button"
          (click)="showNewClientForm = !showNewClientForm"
          class="btn-secondary"
          [attr.aria-expanded]="showNewClientForm"
          aria-controls="new-client-form"
        >
          {{ showNewClientForm ? 'Cancelar' : '+ Nuevo' }}
        </button>
      </div>

      @if (showNewClientForm) {
        <div id="new-client-form" class="bg-slate-50 p-4 rounded-lg space-y-3">
          <h4 class="font-medium text-slate-800">Nuevo Cliente</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="new-client-nombre" class="input-label">Nombre *</label>
              <input id="new-client-nombre" [(ngModel)]="newClient.nombre" placeholder="Nombre completo" class="input-field" />
            </div>
            <div>
              <label for="new-client-identificacion" class="input-label">Identificación *</label>
              <input id="new-client-identificacion" [(ngModel)]="newClient.identificacion" placeholder="Cédula" class="input-field" />
            </div>
            <div>
              <label for="new-client-telefono" class="input-label">Teléfono</label>
              <input id="new-client-telefono" [(ngModel)]="newClient.telefono" placeholder="Teléfono" class="input-field" />
            </div>
            <div>
              <label for="new-client-email" class="input-label">Email</label>
              <input id="new-client-email" [(ngModel)]="newClient.email" type="email" placeholder="Email" class="input-field" />
            </div>
            <div>
              <label for="new-client-mascota" class="input-label">Nombre mascota</label>
              <input id="new-client-mascota" [(ngModel)]="newClient.nombreMascota" placeholder="Nombre mascota" class="input-field" />
            </div>
            <div>
              <label for="new-client-tipo" class="input-label">Tipo mascota</label>
              <input id="new-client-tipo" [(ngModel)]="newClient.tipoMascota" placeholder="Perro, Gato..." class="input-field" />
            </div>
          </div>
          <button type="button" (click)="createClient()" class="btn-primary">
            Guardar Cliente
          </button>
        </div>
      }

      @if (showDropdown && filteredClients().length > 0) {
        <ul class="bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto" role="listbox" aria-label="Resultados de clientes">
          @for (client of filteredClients(); track client.id) {
            <li>
              <button
                type="button"
                (click)="selectClient(client)"
                class="w-full text-left px-4 py-3 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none transition-colors duration-150"
                role="option"
              >
                <span class="font-medium text-slate-800">{{ client.nombre }}</span>
                <span class="text-sm text-slate-500 ml-2">{{ client.identificacion }}</span>
                @if (client.nombreMascota) {
                  <span class="text-sm text-slate-400 ml-2">| {{ client.nombreMascota }}</span>
                }
              </button>
            </li>
          }
        </ul>
      }

      @if (selectedClient()) {
        <div class="bg-blue-50 p-3 rounded-lg flex justify-between items-center" role="status" aria-live="polite">
          <div>
            <span class="font-medium text-slate-800">{{ selectedClient()?.nombre }}</span>
            <span class="text-sm text-slate-600 ml-2">{{ selectedClient()?.identificacion }}</span>
          </div>
          <button 
            type="button" 
            (click)="clearClient()" 
            class="w-8 h-8 rounded-full hover:bg-blue-100 flex items-center justify-center text-slate-500 transition-colors duration-200"
            aria-label="Quitar cliente seleccionado"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `
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
    tipoMascota: ''
  };

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.filteredClients.set(clients);
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredClients.set(this.clients());
      return;
    }
    
    this.filteredClients.set(
      this.clients().filter(c => 
        c.nombre.toLowerCase().includes(term) ||
        c.identificacion.toLowerCase().includes(term)
      )
    );
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
          this.clients.update(c => [...c, client]);
          this.selectClient(client);
          this.showNewClientForm = false;
          this.newClient = { nombre: '', identificacion: '', telefono: '', email: '', nombreMascota: '', tipoMascota: '' };
        }
      });
    }
  }
}
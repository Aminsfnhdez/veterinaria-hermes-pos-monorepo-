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
      <div class="flex gap-2">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          (focus)="showDropdown = true"
          placeholder="Buscar cliente por nombre o identificación..."
          class="input-field flex-1"
        />
        <button 
          (click)="showNewClientForm = !showNewClientForm"
          class="btn-secondary"
        >
          + Nuevo
        </button>
      </div>

      @if (showNewClientForm) {
        <div class="bg-slate-50 p-4 rounded-lg space-y-3">
          <h4 class="font-medium text-slate-800">Nuevo Cliente</h4>
          <div class="grid grid-cols-2 gap-3">
            <input [(ngModel)]="newClient.nombre" placeholder="Nombre" class="input-field" />
            <input [(ngModel)]="newClient.identificacion" placeholder="Identificación" class="input-field" />
            <input [(ngModel)]="newClient.telefono" placeholder="Teléfono" class="input-field" />
            <input [(ngModel)]="newClient.email" placeholder="Email" class="input-field" />
            <input [(ngModel)]="newClient.nombreMascota" placeholder="Nombre mascota" class="input-field" />
            <input [(ngModel)]="newClient.tipoMascota" placeholder="Tipo mascota" class="input-field" />
          </div>
          <button (click)="createClient()" class="btn-primary">
            Guardar Cliente
          </button>
        </div>
      }

      @if (showDropdown && filteredClients().length > 0) {
        <div class="bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          @for (client of filteredClients(); track client.id) {
            <button
              type="button"
              (click)="selectClient(client)"
              class="w-full text-left px-4 py-2 hover:bg-slate-50"
            >
              <span class="font-medium">{{ client.nombre }}</span>
              <span class="text-sm text-slate-500 ml-2">{{ client.identificacion }}</span>
              @if (client.nombreMascota) {
                <span class="text-sm text-slate-400 ml-2">| {{ client.nombreMascota }}</span>
              }
            </button>
          }
        </div>
      }

      @if (selectedClient()) {
        <div class="bg-primary/10 p-3 rounded-lg flex justify-between items-center">
          <div>
            <span class="font-medium">{{ selectedClient()?.nombre }}</span>
            <span class="text-sm text-slate-600 ml-2">{{ selectedClient()?.identificacion }}</span>
          </div>
          <button (click)="clearClient()" class="text-slate-500 hover:text-slate-700">
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
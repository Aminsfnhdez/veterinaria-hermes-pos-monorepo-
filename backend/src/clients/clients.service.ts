import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client';

export interface CreateClientDto {
  nombre: string;
  identificacion: string;
  telefono?: string;
  email?: string;
  nombreMascota?: string;
  tipoMascota?: string;
}

export interface UpdateClientDto {
  nombre?: string;
  telefono?: string;
  email?: string;
  nombreMascota?: string;
  tipoMascota?: string;
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return client;
  }

  async findByIdentificacion(identificacion: string): Promise<Client | null> {
    return this.clientRepository.findOne({ where: { identificacion } });
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const existing = await this.findByIdentificacion(createClientDto.identificacion);
    if (existing) {
      throw new ConflictException(`Cliente con identificación ${createClientDto.identificacion} ya existe`);
    }
    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }
}
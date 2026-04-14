import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({
    summary: 'Listar todos los productos',
    description: 'Retorna todos los productos activos del inventario',
  })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get('low-stock')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Productos con stock bajo',
    description: 'Retorna productos donde stock <= stockMinimo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos con stock bajo',
  })
  findLowStock() {
    return this.productsService.findLowStock();
  }

  @Get('expiring-soon')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Productos próximos a vencer',
    description: 'Retorna productos que vencen en los próximos 30 días',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos próximos a vencer',
  })
  findExpiringSoon() {
    return this.productsService.findExpiringSoon();
  }

  @Get('expired')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Productos vencidos',
    description: 'Retorna productos cuya fecha de caducidad ha pasado',
  })
  @ApiResponse({ status: 200, description: 'Lista de productos vencidos' })
  findExpired() {
    return this.productsService.findExpired();
  }

  @Get(':id')
  @Roles('ADMIN', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del producto', type: 'string' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear nuevo producto',
    description:
      'Crea un nuevo producto en el inventario. Categoría MEDICAMENTO requiere lote y fechaCaducidad obligatorios.',
  })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Actualizar producto',
    description: 'Actualiza los datos de un producto existente',
  })
  @ApiParam({ name: 'id', description: 'UUID del producto', type: 'string' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Eliminar producto',
    description: 'Elimina lógicamente un producto (activo = false)',
  })
  @ApiParam({ name: 'id', description: 'UUID del producto', type: 'string' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}

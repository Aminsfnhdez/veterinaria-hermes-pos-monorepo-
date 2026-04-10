import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import type { CreateProductDto, UpdateProductDto } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('ADMIN', 'VENDEDOR')
  findAll() {
    return this.productsService.findAll();
  }

  @Get('low-stock')
  @Roles('ADMIN')
  findLowStock() {
    return this.productsService.findLowStock();
  }

  @Get('expiring-soon')
  @Roles('ADMIN')
  findExpiringSoon() {
    return this.productsService.findExpiringSoon();
  }

  @Get('expired')
  @Roles('ADMIN')
  findExpired() {
    return this.productsService.findExpired();
  }

  @Get(':id')
  @Roles('ADMIN', 'VENDEDOR')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
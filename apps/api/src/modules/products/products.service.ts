import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const existingSku = await this.prismaService.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    const existingBarcode = await this.prismaService.product.findUnique({
      where: { barcode: createProductDto.barcode },
    });

    if (existingBarcode) {
      throw new ConflictException('Barcode already exists');
    }

    const product = await this.prismaService.product.create({
      data: {
        ...createProductDto,
        priceB2b: createProductDto.priceB2b.toString(),
      },
    });

    return product;
  }

  async findAll() {
    return this.prismaService.product.findMany({
      orderBy: {
        nameFr: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.prismaService.product.findUnique({
      where: { barcode },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.prismaService.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
      const existingBarcode = await this.prismaService.product.findUnique({
        where: { barcode: updateProductDto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('Barcode already exists');
      }
    }

    const updateData: any = { ...updateProductDto };

    if (updateProductDto.priceB2b !== undefined) {
      updateData.priceB2b = updateProductDto.priceB2b.toString();
    }

    return this.prismaService.product.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prismaService.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }
}

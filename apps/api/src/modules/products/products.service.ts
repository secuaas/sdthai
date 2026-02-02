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

    const category = await this.prismaService.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const product = await this.prismaService.product.create({
      data: {
        ...createProductDto,
        priceB2b: createProductDto.priceB2b.toString(),
        priceB2c: createProductDto.priceB2c.toString(),
        allergens: createProductDto.allergens || [],
      },
      include: {
        category: true,
        images: true,
      },
    });

    return product;
  }

  async findAll() {
    return this.prismaService.product.findMany({
      include: {
        category: true,
        images: {
          where: { isMain: true },
        },
      },
      orderBy: {
        nameFr: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.prismaService.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
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

    if (updateProductDto.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    const updateData: any = { ...updateProductDto };

    if (updateProductDto.priceB2b !== undefined) {
      updateData.priceB2b = updateProductDto.priceB2b.toString();
    }

    if (updateProductDto.priceB2c !== undefined) {
      updateData.priceB2c = updateProductDto.priceB2c.toString();
    }

    return this.prismaService.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
      },
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

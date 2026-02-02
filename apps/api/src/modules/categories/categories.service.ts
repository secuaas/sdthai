import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingSlug = await this.prismaService.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    const category = await this.prismaService.category.create({
      data: {
        nameFr: createCategoryDto.nameFr,
        nameDe: createCategoryDto.nameDe,
        nameEn: createCategoryDto.nameEn,
        slug: createCategoryDto.slug,
        description: createCategoryDto.description,
        imageUrl: createCategoryDto.imageUrl,
        sortOrder: createCategoryDto.sortOrder || 0,
        isActive: createCategoryDto.isActive !== undefined ? createCategoryDto.isActive : true,
      },
    });

    return category;
  }

  async findAll() {
    return this.prismaService.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: {
        products: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            sku: true,
            nameFr: true,
            priceB2b: true,
            priceB2c: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingSlug = await this.prismaService.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
    }

    return this.prismaService.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.products > 0) {
      throw new ConflictException('Cannot delete category with associated products');
    }

    await this.prismaService.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}

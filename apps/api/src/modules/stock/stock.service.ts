import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { StockPurpose } from '@sdthai/prisma';

@Injectable()
export class StockService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateStockEntryDto) {
    // Verify product exists
    const product = await this.prismaService.product.findUnique({
      where: { id: createDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If DEMO or STAFF, verify assignedTo user exists
    if (
      (createDto.purpose === StockPurpose.DEMO ||
        createDto.purpose === StockPurpose.STAFF) &&
      createDto.assignedTo
    ) {
      const user = await this.prismaService.user.findUnique({
        where: { id: createDto.assignedTo },
      });

      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    const stockEntry = await this.prismaService.stockEntry.create({
      data: {
        productId: createDto.productId,
        quantity: createDto.quantity,
        purpose: createDto.purpose,
        assignedTo: createDto.assignedTo,
        notes: createDto.notes,
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            nameFr: true,
            priceB2b: true,
          },
        },
      },
    });

    return stockEntry;
  }

  async findAll() {
    return this.prismaService.stockEntry.findMany({
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            nameFr: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByPurpose(purpose: StockPurpose) {
    return this.prismaService.stockEntry.findMany({
      where: { purpose },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            nameFr: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByProduct(productId: string) {
    return this.prismaService.stockEntry.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            nameFr: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByAssignedUser(userId: string) {
    return this.prismaService.stockEntry.findMany({
      where: {
        assignedTo: userId,
        purpose: {
          in: [StockPurpose.DEMO, StockPurpose.STAFF],
        },
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            nameFr: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getStockSummary() {
    const entries = await this.prismaService.stockEntry.findMany({
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            nameFr: true,
          },
        },
      },
    });

    // Group by product and purpose
    const summary = entries.reduce((acc, entry) => {
      const key = `${entry.productId}`;
      if (!acc[key]) {
        acc[key] = {
          productId: entry.productId,
          productName: entry.product.nameFr,
          sku: entry.product.sku,
          byPurpose: {
            SALE: 0,
            DEMO: 0,
            STAFF: 0,
          },
          total: 0,
        };
      }

      acc[key].byPurpose[entry.purpose] += entry.quantity;
      acc[key].total += entry.quantity;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(summary);
  }

  async findOne(id: string) {
    const entry = await this.prismaService.stockEntry.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Stock entry not found');
    }

    return entry;
  }

  async remove(id: string) {
    const entry = await this.prismaService.stockEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException('Stock entry not found');
    }

    await this.prismaService.stockEntry.delete({
      where: { id },
    });

    return { message: 'Stock entry deleted successfully' };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { BatchStatus, OrderStatus } from '@sdthai/prisma';

@Injectable()
export class ProductionService {
  constructor(private prismaService: PrismaService) {}

  async create(createBatchDto: CreateBatchDto) {
    const productionDate = new Date(createBatchDto.productionDate);

    const batchNumber = await this.generateBatchNumber(productionDate);

    const batchItems = [];
    let earliestExpiryDate: Date | null = null;

    for (const item of createBatchDto.items) {
      const product = await this.prismaService.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      const expiryDate = new Date(productionDate);
      expiryDate.setDate(expiryDate.getDate() + product.shelfLifeDays);

      if (!earliestExpiryDate || expiryDate < earliestExpiryDate) {
        earliestExpiryDate = expiryDate;
      }

      batchItems.push({
        productId: product.id,
        plannedQuantity: item.plannedQuantity,
        notes: item.notes,
      });
    }

    const batch = await this.prismaService.productionBatch.create({
      data: {
        batchNumber,
        productionDate,
        expiryDate: earliestExpiryDate,
        status: BatchStatus.PLANNED,
        notes: createBatchDto.notes,
        items: {
          create: batchItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return batch;
  }

  async findAll(status?: BatchStatus) {
    const where = status ? { status } : {};

    return this.prismaService.productionBatch.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                nameFr: true,
                shelfLifeDays: true,
              },
            },
          },
        },
        stockEntries: true,
      },
      orderBy: {
        productionDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const batch = await this.prismaService.productionBatch.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        stockEntries: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Production batch not found');
    }

    return batch;
  }

  async getPlanning(date: string) {
    const requestedDate = new Date(date);

    const orders = await this.prismaService.order.findMany({
      where: {
        status: OrderStatus.CONFIRMED,
        requestedDate: requestedDate,
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                nameFr: true,
                shelfLifeDays: true,
              },
            },
          },
        },
      },
    });

    const aggregation: Record<
      string,
      {
        product: any;
        totalQuantity: number;
        orders: Array<{ orderId: string; partnerName: string; quantity: number }>;
      }
    > = {};

    for (const order of orders) {
      for (const item of order.items) {
        if (!aggregation[item.productId]) {
          aggregation[item.productId] = {
            product: item.product,
            totalQuantity: 0,
            orders: [],
          };
        }

        aggregation[item.productId].totalQuantity += item.quantity;
        aggregation[item.productId].orders.push({
          orderId: order.id,
          partnerName: order.partner.name,
          quantity: item.quantity,
        });
      }
    }

    return {
      date: requestedDate,
      orderCount: orders.length,
      products: Object.values(aggregation),
    };
  }

  async start(id: string) {
    const batch = await this.prismaService.productionBatch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException('Production batch not found');
    }

    if (batch.status !== BatchStatus.PLANNED) {
      throw new BadRequestException('Batch must be in PLANNED status to start');
    }

    return this.prismaService.productionBatch.update({
      where: { id },
      data: {
        status: BatchStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async complete(id: string, updateBatchDto: UpdateBatchDto) {
    const batch = await this.prismaService.productionBatch.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Production batch not found');
    }

    if (batch.status !== BatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Batch must be in IN_PROGRESS status to complete');
    }

    const stockEntries = [];

    if (updateBatchDto.items) {
      for (const updateItem of updateBatchDto.items) {
        const batchItem = batch.items.find((item) => item.productId === updateItem.productId);

        if (!batchItem) {
          throw new BadRequestException(`Product ${updateItem.productId} not found in batch`);
        }

        await this.prismaService.batchItem.update({
          where: { id: batchItem.id },
          data: { actualQuantity: updateItem.actualQuantity },
        });

        stockEntries.push({
          productId: batchItem.productId,
          batchId: batch.id,
          initialQuantity: updateItem.actualQuantity,
          quantity: updateItem.actualQuantity,
          reservedQuantity: 0,
        });
      }
    } else {
      for (const batchItem of batch.items) {
        await this.prismaService.batchItem.update({
          where: { id: batchItem.id },
          data: { actualQuantity: batchItem.plannedQuantity },
        });

        stockEntries.push({
          productId: batchItem.productId,
          batchId: batch.id,
          initialQuantity: batchItem.plannedQuantity,
          quantity: batchItem.plannedQuantity,
          reservedQuantity: 0,
        });
      }
    }

    const completedBatch = await this.prismaService.productionBatch.update({
      where: { id },
      data: {
        status: BatchStatus.COMPLETED,
        completedAt: new Date(),
        notes: updateBatchDto.notes || batch.notes,
        stockEntries: {
          create: stockEntries,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        stockEntries: {
          include: {
            product: true,
          },
        },
      },
    });

    for (const stockEntry of stockEntries) {
      await this.prismaService.stockMovement.create({
        data: {
          stockEntryId: completedBatch.stockEntries.find(
            (se) => se.productId === stockEntry.productId,
          ).id,
          type: 'IN_PRODUCTION',
          quantity: stockEntry.initialQuantity,
          reference: batch.batchNumber,
          notes: `Production batch ${batch.batchNumber} completed`,
        },
      });
    }

    return completedBatch;
  }

  async cancel(id: string) {
    const batch = await this.prismaService.productionBatch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException('Production batch not found');
    }

    if (batch.status === BatchStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed batch');
    }

    return this.prismaService.productionBatch.update({
      where: { id },
      data: {
        status: BatchStatus.CANCELLED,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  private async generateBatchNumber(productionDate: Date): Promise<string> {
    const dateStr = productionDate.toISOString().split('T')[0].replace(/-/g, '');

    const lastBatch = await this.prismaService.productionBatch.findFirst({
      where: {
        batchNumber: {
          startsWith: dateStr,
        },
      },
      orderBy: {
        batchNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastBatch) {
      const lastSequence = parseInt(lastBatch.batchNumber.split('-')[1]);
      sequence = lastSequence + 1;
    }

    return `${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }
}

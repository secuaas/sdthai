import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { StockMovementType } from '@sdthai/prisma';

@Injectable()
export class StockService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.stockEntry.findMany({
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            nameFr: true,
            minStockAlert: true,
          },
        },
        batch: {
          select: {
            id: true,
            batchNumber: true,
            productionDate: true,
            expiryDate: true,
          },
        },
      },
      orderBy: [
        { batch: { expiryDate: 'asc' } },
        { batch: { productionDate: 'asc' } },
      ],
    });
  }

  async getSummary() {
    const stockEntries = await this.prismaService.stockEntry.findMany({
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            nameFr: true,
            minStockAlert: true,
          },
        },
        batch: {
          select: {
            expiryDate: true,
          },
        },
      },
    });

    const summary: Record<
      string,
      {
        product: any;
        totalQuantity: number;
        totalReserved: number;
        availableQuantity: number;
        oldestExpiry: Date | null;
        entryCount: number;
      }
    > = {};

    for (const entry of stockEntries) {
      if (!summary[entry.productId]) {
        summary[entry.productId] = {
          product: entry.product,
          totalQuantity: 0,
          totalReserved: 0,
          availableQuantity: 0,
          oldestExpiry: null,
          entryCount: 0,
        };
      }

      summary[entry.productId].totalQuantity += entry.quantity;
      summary[entry.productId].totalReserved += entry.reservedQuantity;
      summary[entry.productId].availableQuantity +=
        entry.quantity - entry.reservedQuantity;
      summary[entry.productId].entryCount += 1;

      if (
        !summary[entry.productId].oldestExpiry ||
        entry.batch.expiryDate < summary[entry.productId].oldestExpiry
      ) {
        summary[entry.productId].oldestExpiry = entry.batch.expiryDate;
      }
    }

    return Object.values(summary);
  }

  async getAlerts() {
    const stockSummary = await this.getSummary();

    const lowStockAlerts = stockSummary.filter(
      (item) => item.availableQuantity < item.product.minStockAlert,
    );

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiryAlerts = stockSummary.filter(
      (item) => item.oldestExpiry && item.oldestExpiry <= sevenDaysFromNow,
    );

    return {
      lowStock: lowStockAlerts,
      expiringSoon: expiryAlerts,
    };
  }

  async adjustment(adjustmentDto: StockAdjustmentDto) {
    const stockEntry = await this.prismaService.stockEntry.findUnique({
      where: { id: adjustmentDto.stockEntryId },
      include: {
        product: true,
        batch: true,
      },
    });

    if (!stockEntry) {
      throw new NotFoundException('Stock entry not found');
    }

    const newQuantity = stockEntry.quantity + adjustmentDto.quantity;

    if (newQuantity < 0) {
      throw new BadRequestException('Adjustment would result in negative stock');
    }

    if (newQuantity < stockEntry.reservedQuantity) {
      throw new BadRequestException(
        'Adjustment would result in quantity less than reserved quantity',
      );
    }

    const updatedEntry = await this.prismaService.stockEntry.update({
      where: { id: adjustmentDto.stockEntryId },
      data: {
        quantity: newQuantity,
        initialQuantity: stockEntry.initialQuantity + adjustmentDto.quantity,
      },
      include: {
        product: true,
        batch: true,
      },
    });

    await this.prismaService.stockMovement.create({
      data: {
        stockEntryId: stockEntry.id,
        type: StockMovementType.ADJUSTMENT,
        quantity: adjustmentDto.quantity,
        notes: adjustmentDto.notes || 'Manual adjustment',
      },
    });

    return updatedEntry;
  }

  async reserve(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const reservations = [];

    for (const orderItem of order.items) {
      let remainingQuantity = orderItem.quantity;

      const stockEntries = await this.prismaService.stockEntry.findMany({
        where: {
          productId: orderItem.productId,
        },
        include: {
          batch: true,
        },
        orderBy: [
          { batch: { expiryDate: 'asc' } },
          { batch: { productionDate: 'asc' } },
        ],
      });

      for (const entry of stockEntries) {
        if (remainingQuantity <= 0) break;

        const available = entry.quantity - entry.reservedQuantity;

        if (available <= 0) continue;

        const toReserve = Math.min(available, remainingQuantity);

        await this.prismaService.stockEntry.update({
          where: { id: entry.id },
          data: {
            reservedQuantity: entry.reservedQuantity + toReserve,
          },
        });

        reservations.push({
          stockEntryId: entry.id,
          batchNumber: entry.batch.batchNumber,
          productId: orderItem.productId,
          productName: orderItem.product.nameFr,
          quantity: toReserve,
        });

        remainingQuantity -= toReserve;
      }

      if (remainingQuantity > 0) {
        for (const reservation of reservations) {
          await this.prismaService.stockEntry.update({
            where: { id: reservation.stockEntryId },
            data: {
              reservedQuantity: {
                decrement: reservation.quantity,
              },
            },
          });
        }

        throw new BadRequestException(
          `Insufficient stock for product ${orderItem.product.nameFr}. Missing: ${remainingQuantity} units`,
        );
      }
    }

    return {
      orderId,
      reservations,
      message: 'Stock reserved successfully',
    };
  }

  async release(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    for (const orderItem of order.items) {
      let remainingQuantity = orderItem.quantity;

      const stockEntries = await this.prismaService.stockEntry.findMany({
        where: {
          productId: orderItem.productId,
          reservedQuantity: { gt: 0 },
        },
        include: {
          batch: true,
        },
        orderBy: [
          { batch: { expiryDate: 'asc' } },
          { batch: { productionDate: 'asc' } },
        ],
      });

      for (const entry of stockEntries) {
        if (remainingQuantity <= 0) break;

        const toRelease = Math.min(entry.reservedQuantity, remainingQuantity);

        await this.prismaService.stockEntry.update({
          where: { id: entry.id },
          data: {
            reservedQuantity: entry.reservedQuantity - toRelease,
          },
        });

        remainingQuantity -= toRelease;
      }
    }

    return {
      orderId,
      message: 'Stock reservation released successfully',
    };
  }

  async decrementStock(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const stockMovements = [];

    for (const orderItem of order.items) {
      let remainingQuantity = orderItem.quantity;

      const stockEntries = await this.prismaService.stockEntry.findMany({
        where: {
          productId: orderItem.productId,
        },
        include: {
          batch: true,
        },
        orderBy: [
          { batch: { expiryDate: 'asc' } },
          { batch: { productionDate: 'asc' } },
        ],
      });

      for (const entry of stockEntries) {
        if (remainingQuantity <= 0) break;

        const available = entry.quantity;

        if (available <= 0) continue;

        const toDecrement = Math.min(available, remainingQuantity);

        const updatedEntry = await this.prismaService.stockEntry.update({
          where: { id: entry.id },
          data: {
            quantity: entry.quantity - toDecrement,
            reservedQuantity: Math.max(0, entry.reservedQuantity - toDecrement),
          },
        });

        await this.prismaService.stockMovement.create({
          data: {
            stockEntryId: entry.id,
            type: StockMovementType.OUT_DELIVERY,
            quantity: -toDecrement,
            reference: orderId,
            notes: `Order ${order.orderNumber} delivered`,
          },
        });

        stockMovements.push({
          stockEntryId: entry.id,
          batchId: entry.batchId,
          quantity: toDecrement,
        });

        if (!orderItem.batchId) {
          await this.prismaService.orderItem.update({
            where: { id: orderItem.id },
            data: { batchId: entry.batchId },
          });
        }

        remainingQuantity -= toDecrement;
      }

      if (remainingQuantity > 0) {
        throw new BadRequestException(
          `Insufficient stock for order item ${orderItem.id}. Missing: ${remainingQuantity} units`,
        );
      }
    }

    return {
      orderId,
      stockMovements,
      message: 'Stock decremented successfully',
    };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class PosService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Create a new POS transaction
   * Calculates totals automatically based on product prices
   */
  async create(createDto: CreateTransactionDto, userId: string) {
    // Verify partner exists and is DEPOT_AUTOMATE type
    const partner = await this.prismaService.partner.findUnique({
      where: { id: createDto.partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    if (partner.type !== 'DEPOT_AUTOMATE') {
      throw new BadRequestException('POS transactions are only for DEPOT_AUTOMATE partners');
    }

    if (!partner.isActive) {
      throw new BadRequestException('Partner is not active');
    }

    // Calculate totals
    let subtotal = 0;
    const posItems = [];

    for (const item of createDto.items) {
      const product = await this.prismaService.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      if (!product.isActive) {
        throw new BadRequestException(`Product ${product.nameFr} is not active`);
      }

      const unitPrice = parseFloat(product.priceB2b.toString());
      const itemSubtotal = unitPrice * item.quantity;

      subtotal += itemSubtotal;

      posItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
      });
    }

    // Calculate VAT and total
    const vatAmount = subtotal * 0.081; // 8.1% TVA
    const total = subtotal + vatAmount;

    // Create transaction
    const transaction = await this.prismaService.pOSTransaction.create({
      data: {
        partnerId: createDto.partnerId,
        paymentMethod: createDto.paymentMethod,
        subtotal,
        vatAmount,
        total,
        createdBy: userId,
        notes: createDto.notes,
        items: {
          create: posItems,
        },
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
              },
            },
          },
        },
      },
    });

    return transaction;
  }

  /**
   * Get all transactions
   */
  async findAll() {
    return this.prismaService.pOSTransaction.findMany({
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
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get transactions for a specific partner
   */
  async findByPartner(partnerId: string) {
    return this.prismaService.pOSTransaction.findMany({
      where: { partnerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                nameFr: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get a single transaction by ID
   */
  async findOne(id: string) {
    const transaction = await this.prismaService.pOSTransaction.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Get transaction statistics for a partner
   */
  async getStats(partnerId: string, startDate?: Date, endDate?: Date) {
    const where: any = { partnerId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const transactions = await this.prismaService.pOSTransaction.findMany({
      where,
      select: {
        total: true,
        paymentMethod: true,
        timestamp: true,
      },
    });

    const totalRevenue = transactions.reduce(
      (sum, t) => sum + parseFloat(t.total.toString()),
      0,
    );

    const byPaymentMethod = transactions.reduce((acc, t) => {
      const method = t.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count++;
      acc[method].total += parseFloat(t.total.toString());
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return {
      totalTransactions: transactions.length,
      totalRevenue,
      byPaymentMethod,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { CompleteDeliveryDto } from './dto/complete-delivery.dto';
import { DeliveryStatus, OrderStatus } from '@sdthai/prisma';
import { StockService } from '../stock/stock.service';

@Injectable()
export class DeliveriesService {
  constructor(
    private prismaService: PrismaService,
    private stockService: StockService,
  ) {}

  async create(createDeliveryDto: CreateDeliveryDto) {
    const order = await this.prismaService.order.findUnique({
      where: { id: createDeliveryDto.orderId },
      include: {
        partner: true,
        delivery: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.delivery) {
      throw new BadRequestException('Delivery already exists for this order');
    }

    if (order.status !== OrderStatus.READY) {
      throw new BadRequestException('Order must be in READY status to create delivery');
    }

    const scheduledDate = new Date(createDeliveryDto.scheduledDate);

    const delivery = await this.prismaService.delivery.create({
      data: {
        orderId: order.id,
        partnerId: order.partnerId,
        scheduledDate,
        status: DeliveryStatus.PENDING,
        routeOrder: createDeliveryDto.routeOrder,
        notes: createDeliveryDto.notes,
      },
      include: {
        order: {
          include: {
            partner: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return delivery;
  }

  async findAll() {
    return this.prismaService.delivery.findMany({
      include: {
        order: {
          include: {
            partner: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
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
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { routeOrder: 'asc' },
      ],
    });
  }

  async findToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prismaService.delivery.findMany({
      where: {
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        order: {
          include: {
            partner: true,
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
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { routeOrder: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const delivery = await this.prismaService.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            partner: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    return delivery;
  }

  async assign(id: string, driverId: string) {
    const delivery = await this.prismaService.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const driver = await this.prismaService.user.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (driver.role !== 'DRIVER') {
      throw new BadRequestException('User must have DRIVER role');
    }

    return this.prismaService.delivery.update({
      where: { id },
      data: {
        driverId,
        status: DeliveryStatus.ASSIGNED,
      },
      include: {
        order: {
          include: {
            partner: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async start(id: string) {
    const delivery = await this.prismaService.delivery.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status !== DeliveryStatus.ASSIGNED && delivery.status !== DeliveryStatus.PENDING) {
      throw new BadRequestException('Delivery must be in ASSIGNED or PENDING status to start');
    }

    const updatedDelivery = await this.prismaService.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      include: {
        order: {
          include: {
            partner: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await this.prismaService.order.update({
      where: { id: delivery.orderId },
      data: {
        status: OrderStatus.IN_DELIVERY,
      },
    });

    return updatedDelivery;
  }

  async complete(id: string, completeDeliveryDto: CompleteDeliveryDto) {
    const delivery = await this.prismaService.delivery.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status !== DeliveryStatus.IN_PROGRESS) {
      throw new BadRequestException('Delivery must be in IN_PROGRESS status to complete');
    }

    await this.stockService.decrementStock(delivery.orderId);

    const updatedDelivery = await this.prismaService.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.COMPLETED,
        completedAt: new Date(),
        signedBy: completeDeliveryDto.signedBy,
        signatureKey: completeDeliveryDto.signatureKey || `signatures/${id}-${Date.now()}.png`,
        photoKeys: completeDeliveryDto.photoKeys || [],
        notes: completeDeliveryDto.notes,
      },
      include: {
        order: {
          include: {
            partner: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await this.prismaService.order.update({
      where: { id: delivery.orderId },
      data: {
        status: OrderStatus.DELIVERED,
      },
    });

    return updatedDelivery;
  }

  async fail(id: string, reason: string) {
    const delivery = await this.prismaService.delivery.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status !== DeliveryStatus.IN_PROGRESS) {
      throw new BadRequestException('Delivery must be in IN_PROGRESS status to mark as failed');
    }

    const updatedDelivery = await this.prismaService.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.FAILED,
        notes: reason,
      },
      include: {
        order: {
          include: {
            partner: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await this.prismaService.order.update({
      where: { id: delivery.orderId },
      data: {
        status: OrderStatus.READY,
      },
    });

    return updatedDelivery;
  }
}

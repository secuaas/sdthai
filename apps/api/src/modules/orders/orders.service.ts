import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '@sdthai/prisma';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const partner = await this.prismaService.partner.findUnique({
      where: { id: createOrderDto.partnerId },
    });

    if (!partner) {
      throw new BadRequestException('Partner not found');
    }

    const requestedDate = new Date(createOrderDto.requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!createOrderDto.isUrgent) {
      this.validateDeliveryDeadline(partner, requestedDate);
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of createOrderDto.items) {
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
      const vatRate = 0.081;
      const vatAmount = itemSubtotal * vatRate;
      const itemTotal = itemSubtotal + vatAmount;

      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: unitPrice.toString(),
        subtotal: itemSubtotal.toString(),
        vatRate: vatRate.toString(),
        vatAmount: vatAmount.toString(),
        total: itemTotal.toString(),
      });
    }

    if (!createOrderDto.isUrgent && subtotal < 40) {
      throw new BadRequestException('Minimum order amount is 40 CHF (excluding VAT)');
    }

    const vatAmount = subtotal * 0.081;
    const total = subtotal + vatAmount;

    const orderNumber = await this.generateOrderNumber();

    const order = await this.prismaService.order.create({
      data: {
        orderNumber,
        partnerId: createOrderDto.partnerId,
        userId,
        status: createOrderDto.isUrgent ? OrderStatus.PENDING : OrderStatus.CONFIRMED,
        requestedDate,
        isUrgent: createOrderDto.isUrgent || false,
        urgentReason: createOrderDto.urgentReason,
        urgentApproved: createOrderDto.isUrgent ? null : undefined,
        subtotal: subtotal.toString(),
        vatAmount: vatAmount.toString(),
        total: total.toString(),
        notes: createOrderDto.notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        partner: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  async findAll() {
    return this.prismaService.order.findMany({
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: {
        partner: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
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

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: { partner: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update delivered or cancelled orders');
    }

    const updateData: any = {};

    if (updateOrderDto.requestedDate) {
      const requestedDate = new Date(updateOrderDto.requestedDate);

      if (!order.isUrgent) {
        this.validateDeliveryDeadline(order.partner, requestedDate);
      }

      updateData.requestedDate = requestedDate;
    }

    if (updateOrderDto.status !== undefined) {
      updateData.status = updateOrderDto.status;
    }

    if (updateOrderDto.urgentApproved !== undefined) {
      updateData.urgentApproved = updateOrderDto.urgentApproved;

      if (updateOrderDto.urgentApproved) {
        updateData.status = OrderStatus.CONFIRMED;
      }
    }

    if (updateOrderDto.notes !== undefined) {
      updateData.notes = updateOrderDto.notes;
    }

    if (updateOrderDto.items) {
      await this.prismaService.orderItem.deleteMany({
        where: { orderId: id },
      });

      let subtotal = 0;
      const orderItems = [];

      for (const item of updateOrderDto.items) {
        const product = await this.prismaService.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        const unitPrice = parseFloat(product.priceB2b.toString());
        const itemSubtotal = unitPrice * item.quantity;
        const vatRate = 0.081;
        const vatAmount = itemSubtotal * vatRate;
        const itemTotal = itemSubtotal + vatAmount;

        subtotal += itemSubtotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: unitPrice.toString(),
          subtotal: itemSubtotal.toString(),
          vatRate: vatRate.toString(),
          vatAmount: vatAmount.toString(),
          total: itemTotal.toString(),
        });
      }

      if (!order.isUrgent && subtotal < 40) {
        throw new BadRequestException('Minimum order amount is 40 CHF (excluding VAT)');
      }

      const vatAmount = subtotal * 0.081;
      const total = subtotal + vatAmount;

      updateData.subtotal = subtotal.toString();
      updateData.vatAmount = vatAmount.toString();
      updateData.total = total.toString();

      updateData.items = {
        create: orderItems,
      };
    }

    const updatedOrder = await this.prismaService.order.update({
      where: { id },
      data: updateData,
      include: {
        partner: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return updatedOrder;
  }

  async remove(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot delete delivered orders');
    }

    await this.prismaService.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    return { message: 'Order cancelled successfully' };
  }

  private validateDeliveryDeadline(partner: any, requestedDate: Date) {
    const deliveryDaysArray = Array.isArray(partner.deliveryDays)
      ? partner.deliveryDays
      : JSON.parse(partner.deliveryDays as string);

    const requestedDayName = this.getDayName(requestedDate);

    if (!deliveryDaysArray.includes(requestedDayName)) {
      throw new BadRequestException(
        `Partner delivery is only available on: ${deliveryDaysArray.join(', ')}`,
      );
    }

    const [deadlineHours, deadlineMinutes] = partner.orderDeadlineTime.split(':').map(Number);
    const deadlineDays = partner.orderDeadlineDays || 1;

    const deadline = new Date(requestedDate);
    deadline.setDate(deadline.getDate() - deadlineDays);
    deadline.setHours(deadlineHours, deadlineMinutes, 0, 0);

    const now = new Date();

    if (now > deadline) {
      throw new BadRequestException(
        `Order deadline has passed. Orders must be placed ${deadlineDays} day(s) before delivery by ${partner.orderDeadlineTime}`,
      );
    }
  }

  private getDayName(date: Date): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

    const lastOrder = await this.prismaService.order.findFirst({
      where: {
        orderNumber: {
          startsWith: `ORD-${dateStr}`,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
}

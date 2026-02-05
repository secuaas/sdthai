import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { ReturnStatus } from '@sdthai/prisma';

@Injectable()
export class ReturnsService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Create a new return
   */
  async create(createDto: CreateReturnDto, userId: string) {
    // Verify partner exists
    const partner = await this.prismaService.partner.findUnique({
      where: { id: createDto.partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // If orderId provided, verify it exists
    if (createDto.orderId) {
      const order = await this.prismaService.order.findUnique({
        where: { id: createDto.orderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.partnerId !== createDto.partnerId) {
        throw new BadRequestException('Order does not belong to this partner');
      }
    }

    // Verify all products exist
    for (const item of createDto.items) {
      const product = await this.prismaService.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }
    }

    // Create the return
    const returnRecord = await this.prismaService.return.create({
      data: {
        orderId: createDto.orderId,
        partnerId: createDto.partnerId,
        reason: createDto.reason,
        status: ReturnStatus.PENDING,
        notes: createDto.notes,
        createdBy: userId,
        items: {
          create: createDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
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
        photos: true,
      },
    });

    return returnRecord;
  }

  /**
   * Get all returns
   */
  async findAll() {
    return this.prismaService.return.findMany({
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
        photos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get returns by partner
   */
  async findByPartner(partnerId: string) {
    return this.prismaService.return.findMany({
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
        photos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a single return by ID
   */
  async findOne(id: string) {
    const returnRecord = await this.prismaService.return.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        photos: true,
      },
    });

    if (!returnRecord) {
      throw new NotFoundException('Return not found');
    }

    return returnRecord;
  }

  /**
   * Update return status (admin only)
   */
  async updateStatus(id: string, updateDto: UpdateReturnStatusDto) {
    const returnRecord = await this.prismaService.return.findUnique({
      where: { id },
    });

    if (!returnRecord) {
      throw new NotFoundException('Return not found');
    }

    return this.prismaService.return.update({
      where: { id },
      data: {
        status: updateDto.status,
      },
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
        photos: true,
      },
    });
  }

  /**
   * Add photo to return
   * In production, this would upload to S3 and store the URL
   * For now, we just store the URL directly
   */
  async addPhoto(id: string, photoUrl: string) {
    const returnRecord = await this.prismaService.return.findUnique({
      where: { id },
    });

    if (!returnRecord) {
      throw new NotFoundException('Return not found');
    }

    return this.prismaService.returnPhoto.create({
      data: {
        returnId: id,
        url: photoUrl,
      },
    });
  }

  /**
   * Get photos for a return
   */
  async getPhotos(id: string) {
    const returnRecord = await this.prismaService.return.findUnique({
      where: { id },
    });

    if (!returnRecord) {
      throw new NotFoundException('Return not found');
    }

    return this.prismaService.returnPhoto.findMany({
      where: { returnId: id },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: string) {
    const photo = await this.prismaService.returnPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // In production, also delete from S3
    await this.prismaService.returnPhoto.delete({
      where: { id: photoId },
    });

    return { message: 'Photo deleted successfully' };
  }
}

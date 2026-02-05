import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prismaService: PrismaService) {}

  async create(createPartnerDto: CreatePartnerDto) {
    const partner = await this.prismaService.partner.create({
      data: {
        ...createPartnerDto,
        fixedDeliveryDays: createPartnerDto.fixedDeliveryDays || [1, 4], // Lundi, Jeudi
        paymentMethod: createPartnerDto.paymentMethod || 'CASH_TO_DRIVER',
      },
    });

    return partner;
  }

  async findAll() {
    return this.prismaService.partner.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findPublic() {
    return this.prismaService.partner.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        type: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const partner = await this.prismaService.partner.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    return partner;
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto) {
    const partner = await this.prismaService.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const updateData: any = { ...updatePartnerDto };

    if (updatePartnerDto.latitude !== undefined) {
      updateData.latitude = updatePartnerDto.latitude.toString();
    }

    if (updatePartnerDto.longitude !== undefined) {
      updateData.longitude = updatePartnerDto.longitude.toString();
    }

    return this.prismaService.partner.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const partner = await this.prismaService.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    await this.prismaService.partner.delete({
      where: { id },
    });

    return { message: 'Partner deleted successfully' };
  }
}

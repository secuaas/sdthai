import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prismaService: PrismaService) {}

  async create(createPartnerDto: CreatePartnerDto) {
    const { deliveryDays, ...rest } = createPartnerDto;

    const partner = await this.prismaService.partner.create({
      data: {
        ...rest,
        deliveryDays: deliveryDays || ['MONDAY', 'THURSDAY'],
        latitude: createPartnerDto.latitude.toString(),
        longitude: createPartnerDto.longitude.toString(),
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
        isPublic: true,
      },
      select: {
        id: true,
        type: true,
        name: true,
        address: true,
        postalCode: true,
        city: true,
        canton: true,
        latitude: true,
        longitude: true,
        deliveryDays: true,
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
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
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

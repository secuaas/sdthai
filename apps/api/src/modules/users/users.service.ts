import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const { password, ...userData } = createUserDto;

    const user = await this.prismaService.user.create({
      data: {
        ...userData,
        passwordHash,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async findAll() {
    const users = await this.prismaService.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(({ passwordHash, ...user }) => user);
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: any = { ...updateUserDto };

    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password;
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateData,
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}

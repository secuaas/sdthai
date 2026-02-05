import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerSessionDto } from './dto/create-partner-session.dto';

@Injectable()
export class PartnerSessionsService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Generate a unique 6-character session code
   */
  private async generateSessionCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let exists = true;

    // Keep generating until we find a unique code
    while (exists) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const existing = await this.prismaService.partnerSession.findUnique({
        where: { sessionCode: code },
      });
      exists = !!existing;
    }

    return code;
  }

  /**
   * Create a new partner session
   * Returns the session code that the partner needs to validate
   */
  async create(createDto: CreatePartnerSessionDto) {
    // Verify partner exists
    const partner = await this.prismaService.partner.findUnique({
      where: { id: createDto.partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    if (!partner.isActive) {
      throw new BadRequestException('Partner is not active');
    }

    // Generate unique session code
    const sessionCode = await this.generateSessionCode();

    // Create session (initially not active, requires admin validation)
    const session = await this.prismaService.partnerSession.create({
      data: {
        sessionCode,
        partnerId: createDto.partnerId,
        deviceType: createDto.deviceType,
        ipAddress: createDto.ipAddress || 'unknown',
        isActive: false, // Requires admin approval
        expiresAt: null, // Unlimited session
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      sessionCode: session.sessionCode,
      message: 'Session code generated. Please contact admin to activate.',
      session: {
        id: session.id,
        partnerId: session.partnerId,
        partnerName: session.partner.name,
        deviceType: session.deviceType,
        isActive: session.isActive,
        createdAt: session.createdAt,
      },
    };
  }

  /**
   * Validate a session code and check if it's active
   * Used by partners to authenticate
   */
  async validateCode(sessionCode: string) {
    const session = await this.prismaService.partnerSession.findUnique({
      where: { sessionCode },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Invalid session code');
    }

    if (!session.isActive) {
      throw new BadRequestException('Session not activated. Contact admin.');
    }

    if (!session.partner.isActive) {
      throw new BadRequestException('Partner account is not active');
    }

    // Update last activity
    await this.prismaService.partnerSession.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    });

    return {
      valid: true,
      partner: session.partner,
      session: {
        id: session.id,
        sessionCode: session.sessionCode,
        deviceType: session.deviceType,
        lastActivity: new Date(),
      },
    };
  }

  /**
   * Get all sessions (for admin)
   */
  async findAll() {
    return this.prismaService.partnerSession.findMany({
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get sessions for a specific partner
   */
  async findByPartner(partnerId: string) {
    return this.prismaService.partnerSession.findMany({
      where: { partnerId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Activate a session (admin only)
   */
  async activate(id: string) {
    const session = await this.prismaService.partnerSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.prismaService.partnerSession.update({
      where: { id },
      data: { isActive: true },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Deactivate a session (admin only)
   */
  async deactivate(id: string) {
    const session = await this.prismaService.partnerSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.prismaService.partnerSession.update({
      where: { id },
      data: { isActive: false },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete a session
   */
  async remove(id: string) {
    const session = await this.prismaService.partnerSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prismaService.partnerSession.delete({
      where: { id },
    });

    return { message: 'Session deleted successfully' };
  }
}

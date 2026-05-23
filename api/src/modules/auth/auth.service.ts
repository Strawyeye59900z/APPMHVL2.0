import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { UserRole, JwtPayload } from '@condo/shared';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== UserRole.ADMIN) throw new UnauthorizedException();
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');
    return user;
  }

  async validateGate(gateId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { gateId } });
    if (!user || user.role !== UserRole.GATE) throw new UnauthorizedException();
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');
    return user;
  }

  async validateResident(apartmentNumber: string, password: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { number: apartmentNumber },
    });
    if (!apartment) throw new UnauthorizedException('Apartamento não encontrado');
    const valid = await bcrypt.compare(password, apartment.defaultPasswordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');
    return apartment;
  }

  signTokens(payload: JwtPayload) {
    const access = this.jwt.sign(payload, { expiresIn: '15m' });
    const refresh = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    return { access, refresh };
  }

  async login(dto: LoginDto) {
    if (dto.role === UserRole.ADMIN) {
      const user = await this.validateAdmin(dto.identifier, dto.password);
      const payload: JwtPayload = { sub: user.id, role: UserRole.ADMIN };
      const tokens = this.signTokens(payload);
      return { tokens, mustChangePassword: user.mustChangePassword, role: user.role };
    }

    if (dto.role === UserRole.GATE) {
      const user = await this.validateGate(dto.identifier, dto.password);
      const payload: JwtPayload = { sub: user.id, role: UserRole.GATE };
      const tokens = this.signTokens(payload);
      return { tokens, mustChangePassword: user.mustChangePassword, role: user.role };
    }

    if (dto.role === UserRole.RESIDENT) {
      const apt = await this.validateResident(dto.identifier, dto.password);
      const payload: JwtPayload = {
        sub: apt.number,
        role: UserRole.RESIDENT,
        apartmentId: apt.number,
      };
      const tokens = this.signTokens(payload);
      return { tokens, mustChangePassword: false, role: UserRole.RESIDENT };
    }

    throw new BadRequestException('Role inválido');
  }

  async changePassword(userId: string, role: UserRole, dto: ChangePasswordDto) {
    const hash = await bcrypt.hash(dto.newPassword, 10);

    if (role === UserRole.RESIDENT) {
      await this.prisma.apartment.update({
        where: { number: userId },
        data: { defaultPasswordHash: hash },
      });
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash, mustChangePassword: false },
    });
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const newPayload: JwtPayload = {
        sub: payload.sub,
        role: payload.role,
        apartmentId: payload.apartmentId,
      };
      return this.signTokens(newPayload);
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { SendVerificationDto } from './dto/send-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpPurpose } from '../generated/prisma/enums';

const OTP_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  private sign(user: { id: string; email: string; name: string | null; role: string }) {
    return {
      accessToken: this.jwt.sign({ sub: user.id, email: user.email }),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  private generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async sendVerification(dto: SendVerificationDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const code = this.generateCode();

    await this.prisma.otpCode.deleteMany({
      where: { email: dto.email, purpose: OtpPurpose.email_verification },
    });

    await this.prisma.otpCode.create({
      data: {
        email: dto.email,
        code,
        purpose: OtpPurpose.email_verification,
        pendingData: { name: dto.name ?? null, hashedPassword },
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await this.email.sendVerificationCode(dto.email, code);
    return { message: 'Verification code sent' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { email: dto.email, purpose: OtpPurpose.email_verification },
    });

    if (!otp || otp.code !== dto.code) throw new BadRequestException('Invalid code');
    if (otp.expiresAt < new Date()) throw new BadRequestException('Code expired');

    const { name, hashedPassword } = otp.pendingData as { name: string | null; hashedPassword: string };

    await this.prisma.otpCode.delete({ where: { id: otp.id } });

    const user = await this.usersService.create({ email: dto.email, password: hashedPassword, name });
    return this.sign(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.sign(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('User not found');

    const code = this.generateCode();

    await this.prisma.otpCode.deleteMany({
      where: { email: dto.email, purpose: OtpPurpose.password_reset },
    });

    await this.prisma.otpCode.create({
      data: {
        email: dto.email,
        code,
        purpose: OtpPurpose.password_reset,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await this.email.sendPasswordReset(dto.email, code);
    return { message: 'Reset code sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { email: dto.email, purpose: OtpPurpose.password_reset },
    });

    if (!otp || otp.code !== dto.code) throw new BadRequestException('Invalid code');
    if (otp.expiresAt < new Date()) throw new BadRequestException('Code expired');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { password: hashedPassword },
    });

    await this.prisma.otpCode.delete({ where: { id: otp.id } });
    return { message: 'Password reset successful' };
  }
}

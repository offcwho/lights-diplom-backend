import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationCode(email: string, code: string) {
    await this.send(email, 'Подтверждение email', this.verificationTemplate(code));
  }

  async sendPasswordReset(email: string, code: string) {
    await this.send(email, 'Сброс пароля', this.resetTemplate(code));
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
      throw err;
    }
  }

  private verificationTemplate(code: string) {
    return `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Подтверждение регистрации</h2>
        <p>Ваш код подтверждения:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px;background:#f5f5f5;border-radius:8px">${code}</div>
        <p style="color:#888;font-size:13px">Код действителен 10 минут.</p>
      </div>`;
  }

  private resetTemplate(code: string) {
    return `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Сброс пароля</h2>
        <p>Ваш код для сброса пароля:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px;background:#f5f5f5;border-radius:8px">${code}</div>
        <p style="color:#888;font-size:13px">Код действителен 10 минут. Если вы не запрашивали сброс пароля — проигнорируйте письмо.</p>
      </div>`;
  }
}

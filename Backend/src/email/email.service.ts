import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendInvitationEmail(email: string, name: string, token: string): Promise<void> {
    const redirectUrl = `${process.env.FRONTEND_URL}/login?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to IELTS Speaking AI App!',
      html: `
        <h2>Hello, ${name}!</h2>
        <p>Welcome to the IELTS Speaking AI App. Click the link below to access your account:</p>
        <a href="${redirectUrl}">Log in to your account</a>
        <p>This link contains a secure token that will automatically log you in.</p>
        <p>Best regards,<br/>IELTS Speaking AI Team</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
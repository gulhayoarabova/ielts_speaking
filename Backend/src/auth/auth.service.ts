import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async registerUser(dto: { email: string; password: string; name: string }) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      ...dto,
      password: hashed,
    });
    await this.emailService.sendInvitationEmail(user.email, user.name, this.generateToken(user));
    return user;
  }

  generateToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async validateGoogleUser(profile: any): Promise<any> {
    const user = await this.userService.findOrCreate({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
    });
    // Send invitation email after Google sign-in/sign-up
    await this.emailService.sendInvitationEmail(user.email, user.name, this.generateToken(user));
    return user;
  }
}
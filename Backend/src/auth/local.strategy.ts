import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // tells passport-local to expect "email" instead of "username"
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password); // ✅ fixed
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}

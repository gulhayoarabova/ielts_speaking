import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up with email and password' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created, returns JWT token and user data' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async signup(@Body() body: CreateUserDto) {
    const user = await this.authService.registerUser(body);
    const token = this.authService.generateToken(user);
    return { token, user };
  }

  @Post('signin')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Returns JWT token and user data' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signin(@Req() req) {
    const token = this.authService.generateToken(req.user);
    return { token, user: req.user };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth consent screen' })
  async googleAuth(@Req() req) { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Returns JWT token and user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  googleAuthRedirect(@Req() req) {
    const token = this.authService.generateToken(req.user);
    return { token, user: req.user };
  }
}
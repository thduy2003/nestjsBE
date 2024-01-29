import { LocalAuthGuard } from './local-auth.guard';
import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';
@ApiTags("auth")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private usersService: UsersService, 
    private roleService: RolesService
    ) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Post('/login')
  @ApiBody({type: UserLoginDto})
  @ResponseMessage('User login')
  async handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }
  @Public()
  @Post('/register')
  @ResponseMessage('Register a new user')
  async handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }
  @Get('/account')
  @ResponseMessage('Get user information')
  async handleGetAccount(@User() user: IUser) {
    const temp = await this.roleService.findOne(user.role._id) as any 
    user.permissions = temp.permissions
    return {
      user,
    };
  }
  @Public()
  @Get('/refresh')
  @ResponseMessage('Get user by refresh token')
  async handleRefreshToken(@Req() request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }
  @Post('/logout')
  @ResponseMessage('Logout user')
  async handleLogout(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(user, response);
  }
}

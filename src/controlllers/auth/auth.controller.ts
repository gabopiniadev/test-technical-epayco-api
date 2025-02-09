import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpException,
  Get,
  UseGuards,
  Request,
  HttpStatus, UseFilters,
} from '@nestjs/common';
import { AuthService } from '../../security/auth/services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { HttpExceptionFilter } from '../../exceptions/http-exception.filter';
import { RegisterDataDto } from '../../dto/customer.interface';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDataDto) {
    console.log(body);
    const { typeDocument, document, nameCustomer, phone, email, password } =
      body;

    if (
      !typeDocument ||
      !document ||
      !nameCustomer ||
      !phone ||
      !email ||
      !password
    ) {
      throw new BadRequestException('Todos los campos son requeridos.');
    }
    return await this.authService.register(body);
  }

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    const { email, password } = loginData;

    if (!email || !password) {
      throw new HttpException(
        'Email y contraseña son obligatorios',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.authService.login(email, password);
      return {
        status: 'success',
        message: 'Inicio de sesión exitoso',
        ...result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('info')
  async getProfileInfo(@Request() req: any) {
    const { document, phone } = req.user;

    if (!document || !phone) {
      throw new BadRequestException(
        'Documento y número de celular son obligatorios.',
      );
    }

    try {
      const result = await this.authService.getProfileInfo(document, phone);

      return {
        success: true,
        message: 'Saldo consultado exitosamente.',
        data: result,
      };
    } catch (error: any) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

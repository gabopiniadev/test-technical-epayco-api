import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  BadRequestException,
  Query,
  Headers, UseFilters,
} from '@nestjs/common';
import { WalletService } from '../../services/wallet/wallet.service';
import { AuthGuard } from '@nestjs/passport';
import { HttpExceptionFilter } from '../../exceptions/http-exception.filter';

@Controller('wallet')
@UseFilters(HttpExceptionFilter)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('recharge')
  async rechargeWallet(
    @Body() rechargeData: { document: string; phone: string; amount: number },
  ) {
    const { document, phone, amount } = rechargeData;

    if (!document || !phone || !amount || amount <= 0) {
      throw new HttpException(
        'Todos los campos son obligatorios y el monto debe ser mayor a 0.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.walletService.rechargeWallet(document, phone, amount);
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Ocurrió un error al procesar la recarga.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payment')
  async proxyInitiatePayment(@Request() req: any, @Body() paymentData: any) {
    try {
      console.log('Payload recibido red:', req.user);
      return await this.walletService.initiatePayment(
        paymentData,
        req.user.customer,
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error al procesar el pago',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payment/confirm')
  async confirmPayment(
    @Body() confirmData: { sessionId: string; confirmationCode: string },
  ) {
    const { sessionId, confirmationCode } = confirmData;

    if (!sessionId || !confirmationCode) {
      throw new HttpException(
        'El sessionId y el código de confirmación son obligatorios.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.walletService.confirmPayment(
        sessionId,
        confirmationCode,
      );
    } catch (error) {
      console.error('Error al confirmar el pago:', error.message);
      throw new HttpException(
        error.response?.data?.message || 'Error al confirmar el pago.',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('balance')
  async getBalance(@Request() req: any) {
    const { document, phone } = req.user;

    if (!document || !phone) {
      throw new BadRequestException(
        'Documento y número de celular son obligatorios.',
      );
    }

    try {
      const result = await this.walletService.getBalanceByDocumentAndPhone(
        document,
        phone,
      );
      return {
        success: true,
        message: 'Saldo consultado exitosamente.',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

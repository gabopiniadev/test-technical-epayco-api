import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request, UseFilters,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from '../../services/wallet/wallet.service';
import { AuthGuard } from '@nestjs/passport';

import { AppLogger } from '../../utils/logger/logger.service';
import { RechargeWalletDto } from '../../dto/recharge-wallet-dto.interface';
import { PaymentDto } from '../../dto/payment.interface';
import { ConfirmPaymentDto } from '../../dto/confirm-payment-dto.interface';
import { HttpExceptionFilter } from '../../exceptions/http-exception.filter';


@Controller('wallet')
@UseFilters(HttpExceptionFilter)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly logger: AppLogger,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('recharge')
  async rechargeWallet(@Body() rechargeData: RechargeWalletDto) {
    try {
      const data = await this.walletService.rechargeWallet(
        rechargeData.document,
        rechargeData.phone,
        rechargeData.amount,
      );
      return {
        success: true,
        message: 'Recarga realizada exitosamente.',
        data,
      };
    } catch (error) {
      this.logger.logError('Error al recargar billetera', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payment')
  async initiatePayment(
    @Request() req: any,
    @Body() paymentData: PaymentDto,
  ) {
    try {
      const data = await this.walletService.initiatePayment(
        paymentData,
        req.user.customer,
        req.user.username,
      );
      return {
        success: true,
        message: 'Pago iniciado correctamente.',
        data,
      };
    } catch (error) {
      this.logger.logError('Error al iniciar el pago', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('payment/confirm')
  async confirmPayment(@Body() confirmData: ConfirmPaymentDto) {
    try {
      const data = await this.walletService.confirmPayment(
        confirmData.sessionId,
        confirmData.confirmationCode,
      );
      return {
        success: true,
        message: 'Pago confirmado exitosamente.',
        data,
      };
    } catch (error) {
      this.logger.logError('Error al confirmar el pago', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('transactions/history')
  async getTransactions(@Request() req: any) {
    this.logger.logDebug('Obteniendo historial de transacciones...',  JSON.stringify(req.user, null, 2));
    try {
      const data = await this.walletService.getTransactionsByWallet(
        req.user.customer,
      );
      return {
        success: true,
        message: 'Historial de transacciones obtenido exitosamente.',
        data,
      };
    } catch (error) {
      this.logger.logError('Error al obtener el historial de transacciones', error);
      throw error;
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
      const data = await this.walletService.getBalanceByDocumentAndPhone(
        document,
        phone,
      );
      return {
        success: true,
        message: 'Saldo consultado exitosamente.',
        data,
      };
    } catch (error) {
      this.logger.logError('Error al consultar el saldo', error);
      throw error;
    }
  }
}

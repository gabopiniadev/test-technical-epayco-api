import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EmailService } from '../../utils/email/email.service';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../../config/endpoints';
import { AppLogger } from '../../utils/logger/logger.service';
import { PaymentDto } from '../../dto/payment.interface';

@Injectable()
export class WalletService {
  constructor(
    private readonly httpService: HttpService,
    private readonly emailService: EmailService,
    private readonly logger: AppLogger,
  ) {}

  async rechargeWallet(document: string, phone: string, amount: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(API_ENDPOINTS.RECHARGE_WALLET, {
          document,
          phone,
          amount,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.logError('Error al recargar billetera', error);
      throw new HttpException(
        error.response?.data?.message || ERROR_MESSAGES.DATABASE_CONNECTION,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async initiatePayment(
    paymentData: PaymentDto,
    customerId: string,
    username: string,
  ) {
    try {
      const paymentPayload = {
        ...paymentData,
        customerId,
      };

      const dbResponse = await firstValueFrom(
        this.httpService.post(API_ENDPOINTS.PAYMENT, paymentPayload),
      );

      if (!dbResponse || !dbResponse.data?.sessionId) {
        throw new HttpException(
          ERROR_MESSAGES.TRANSACTION_ERROR,
          HttpStatus.BAD_REQUEST,
        );
      }

      const { sessionId, confirmationCode, email } = dbResponse.data;

      if (email && confirmationCode) {
        await this.emailService.sendPaymentCode(
          username,
          sessionId,
          confirmationCode,
        );
      }

      return {
        sessionId,
        message: 'El cliente recibirá un correo electrónico.',
      };
    } catch (error) {
      this.logger.logError('Error al iniciar el flujo de pagos', error);
      throw error;
    }
  }

  async confirmPayment(sessionId: string, confirmationCode: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(API_ENDPOINTS.PAYMENT_CONFIRM, {
          sessionId,
          confirmationCode,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.logError('Error al confirmar el pago con la API DB', error);
      throw error;
    }
  }

  async getBalanceByDocumentAndPhone(document: string, phone: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(API_ENDPOINTS.BALANCE, {
          params: { document, phone },
        }),
      );
      return response.data.data;
    } catch (error) {
      this.logger.logError('Error al consultar el saldo desde la API DB', error);
      throw error;
    }
  }

  async getTransactionsByWallet(customer: string) {
    this.logger.logDebug("Custoomer", customer);
    try {
      const wallet = await firstValueFrom(
        this.httpService.get(API_ENDPOINTS.CUSTOMER_WALLET_INFO, {
          params: { customerId: customer },
        }),
      );

      this.logger.logDebug(
        'WalletService',
        JSON.stringify(wallet.data, null, 2)
      );

      const walletData = wallet.data.data[0];

      if(walletData.length === 0) {
        return [];
      }

      const transactions = await firstValueFrom(
        this.httpService.get(
          `${API_ENDPOINTS.WALLET_TRANSACTIONS}/${walletData._id}/payments`,
        ),
      );

      return transactions.data;
    } catch (error) {
      this.logger.logError(
        'Error al consultar las transacciones desde la API DB',
        error,
      );
      throw error;
    }
  }
}

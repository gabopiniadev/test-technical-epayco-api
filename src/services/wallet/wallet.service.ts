import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";
import {EmailService} from "../../utils/email/email.service";

@Injectable()
export class WalletService {

    private paymentDBServiceUrl = 'http://localhost:4000/api/db/wallet/payment';

    constructor(
        private readonly httpService: HttpService,
        private readonly emailService: EmailService
    ) {}

    async rechargeWallet(document: string, phone: string, amount: number) {
        const dbServiceUrl = 'http://localhost:4000/api/db/wallet/recharge';

        try {
            const response = await firstValueFrom(
                this.httpService.post(dbServiceUrl, { document, phone, amount }),
            );

            return response.data;
        } catch (error) {
            throw new HttpException(
                error.response?.data?.message || 'Error al conectar con el servicio de base de datos.',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async initiatePayment(paymentData: { document: string; phone: string; amount: number }, customerId: string) {
        try {
            const paymentPayload = {
                ...paymentData,
                customerId,
            };

            const dbResponse = await firstValueFrom(
                this.httpService.post(this.paymentDBServiceUrl, paymentPayload),
            );

            if (!dbResponse || !dbResponse.data?.sessionId) {
                throw new HttpException(
                    'Error al registrar la transacción en la base de datos.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const { sessionId, confirmationCode, email } = dbResponse.data;

            try {
                if (email && confirmationCode) {
                    await this.emailService.sendPaymentCode(email, sessionId, confirmationCode);
                } else {
                    console.warn('No se proporcionó email o código de confirmación para el envío de correo.');
                }
            } catch (emailError) {
                console.error('Error al enviar el correo:', emailError.message);
                throw new HttpException(
                    'No se pudo enviar el código de confirmación por correo.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                sessionId,
                message: 'El pago fue procesado correctamente. El cliente recibirá un correo electrónico.',
            };
        } catch (error) {
            console.error('Error en el flujo de pagos:', error.message);
            throw new HttpException(
                error.response?.data?.message || 'Ocurrió un error al procesar la solicitud.',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async confirmPayment(sessionId: string, confirmationCode: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:4000/api/db/wallet/payment/confirm', {
                    sessionId,
                    confirmationCode,
                }),
            );
            return response.data;
        } catch (error) {
            console.error('Error al confirmar pago con la API DB:', error.message);
            throw new HttpException(
                error.response?.data?.message || 'Error al confirmar el pago.',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getBalanceByDocumentAndPhone(
        document: string,
        phone: string,
    ): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get('http://localhost:4000/api/db/wallet/balance', {
                    params: { document, phone },
                }),
            );

            return response.data.data;
        } catch (error: any) {
            throw new HttpException(
                error.response?.data?.message ||
                'Hubo un error al consultar el saldo desde la API DB.',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


}
